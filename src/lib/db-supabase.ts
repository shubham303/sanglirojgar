import { getSupabase } from "./supabase";
import { AdminJobFilters, DbClient, JobFilters, PaginatedJobs } from "./db";
import { Job, JobType } from "./types";
import { getJobTypeLabel } from "./constants";

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
  return labelMap.get(jobTypeId) || getJobTypeLabel(jobTypeId);
}

function addJobTypeDisplay(labelMap: Map<number, string>, row: Job): Job {
  return { ...row, job_type_display: resolveJobTypeDisplay(labelMap, row.job_type_id) };
}

function addJobTypeDisplayToList(labelMap: Map<number, string>, rows: Job[]): Job[] {
  return rows.map((r) => addJobTypeDisplay(labelMap, r));
}

export function createSupabaseDb(): DbClient {
  const supabase = getSupabase();

  return {
    async getActiveJobsPaginated(filters: JobFilters) {
      let query = supabase
        .from("jobs")
        .select("*", { count: "exact" })
        .eq("is_active", true);

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
        jobs: addJobTypeDisplayToList(labelMap, (data as Job[]) ?? []),
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
        .select("*", { count: "exact" });

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
      const result: PaginatedJobs = {
        jobs: addJobTypeDisplayToList(labelMap, (data as Job[]) ?? []),
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
        .select("*")
        .eq("id", id)
        .single();
      if (error) return { data: null, error: error.message };
      const labelMap = await getJobTypeLabelMap(supabase);
      return { data: addJobTypeDisplay(labelMap, data as Job), error: null };
    },

    async createJob(job) {
      const { data, error } = await supabase
        .from("jobs")
        .insert(job)
        .select()
        .single();
      if (error) return { data: null, error: error.message };
      const labelMap = await getJobTypeLabelMap(supabase);
      return { data: addJobTypeDisplay(labelMap, data as Job), error: null };
    },

    async updateJob(id: string, job: Partial<Job>) {
      const { job_type_display: _, ...updateData } = job;
      const { data, error } = await supabase
        .from("jobs")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();
      if (error) return { data: null, error: error.message };
      const labelMap = await getJobTypeLabelMap(supabase);
      return { data: addJobTypeDisplay(labelMap, data as Job), error: null };
    },

    async softDeleteJob(id: string) {
      const { error } = await supabase
        .from("jobs")
        .update({ is_active: false })
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
        .select("*")
        .eq("phone", phone)
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) return { data: null, error: error.message };
      const labelMap = await getJobTypeLabelMap(supabase);
      return { data: addJobTypeDisplayToList(labelMap, data as Job[]), error: null };
    },

    async getAllJobsByPhone(phone: string) {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("phone", phone)
        .order("is_active", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) return { data: null, error: error.message };
      const labelMap = await getJobTypeLabelMap(supabase);
      return { data: addJobTypeDisplayToList(labelMap, data as Job[]), error: null };
    },

    async getJobTypes() {
      const { data, error } = await supabase
        .from("job_types")
        .select("*")
        .order("id", { ascending: true });
      return {
        data: data as import("./types").JobType[] | null,
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

    async incrementJobClick(id: string, field: "call_count" | "whatsapp_count") {
      const { data: job, error: fetchErr } = await supabase
        .from("jobs")
        .select(field)
        .eq("id", id)
        .single();

      if (fetchErr || !job) {
        return { error: fetchErr?.message ?? "Job not found" };
      }

      const currentValue = (job as Record<string, number>)[field] ?? 0;
      const { error } = await supabase
        .from("jobs")
        .update({ [field]: currentValue + 1 })
        .eq("id", id);

      return { error: error?.message ?? null };
    },

    async getEmployers() {
      const { data, error } = await supabase
        .from("jobs")
        .select("phone, employer_name, created_at")
        .order("created_at", { ascending: true });

      if (error) {
        return { data: null, error: error.message };
      }

      const employerMap = new Map<string, { name: string; count: number }>();
      for (const row of data || []) {
        const existing = employerMap.get(row.phone);
        if (existing) {
          existing.count++;
        } else {
          employerMap.set(row.phone, { name: row.employer_name, count: 1 });
        }
      }

      const employers: import("./types").Employer[] = Array.from(
        employerMap.entries()
      ).map(([phone, { name, count }]) => ({
        phone,
        employer_name: name,
        job_count: count,
      }));

      return { data: employers, error: null };
    },

    async deleteJobType(id: string) {
      const numericId = parseInt(id);

      // Check if any active jobs use this type
      const { count, error: countErr } = await supabase
        .from("jobs")
        .select("id", { count: "exact", head: true })
        .eq("job_type_id", numericId)
        .eq("is_active", true);

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
