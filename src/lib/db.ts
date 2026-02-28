import { Job, JobType } from "./types";

export interface DbResult<T> {
  data: T | null;
  error: string | null;
}

export interface JobFilters {
  page: number;
  limit: number;
  job_type?: string;
  taluka?: string;
  search?: string;
}

export interface PaginatedJobs {
  jobs: Job[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface AdminJobFilters extends JobFilters {
  phone?: string;
  is_active?: boolean;
}

export interface DbClient {
  getActiveJobsPaginated(filters: JobFilters): Promise<DbResult<PaginatedJobs>>;
  getAllJobsPaginated(filters: AdminJobFilters): Promise<DbResult<PaginatedJobs>>;
  getJobById(id: string): Promise<DbResult<Job>>;
  createJob(
    job: Omit<Job, "id" | "created_at" | "call_count" | "whatsapp_count">
  ): Promise<DbResult<Job>>;
  updateJob(id: string, job: Partial<Job>): Promise<DbResult<Job>>;
  softDeleteJob(id: string): Promise<{ error: string | null }>;
  hardDeleteJob(id: string): Promise<{ error: string | null }>;
  getActiveJobsByPhone(phone: string): Promise<DbResult<Job[]>>;
  getAllJobsByPhone(phone: string): Promise<DbResult<Job[]>>;
  getJobTypes(): Promise<DbResult<JobType[]>>;
  addJobType(name: string): Promise<DbResult<JobType>>;
  deleteJobType(id: string): Promise<{ error: string | null }>;
  incrementJobClick(id: string, field: "call_count" | "whatsapp_count"): Promise<{ error: string | null }>;
}

let _db: DbClient | null = null;

export function getDb(): DbClient {
  if (!_db) {
    const dbMode = process.env.DB_MODE || "supabase";

    if (dbMode === "local") {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { createLocalDb } = require("./db-local");
      _db = createLocalDb();
    } else {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { createSupabaseDb } = require("./db-supabase");
      _db = createSupabaseDb();
    }
  }
  return _db!;
}
