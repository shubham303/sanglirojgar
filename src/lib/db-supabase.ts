import { getSupabase } from "./supabase";
import { DbClient } from "./db";
import { Job } from "./types";

export function createSupabaseDb(): DbClient {
  const supabase = getSupabase();

  return {
    async getActiveJobs() {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      return { data: data as Job[] | null, error: error?.message ?? null };
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
  };
}
