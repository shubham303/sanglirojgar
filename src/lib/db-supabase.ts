import { getSupabase } from "./supabase";
import { AdminJobFilters, DbClient, JobFilters, PaginatedJobs } from "./db";
import { Job, JobType } from "./types";

/** Cached job type lookup from DB, refreshed periodically */
let _jobTypeLabelMap: Map<number, string> | null = null;
/** Cached job type content fragments: "name_mr name_en" */
let _jobTypeContentMap: Map<number, string> | null = null;
/** Cached individual job type names for search */
let _jobTypeNameMap: Map<number, { name_mr: string; name_en: string }> | null = null;
let _jobTypeMapLastFetch = 0;
const JOB_TYPE_MAP_TTL_MS = 2 * 60 * 1000; // 2 minutes

async function getJobTypeLabelMap(supabase: ReturnType<typeof getSupabase>): Promise<Map<number, string>> {
  const now = Date.now();
  if (_jobTypeLabelMap && now - _jobTypeMapLastFetch < JOB_TYPE_MAP_TTL_MS) return _jobTypeLabelMap;
  const { data } = await supabase
    .from("job_types")
    .select("id, name_mr, name_en")
    .order("id", { ascending: true });
  _jobTypeLabelMap = new Map<number, string>();
  _jobTypeContentMap = new Map<number, string>();
  _jobTypeNameMap = new Map<number, { name_mr: string; name_en: string }>();
  _jobTypeMapLastFetch = Date.now();
  if (data) {
    for (const jt of data as JobType[]) {
      _jobTypeLabelMap.set(jt.id, `${jt.name_mr} (${jt.name_en})`);
      _jobTypeContentMap.set(jt.id, `${jt.name_mr} ${jt.name_en}`);
      _jobTypeNameMap.set(jt.id, { name_mr: jt.name_mr, name_en: jt.name_en });
    }
  }
  return _jobTypeLabelMap;
}

async function getJobTypeNameMap(supabase: ReturnType<typeof getSupabase>): Promise<Map<number, { name_mr: string; name_en: string }>> {
  const now = Date.now();
  if (_jobTypeNameMap && now - _jobTypeMapLastFetch < JOB_TYPE_MAP_TTL_MS) return _jobTypeNameMap;
  await getJobTypeLabelMap(supabase); // populates all maps
  return _jobTypeNameMap!;
}

async function getJobTypeContentMap(supabase: ReturnType<typeof getSupabase>): Promise<Map<number, string>> {
  const now = Date.now();
  if (_jobTypeContentMap && now - _jobTypeMapLastFetch < JOB_TYPE_MAP_TTL_MS) return _jobTypeContentMap;
  await getJobTypeLabelMap(supabase); // populates both maps
  return _jobTypeContentMap!;
}

/** Build the content string for trigram/ILIKE search */
function buildContentString(
  jobTypeContent: string,
  district: string,
  taluka: string,
  description: string,
  employerName: string,
  tags: string[] = []
): string {
  return [jobTypeContent, ...tags, district, taluka, description, employerName].filter(Boolean).join(" ");
}

/** Invalidate the cached map so next lookup re-reads from DB */
function invalidateJobTypeLabelMap() {
  _jobTypeLabelMap = null;
  _jobTypeContentMap = null;
  _jobTypeNameMap = null;
  _jobTypeMapLastFetch = 0;
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
      const nowISO = new Date().toISOString();

      /** Build a base query with shared filters (active, not deleted, not expired, district, taluka) */
      function baseQuery() {
        let q = supabase
          .from("jobs")
          .select(JOBS_SELECT_WITH_CLICKS, { count: "exact" })
          .eq("is_active", true)
          .eq("is_deleted", false)
          .gt("expires_at", nowISO);

        if (filters.district) q = q.eq("district", filters.district);
        if (filters.taluka) q = q.eq("taluka", filters.taluka);
        return q;
      }

      // --- job_type_id filter (existing behaviour) ---
      if (filters.job_type_id) {
        let query = baseQuery();
        const nameMap = await getJobTypeNameMap(supabase);
        const names = nameMap.get(filters.job_type_id);
        if (names) {
          query = query.or(
            `job_type_id.eq.${filters.job_type_id},content.ilike.%${names.name_en}%,content.ilike.%${names.name_mr}%`
          );
        } else {
          query = query.eq("job_type_id", filters.job_type_id);
        }
        if (filters.search) {
          query = query.ilike("content", `%${filters.search}%`);
        }
        const offset = (filters.page - 1) * filters.limit;
        query = query
          .order("is_premium", { ascending: false })
          .order("created_at", { ascending: false })
          .range(offset, offset + filters.limit - 1);

        const { data, error, count } = await query;
        if (error) return { data: null, error: error.message };
        const total = count ?? 0;
        const labelMap = await getJobTypeLabelMap(supabase);
        return {
          data: {
            jobs: addJobTypeDisplayToList(labelMap, resolveEmployerNames((data as Record<string, unknown>[]) ?? [])),
            total,
            page: filters.page,
            limit: filters.limit,
            hasMore: offset + (data?.length ?? 0) < total,
          } as PaginatedJobs,
          error: null,
        };
      }

      // --- Free-text search: prioritize exact job-type matches ---
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const nameMap = await getJobTypeNameMap(supabase);
        const matchingIds: number[] = [];
        for (const [id, names] of nameMap) {
          if (names.name_en.toLowerCase().includes(searchLower) || names.name_mr.includes(filters.search)) {
            matchingIds.push(id);
          }
        }

        if (matchingIds.length > 0) {
          const offset = (filters.page - 1) * filters.limit;

          // Q1: jobs whose job_type matches the search term
          const q1Count = baseQuery().in("job_type_id", matchingIds);
          const { count: q1Total, error: q1Err } = await q1Count;
          if (q1Err) return { data: null, error: q1Err.message };
          const tier1Count = q1Total ?? 0;

          let tier1Jobs: Record<string, unknown>[] = [];
          let tier2Jobs: Record<string, unknown>[] = [];

          if (offset < tier1Count) {
            // Need some (or all) rows from tier 1
            const q1 = baseQuery()
              .in("job_type_id", matchingIds)
              .order("is_premium", { ascending: false })
              .order("created_at", { ascending: false })
              .range(offset, offset + filters.limit - 1);
            const { data: d1, error: e1 } = await q1;
            if (e1) return { data: null, error: e1.message };
            tier1Jobs = (d1 as Record<string, unknown>[]) ?? [];

            // If tier 1 didn't fill the page, get remainder from tier 2
            const remaining = filters.limit - tier1Jobs.length;
            if (remaining > 0) {
              const q2 = baseQuery()
                .ilike("content", `%${filters.search}%`)
                .not("job_type_id", "in", `(${matchingIds.join(",")})`)
                .order("is_premium", { ascending: false })
                .order("created_at", { ascending: false })
                .range(0, remaining - 1);
              const { data: d2, error: e2 } = await q2;
              if (e2) return { data: null, error: e2.message };
              tier2Jobs = (d2 as Record<string, unknown>[]) ?? [];
            }
          } else {
            // Entirely in tier 2
            const tier2Offset = offset - tier1Count;
            const q2 = baseQuery()
              .ilike("content", `%${filters.search}%`)
              .not("job_type_id", "in", `(${matchingIds.join(",")})`)
              .order("is_premium", { ascending: false })
              .order("created_at", { ascending: false })
              .range(tier2Offset, tier2Offset + filters.limit - 1);
            const { data: d2, error: e2, count: c2 } = await q2;
            if (e2) return { data: null, error: e2.message };
            tier2Jobs = (d2 as Record<string, unknown>[]) ?? [];
          }

          // Get tier 2 total for combined count
          const { count: q2Total } = await baseQuery()
            .ilike("content", `%${filters.search}%`)
            .not("job_type_id", "in", `(${matchingIds.join(",")})`);
          const total = tier1Count + (q2Total ?? 0);
          const allJobs = [...tier1Jobs, ...tier2Jobs];

          const labelMap = await getJobTypeLabelMap(supabase);
          return {
            data: {
              jobs: addJobTypeDisplayToList(labelMap, resolveEmployerNames(allJobs)),
              total,
              page: filters.page,
              limit: filters.limit,
              hasMore: offset + allJobs.length < total,
            } as PaginatedJobs,
            error: null,
          };
        }

        // No job-type match — fall through to simple content search
        let query = baseQuery().ilike("content", `%${filters.search}%`);
        const offset = (filters.page - 1) * filters.limit;
        query = query
          .order("is_premium", { ascending: false })
          .order("created_at", { ascending: false })
          .range(offset, offset + filters.limit - 1);
        const { data, error, count } = await query;
        if (error) return { data: null, error: error.message };
        const total = count ?? 0;
        const labelMap = await getJobTypeLabelMap(supabase);
        return {
          data: {
            jobs: addJobTypeDisplayToList(labelMap, resolveEmployerNames((data as Record<string, unknown>[]) ?? [])),
            total,
            page: filters.page,
            limit: filters.limit,
            hasMore: offset + (data?.length ?? 0) < total,
          } as PaginatedJobs,
          error: null,
        };
      }

      // --- No search / no job_type_id: just list all active jobs ---
      let query = baseQuery();
      const offset = (filters.page - 1) * filters.limit;
      query = query
        .order("is_premium", { ascending: false })
        .order("created_at", { ascending: false })
        .range(offset, offset + filters.limit - 1);

      const { data, error, count } = await query;
      if (error) return { data: null, error: error.message };
      const total = count ?? 0;
      const labelMap = await getJobTypeLabelMap(supabase);
      return {
        data: {
          jobs: addJobTypeDisplayToList(labelMap, resolveEmployerNames((data as Record<string, unknown>[]) ?? [])),
          total,
          page: filters.page,
          limit: filters.limit,
          hasMore: offset + (data?.length ?? 0) < total,
        } as PaginatedJobs,
        error: null,
      };
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
      if (filters.is_reviewed !== undefined) {
        query = query.eq("is_reviewed", filters.is_reviewed);
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
      const result: PaginatedJobs = {
        jobs: addJobTypeDisplayToList(labelMap, resolveEmployerNames((data as Record<string, unknown>[]) ?? [])),
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
      // Upsert employer before inserting job (only when phone is provided)
      if (job.phone) {
        const { error: empErr } = await supabase
          .from("employers")
          .upsert({ phone: job.phone, name: job.employer_name }, { onConflict: "phone" });
        if (empErr) return { data: null, error: empErr.message };
      }

      // Compute content for trigram search
      const contentMap = await getJobTypeContentMap(supabase);
      const jobTypeContent = contentMap.get(job.job_type_id) || "";
      const content = buildContentString(
        jobTypeContent, job.district, job.taluka, job.description || "", job.employer_name || "", job.tags || []
      );

      const { data, error } = await supabase
        .from("jobs")
        .insert({ ...job, content })
        .select(JOBS_SELECT_WITH_CLICKS)
        .single();
      if (error) return { data: null, error: error.message };
      const labelMap = await getJobTypeLabelMap(supabase);
      return { data: addJobTypeDisplay(labelMap, resolveEmployerName(data as Record<string, unknown>)), error: null };
    },

    async updateJob(id: string, job: Partial<Job>) {
      const { job_type_display: _, employer_name: __, ...updateData } = job;

      // Recompute content if any content-relevant field changed
      const contentFields = ["job_type_id", "district", "taluka", "description", "tags"];
      if (contentFields.some((f) => f in job)) {
        const { data: current } = await supabase.from("jobs").select("*").eq("id", id).single();
        if (current) {
          const merged = { ...current, ...updateData };
          const contentMap = await getJobTypeContentMap(supabase);
          const jobTypeContent = contentMap.get(merged.job_type_id) || "";
          (updateData as Record<string, unknown>).content = buildContentString(
            jobTypeContent, merged.district, merged.taluka, merged.description || "", merged.employer_name || "", merged.tags || []
          );
        }
      }

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
        .select("id, name_mr, name_en, category_id")
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

    async addJobType(name: string, name_en?: string, category_id?: number) {
      const insertData: Record<string, unknown> = { name_mr: name };
      if (name_en) insertData.name_en = name_en;
      if (category_id) insertData.category_id = category_id;
      const { data, error } = await supabase
        .from("job_types")
        .insert(insertData)
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

    async reportJob(jobId: string) {
      const { error } = await supabase.rpc("increment_report_count", { job_id_input: jobId });
      if (error) {
        // Fallback: fetch current count and update
        const { data } = await supabase.from("jobs").select("report_count").eq("id", jobId).single();
        const current = data?.report_count ?? 0;
        const { error: updateErr } = await supabase.from("jobs").update({ report_count: current + 1 }).eq("id", jobId);
        return { error: updateErr?.message ?? null };
      }
      return { error: null };
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

    async upsertJobSeeker(phone: string, name: string) {
      const { error } = await supabase
        .from("job_seekers")
        .upsert({ phone, name }, { onConflict: "phone" });
      return { error: error?.message ?? null };
    },

    async updateJobType(id: number, fields: { name_mr?: string; name_en?: string; category_id?: number }) {
      const { data, error } = await supabase
        .from("job_types")
        .update(fields)
        .eq("id", id)
        .select()
        .single();
      if (!error) invalidateJobTypeLabelMap();
      return {
        data: data as import("./types").JobType | null,
        error: error?.message ?? null,
      };
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

    async addIndustry(name_mr: string, name_en: string) {
      const { data, error } = await supabase
        .from("industries")
        .insert({ name_mr, name_en })
        .select()
        .single();
      return {
        data: data as import("./types").Industry | null,
        error: error?.message ?? null,
      };
    },

    async updateIndustry(id: number, name_mr: string, name_en: string) {
      const { data, error } = await supabase
        .from("industries")
        .update({ name_mr, name_en })
        .eq("id", id)
        .select()
        .single();
      return {
        data: data as import("./types").Industry | null,
        error: error?.message ?? null,
      };
    },

    async deleteIndustry(id: string) {
      const numericId = parseInt(id);

      // Check if any job types use this industry
      const { count, error: countErr } = await supabase
        .from("job_types")
        .select("id", { count: "exact", head: true })
        .eq("industry_id", numericId);

      if (countErr) {
        return { error: countErr.message };
      }

      if (count && count > 0) {
        return {
          error: `हा उद्योग काढता येणार नाही — ${count} कामाचे प्रकार या उद्योगात आहेत`,
        };
      }

      const { error } = await supabase
        .from("industries")
        .delete()
        .eq("id", numericId);
      return { error: error?.message ?? null };
    },

    async getJobSeekers() {
      const { data, error } = await supabase
        .from("job_seekers")
        .select("phone, name, created_at, last_contacted_at")
        .order("created_at", { ascending: false });
      return {
        data: data as import("./types").JobSeeker[] | null,
        error: error?.message ?? null,
      };
    },

    async getJobSeekerByPhone(phone: string) {
      const { data, error } = await supabase
        .from("job_seekers")
        .select("phone, name, created_at, last_contacted_at")
        .eq("phone", phone)
        .single();
      return {
        data: data as import("./types").JobSeeker | null,
        error: error?.message ?? null,
      };
    },

    async updateJobSeeker(phone: string, name: string) {
      const { data, error } = await supabase
        .from("job_seekers")
        .update({ name })
        .eq("phone", phone)
        .select("phone, name, created_at, last_contacted_at")
        .single();
      return {
        data: data as import("./types").JobSeeker | null,
        error: error?.message ?? null,
      };
    },

    async deleteJobSeeker(phone: string) {
      const { error } = await supabase
        .from("job_seekers")
        .delete()
        .eq("phone", phone);
      return { error: error?.message ?? null };
    },

    async createEmployer(phone: string, name: string) {
      const { data, error } = await supabase
        .from("employers")
        .insert({ phone, name })
        .select("phone, name, created_at, last_contacted_by_admin_at, jobs(count)")
        .single();
      if (error) return { data: null, error: error.message };
      const row = data as Record<string, unknown>;
      const jobsData = row.jobs as { count: number }[] | null;
      return {
        data: {
          phone: row.phone as string,
          employer_name: row.name as string,
          job_count: jobsData?.[0]?.count ?? 0,
          created_at: row.created_at as string | undefined,
          last_contacted_by_admin_at: row.last_contacted_by_admin_at as string | null | undefined,
        } as import("./types").Employer,
        error: null,
      };
    },

    async getEmployerByPhone(phone: string) {
      const { data, error } = await supabase
        .from("employers")
        .select("phone, name, created_at, last_contacted_by_admin_at, jobs(count)")
        .eq("phone", phone)
        .single();
      if (error) return { data: null, error: error.message };
      const row = data as Record<string, unknown>;
      const jobsData = row.jobs as { count: number }[] | null;
      return {
        data: {
          phone: row.phone as string,
          employer_name: row.name as string,
          job_count: jobsData?.[0]?.count ?? 0,
          created_at: row.created_at as string | undefined,
          last_contacted_by_admin_at: row.last_contacted_by_admin_at as string | null | undefined,
        } as import("./types").Employer,
        error: null,
      };
    },

    async updateEmployer(phone: string, name: string) {
      const { data, error } = await supabase
        .from("employers")
        .update({ name })
        .eq("phone", phone)
        .select("phone, name, created_at, last_contacted_by_admin_at, jobs(count)")
        .single();
      if (error) return { data: null, error: error.message };
      const row = data as Record<string, unknown>;
      const jobsData = row.jobs as { count: number }[] | null;
      return {
        data: {
          phone: row.phone as string,
          employer_name: row.name as string,
          job_count: jobsData?.[0]?.count ?? 0,
          created_at: row.created_at as string | undefined,
          last_contacted_by_admin_at: row.last_contacted_by_admin_at as string | null | undefined,
        } as import("./types").Employer,
        error: null,
      };
    },

    async deleteEmployer(phone: string) {
      const { error } = await supabase
        .from("employers")
        .delete()
        .eq("phone", phone);
      return { error: error?.message ?? null };
    },

    async getWhatsappOutreach(filters?: { page?: number; limit?: number; message_sent?: boolean }) {
      const page = filters?.page ?? 1;
      const limit = filters?.limit ?? 50;
      const offset = (page - 1) * limit;

      let query = supabase
        .from("whatsapp_outreach")
        .select("id, phone, source_group, added_date, message_sent, sent_date", { count: "exact" })
        .order("added_date", { ascending: false });

      if (filters?.message_sent !== undefined) {
        query = query.eq("message_sent", filters.message_sent);
      }

      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;
      if (error) return { data: null, error: error.message };
      return {
        data: { records: (data ?? []) as import("./types").WhatsappOutreach[], total: count ?? 0 },
        error: null,
      };
    },

    async getWhatsappOutreachById(id: string) {
      const { data, error } = await supabase
        .from("whatsapp_outreach")
        .select("id, phone, source_group, added_date, message_sent, sent_date")
        .eq("id", id)
        .single();
      return {
        data: data as import("./types").WhatsappOutreach | null,
        error: error?.message ?? null,
      };
    },

    async updateWhatsappOutreach(id: string, fields: Partial<Pick<import("./types").WhatsappOutreach, "phone" | "source_group" | "message_sent" | "sent_date">>) {
      const { data, error } = await supabase
        .from("whatsapp_outreach")
        .update(fields)
        .eq("id", id)
        .select("id, phone, source_group, added_date, message_sent, sent_date")
        .single();
      return {
        data: data as import("./types").WhatsappOutreach | null,
        error: error?.message ?? null,
      };
    },

    async deleteWhatsappOutreach(id: string) {
      const { error } = await supabase
        .from("whatsapp_outreach")
        .delete()
        .eq("id", id);
      return { error: error?.message ?? null };
    },

    async getJobCategories() {
      const { data, error } = await supabase
        .from("job_categories")
        .select("id, name_en, name_mr, slug")
        .order("id", { ascending: true });
      return {
        data: data as import("./types").JobCategory[] | null,
        error: error?.message ?? null,
      };
    },

    async getJobCategoryById(id: number) {
      const { data, error } = await supabase
        .from("job_categories")
        .select("id, name_en, name_mr, slug")
        .eq("id", id)
        .single();
      return {
        data: data as import("./types").JobCategory | null,
        error: error?.message ?? null,
      };
    },

    async createJobCategory(name_en: string, name_mr: string, slug: string) {
      const { data, error } = await supabase
        .from("job_categories")
        .insert({ name_en, name_mr, slug })
        .select()
        .single();
      return {
        data: data as import("./types").JobCategory | null,
        error: error?.message ?? null,
      };
    },

    async updateJobCategory(id: number, fields: Partial<Pick<import("./types").JobCategory, "name_en" | "name_mr" | "slug">>) {
      const { data, error } = await supabase
        .from("job_categories")
        .update(fields)
        .eq("id", id)
        .select()
        .single();
      return {
        data: data as import("./types").JobCategory | null,
        error: error?.message ?? null,
      };
    },

    async deleteJobCategory(id: number) {
      const { count, error: countErr } = await supabase
        .from("job_types")
        .select("id", { count: "exact", head: true })
        .eq("category_id", id);

      if (countErr) return { error: countErr.message };

      if (count && count > 0) {
        return { error: `हा प्रकार काढता येणार नाही — ${count} कामाचे प्रकार या श्रेणीत आहेत` };
      }

      const { error } = await supabase
        .from("job_categories")
        .delete()
        .eq("id", id);
      return { error: error?.message ?? null };
    },
  };
}
