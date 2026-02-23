import { Job } from "./types";

export interface DbResult<T> {
  data: T | null;
  error: string | null;
}

export interface DbClient {
  getActiveJobs(): Promise<DbResult<Job[]>>;
  getJobById(id: string): Promise<DbResult<Job>>;
  createJob(
    job: Omit<Job, "id" | "created_at">
  ): Promise<DbResult<Job>>;
  updateJob(id: string, job: Partial<Job>): Promise<DbResult<Job>>;
  softDeleteJob(id: string): Promise<{ error: string | null }>;
  getActiveJobsByPhone(phone: string): Promise<DbResult<Job[]>>;
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
