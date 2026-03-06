import { getSupabase } from "./supabase";
import { AdminJobFilters, DbClient, JobFilters, PaginatedJobs } from "./db";
import { Job, JobType } from "./types";

/** Cached job type lookup from DB, refreshed on first use per server lifetime */
let _jobTypeLabelMap: Map<number, string> | null = null;

async function getJobTypeLabelMap(supabase: ReturnType<typeof getSupabase>): Promise<Map<number, string>> {
  if (_jobTypeLabelMap) return _jobTypeLabelMap;
  const { data } = await supabase
    .from("job_types")
    .select("id, name_mr, name_en")
    .order("id", { ascending: true });
  _jobTypeLabelMap = new Map<number, string>();
  if (data) {
    for (const jt of data as JobType[]) {
      _jobTypeLabelMap.set(jt.id, `${jt.name_mr} (${jt.name_en})`);
    }
  }
  return _jobTypeLabelMap;
}

/** Invalidate the cached map so next lookup re-reads from DB */
function invalidateJobTypeLabelMap() {
  _jobTypeLabelMap = null;
}

/** Resolve job_type_display from DB-backed map, falling back to constants */
function resolveJobTypeDisplay(labelMap: Map<number, string>, jobTypeId: number): string {
  return labelMap.get(jobTypeId) || `#${jobTypeId}`;
}

function addJobTypeDisplay(labelMap: Map<number, string>, row: Job): Job {
  return { ...row, job_type_display: resolveJobTypeDisplay(labelMap, row.job_type_id) };
}

function addJobTypeDisplayToList(labelMap: Map<number, string>, rows: Job[]): Job[] {
  return rows.map((r) => addJobTypeDisplay(labelMap, r));
}

/** Select string for jobs with employer name from employers table */
const JOBS_SELECT = "*, employers(name)";

/** Select string for jobs with employer name and click counts */
const JOBS_SELECT_WITH_CLICKS = "*, employers(name), job_clicks(click_type)";

/** Extract employer_name and click counts from Supabase relational query result */
function resolveEmployerName(row: Record<string, unknown>): Job {
  const { employers, job_clicks, ...rest } = row;
  const employerData = employers as { name: string } | null;
  // Compute click counts from joined job_clicks rows
  const clicks = (job_clicks as { click_type: string }[] | null) || [];
  let callCount = 0;
  let whatsappCount = 0;
  for (const c of clicks) {
    if (c.click_type === "call") callCount++;
    else if (c.click_type === "whatsapp") whatsappCount++;
  }
  return {
    ...rest,
    employer_name: employerData?.name ?? (rest.employer_name as string | undefined),
    call_count: callCount,
    whatsapp_count: whatsappCount,
  } as Job;
}

function resolveEmployerNames(rows: Record<string, unknown>[]): Job[] {
  return rows.map(resolveEmployerName);
}

export function createSupabaseDb(): DbClient {
  const supabase = getSupabase();

  return {
    async getActiveJobsPaginated(filters: JobFilters) {
      let query = supabase
        .from("jobs")
        .select(JOBS_SELECT_WITH_CLICKS, { count: "exact" })
        .eq("is_active", true)
        .eq("is_deleted", false)
        .gt("expires_at", new Date().toISOString());

      if (filters.job_type_id) {
        query = query.eq("job_type_id", filters.job_type_id);
      }
      if (filters.district) {
        query = query.eq("district", filters.district);
      }
      if (filters.taluka) {
        query = query.eq("taluka", filters.taluka);
      }
      if (filters.search) {
        query = query.or(
          `employer_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }

      const offset = (filters.page - 1) * filters.limit;
      query = query
        .order("created_at", { ascending: false })
        .range(offset, offset + filters.limit - 1);

      const { data, error, count } = await query;

      if (error) {
        return { data: null, error: error.message };
      }

      const total = count ?? 0;
      const labelMap = await getJobTypeLabelMap(supabase);
      const result: PaginatedJobs = {
        jobs: addJobTypeDisplayToList(labelMap, resolveEmployerNames((data as Record<string, unknown>[]) ?? [])),
        total,
        page: filters.page,
        limit: filters.limit,
        hasMore: offset + (data?.length ?? 0) < total,
      };
      return { data: result, error: null };
    },

    async getAllJobsPaginated(filters: AdminJobFilters) {
      let query = supabase
        .from("jobs")
        .select(JOBS_SELECT_WITH_CLICKS, { count: "exact" });

      if (filters.is_deleted !== undefined) {
        query = query.eq("is_deleted", filters.is_deleted);
      } else {
        query = query.eq("is_deleted", false);
      }
      if (filters.is_active !== undefined) {
        query = query.eq("is_active", filters.is_active);
      }
      if (filters.phone) {
        query = query.eq("phone", filters.phone);
      }
      if (filters.job_type_id) {
        query = query.eq("job_type_id", filters.job_type_id);
      }
      if (filters.district) {
        query = query.eq("district", filters.district);
      }
      if (filters.taluka) {
        query = query.eq("taluka", filters.taluka);
      }
      if (filters.search) {
        query = query.or(
          `employer_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`
        );
      }

      const offset = (filters.page - 1) * filters.limit;
      query = query
        .order("created_at", { ascending: false })
        .range(offset, offset + filters.limit - 1);

      const { data, error, count } = await query;

      if (error) {
        return { data: null, error: error.message };
      }

      const total = count ?? 0;
      const labelMap = await getJobTypeLabelMap(supabase);
      const jobs = addJobTypeDisplayToList(labelMap, resolveEmployerNames((data as Record<string, unknown>[]) ?? []));
      // Sort by click counts (computed from job_clicks) client-side
      jobs.sort((a, b) => {
        const aTotalClicks = a.call_count + a.whatsapp_count;
        const bTotalClicks = b.call_count + b.whatsapp_count;
        if (bTotalClicks !== aTotalClicks) return bTotalClicks - aTotalClicks;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      const result: PaginatedJobs = {
        jobs,
        total,
        page: filters.page,
        limit: filters.limit,
        hasMore: offset + (data?.length ?? 0) < total,
      };
      return { data: result, error: null };
    },

    async getJobById(id: string) {
      const { data, error } = await supabase
        .from("jobs")
        .select(JOBS_SELECT_WITH_CLICKS)
        .eq("id", id)
        .single();
      if (error) return { data: null, error: error.message };
      const labelMap = await getJobTypeLabelMap(supabase);
      return { data: addJobTypeDisplay(labelMap, resolveEmployerName(data as Record<string, unknown>)), error: null };
    },

    async createJob(job) {
      // Upsert employer before inserting job (idempotent)
      const { error: empErr } = await supabase
        .from("employers")
        .upsert({ phone: job.phone, name: job.employer_name }, { onConflict: "phone" });
      if (empErr) return { data: null, error: empErr.message };

      const { data, error } = await supabase
        .from("jobs")
        .insert(job)
        .select(JOBS_SELECT_WITH_CLICKS)
        .single();
      if (error) return { data: null, error: error.message };
      const labelMap = await getJobTypeLabelMap(supabase);
      return { data: addJobTypeDisplay(labelMap, resolveEmployerName(data as Record<string, unknown>)), error: null };
    },

    async updateJob(id: string, job: Partial<Job>) {
      const { job_type_display: _, employer_name: __, ...updateData } = job;
      const { data, error } = await supabase
        .from("jobs")
        .update(updateData)
        .eq("id", id)
        .select(JOBS_SELECT_WITH_CLICKS)
        .single();
      if (error) return { data: null, error: error.message };
      const labelMap = await getJobTypeLabelMap(supabase);
      return { data: addJobTypeDisplay(labelMap, resolveEmployerName(data as Record<string, unknown>)), error: null };
    },

    async softDeleteJob(id: string) {
      const { error } = await supabase
        .from("jobs")
        .update({ is_deleted: true })
        .eq("id", id);
      return { error: error?.message ?? null };
    },

    async hardDeleteJob(id: string) {
      const { error } = await supabase
        .from("jobs")
        .delete()
        .eq("id", id);
      return { error: error?.message ?? null };
    },

    async getActiveJobsByPhone(phone: string) {
      const { data, error } = await supabase
        .from("jobs")
        .select(JOBS_SELECT_WITH_CLICKS)
        .eq("phone", phone)
        .eq("is_active", true)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });
      if (error) return { data: null, error: error.message };
      const labelMap = await getJobTypeLabelMap(supabase);
      return { data: addJobTypeDisplayToList(labelMap, resolveEmployerNames((data as Record<string, unknown>[]) ?? [])), error: null };
    },

    async findDuplicateJobs(phone: string, job_type_id: number, taluka: string) {
      const { data, error } = await supabase
        .from("jobs")
        .select(JOBS_SELECT_WITH_CLICKS)
        .eq("phone", phone)
        .eq("job_type_id", job_type_id)
        .eq("taluka", taluka)
        .eq("is_active", true)
        .eq("is_deleted", false)
        .gt("expires_at", new Date().toISOString());
      if (error) return { data: null, error: error.message };
      const labelMap = await getJobTypeLabelMap(supabase);
      return { data: addJobTypeDisplayToList(labelMap, resolveEmployerNames((data as Record<string, unknown>[]) ?? [])), error: null };
    },

    async getAllJobsByPhone(phone: string) {
      const { data, error } = await supabase
        .from("jobs")
        .select(JOBS_SELECT_WITH_CLICKS)
        .eq("phone", phone)
        .eq("is_deleted", false)
        .order("is_active", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) return { data: null, error: error.message };
      const labelMap = await getJobTypeLabelMap(supabase);
      return { data: addJobTypeDisplayToList(labelMap, resolveEmployerNames((data as Record<string, unknown>[]) ?? [])), error: null };
    },

    async getJobTypes() {
      const { data, error } = await supabase
        .from("job_types")
        .select("id, name_mr, name_en, industry_id")
        .order("id", { ascending: true });
      return {
        data: data as import("./types").JobType[] | null,
        error: error?.message ?? null,
      };
    },

    async getIndustries() {
      const { data, error } = await supabase
        .from("industries")
        .select("id, name_mr, name_en")
        .order("id", { ascending: true });
      return {
        data: data as import("./types").Industry[] | null,
        error: error?.message ?? null,
      };
    },

    async addJobType(name: string) {
      const { data, error } = await supabase
        .from("job_types")
        .insert({ name_mr: name })
        .select()
        .single();
      if (!error) invalidateJobTypeLabelMap();
      return {
        data: data as import("./types").JobType | null,
        error: error?.message ?? null,
      };
    },

    async expireOldJobs() {
      const now = new Date().toISOString();

      // Find jobs that are active but past their expiry
      const { data: expiredJobs, error: selectErr } = await supabase
        .from("jobs")
        .select(JOBS_SELECT_WITH_CLICKS)
        .eq("is_active", true)
        .eq("is_deleted", false)
        .lt("expires_at", now);

      if (selectErr) return { data: null, error: selectErr.message };
      if (!expiredJobs || expiredJobs.length === 0) return { data: [], error: null };

      const resolved = resolveEmployerNames(expiredJobs as Record<string, unknown>[]);
      const ids = resolved.map((j) => j.id);
      const { error: updateErr } = await supabase
        .from("jobs")
        .update({ is_active: false })
        .in("id", ids);

      if (updateErr) return { data: null, error: updateErr.message };

      const labelMap = await getJobTypeLabelMap(supabase);
      return { data: addJobTypeDisplayToList(labelMap, resolved), error: null };
    },

    async upsertEmployer(phone: string, name: string) {
      const { data, error } = await supabase
        .from("employers")
        .upsert({ phone, name }, { onConflict: "phone" })
        .select()
        .single();
      if (error) return { data: null, error: error.message };
      return {
        data: { phone: data.phone, employer_name: data.name, job_count: 0, created_at: data.created_at } as import("./types").Employer,
        error: null,
      };
    },

    async getEmployers() {
      const { data, error } = await supabase
        .from("employers")
        .select("phone, name, created_at, last_contacted_by_admin_at, jobs(count)");

      if (error) {
        return { data: null, error: error.message };
      }

      const employers: import("./types").Employer[] = (data || []).map((row: Record<string, unknown>) => {
        const jobsData = row.jobs as { count: number }[] | null;
        return {
          phone: row.phone as string,
          employer_name: row.name as string,
          job_count: jobsData?.[0]?.count ?? 0,
          created_at: row.created_at as string | undefined,
          last_contacted_by_admin_at: row.last_contacted_by_admin_at as string | null | undefined,
        };
      });

      return { data: employers, error: null };
    },

    async updateEmployerLastContacted(phone: string) {
      const { error } = await supabase
        .from("employers")
        .update({ last_contacted_by_admin_at: new Date().toISOString() })
        .eq("phone", phone);
      return { error: error?.message ?? null };
    },

    async logJobClick(jobId: string, clickType: "call" | "whatsapp") {
      const { error } = await supabase
        .from("job_clicks")
        .insert({ job_id: jobId, click_type: clickType });
      return { error: error?.message ?? null };
    },

    async getDailyClickStats(days: number) {
      const sinceDate = new Date();
      sinceDate.setDate(sinceDate.getDate() - days);

      const { data, error } = await supabase
        .from("job_clicks")
        .select("click_type, created_at")
        .gte("created_at", sinceDate.toISOString())
        .order("created_at", { ascending: true });

      if (error) return { data: null, error: error.message };

      // Aggregate by date client-side (Supabase doesn't support GROUP BY in query builder)
      const map = new Map<string, { call_count: number; whatsapp_count: number }>();
      for (const row of data || []) {
        // Convert to IST date string
        const d = new Date(row.created_at as string);
        const istDate = new Date(d.getTime() + 5.5 * 60 * 60 * 1000).toISOString().split("T")[0];
        if (!map.has(istDate)) map.set(istDate, { call_count: 0, whatsapp_count: 0 });
        const entry = map.get(istDate)!;
        if (row.click_type === "call") entry.call_count++;
        else entry.whatsapp_count++;
      }

      const stats = Array.from(map.entries())
        .map(([date, counts]) => ({ date, ...counts }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return { data: stats, error: null };
    },

    async deleteJobType(id: string) {
      const numericId = parseInt(id);

      // Check if any active jobs use this type
      const { count, error: countErr } = await supabase
        .from("jobs")
        .select("id", { count: "exact", head: true })
        .eq("job_type_id", numericId)
        .eq("is_active", true)
        .eq("is_deleted", false);

      if (countErr) {
        return { error: countErr.message };
      }

      if (count && count > 0) {
        return {
          error: `हा प्रकार काढता येणार नाही — ${count} जाहिरात(ती) या प्रकारात आहेत`,
        };
      }

      const { error } = await supabase
        .from("job_types")
        .delete()
        .eq("id", numericId);
      if (!error) invalidateJobTypeLabelMap();
      return { error: error?.message ?? null };
    },
  };
}
