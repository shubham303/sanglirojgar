import { getSupabase } from "./supabase";
import { DbClient, JobFilters, PaginatedJobs } from "./db";
import { Job } from "./types";

export function createSupabaseDb(): DbClient {
  const supabase = getSupabase();

  return {
    async getActiveJobsPaginated(filters: JobFilters) {
      let query = supabase
        .from("jobs")
        .select("*", { count: "exact" })
        .eq("is_active", true);

      if (filters.job_type) {
        query = query.eq("job_type", filters.job_type);
      }
      if (filters.taluka) {
        query = query.eq("taluka", filters.taluka);
      }
      if (filters.search) {
        query = query.or(
          `employer_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,job_type.ilike.%${filters.search}%`
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
      const result: PaginatedJobs = {
        jobs: (data as Job[]) ?? [],
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
      return { data: data as Job | null, error: error?.message ?? null };
    },

    async createJob(job) {
      const { data, error } = await supabase
        .from("jobs")
        .insert(job)
        .select()
        .single();
      return { data: data as Job | null, error: error?.message ?? null };
    },

    async updateJob(id: string, job: Partial<Job>) {
      const { data, error } = await supabase
        .from("jobs")
        .update(job)
        .eq("id", id)
        .select()
        .single();
      return { data: data as Job | null, error: error?.message ?? null };
    },

    async softDeleteJob(id: string) {
      const { error } = await supabase
        .from("jobs")
        .update({ is_active: false })
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
      return { data: data as Job[] | null, error: error?.message ?? null };
    },

    async getJobTypes() {
      const { data, error } = await supabase
        .from("job_types")
        .select("*")
        .order("created_at", { ascending: true });
      return {
        data: data as import("./types").JobType[] | null,
        error: error?.message ?? null,
      };
    },

    async addJobType(name: string) {
      const { data, error } = await supabase
        .from("job_types")
        .insert({ name })
        .select()
        .single();
      return {
        data: data as import("./types").JobType | null,
        error: error?.message ?? null,
      };
    },

    async deleteJobType(id: string) {
      // First get the type name
      const { data: jobType, error: fetchErr } = await supabase
        .from("job_types")
        .select("name")
        .eq("id", id)
        .single();

      if (fetchErr || !jobType) {
        return { error: "कामाचा प्रकार सापडला नाही" };
      }

      // Check if any active jobs use this type
      const { count, error: countErr } = await supabase
        .from("jobs")
        .select("id", { count: "exact", head: true })
        .eq("job_type", jobType.name)
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
        .eq("id", id);
      return { error: error?.message ?? null };
    },
  };
}
