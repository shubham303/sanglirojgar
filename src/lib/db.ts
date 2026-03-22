import { DailyClickStats, Employer, Industry, Job, JobCategory, JobSeeker, JobType, WhatsappOutreach } from "./types";

export interface DbResult<T> {
  data: T | null;
  error: string | null;
}

export interface JobFilters {
  page: number;
  limit: number;
  job_type_id?: number;
  district?: string;
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
  is_deleted?: boolean;
  is_reviewed?: boolean;
}

export interface DbClient {
  getActiveJobsPaginated(filters: JobFilters): Promise<DbResult<PaginatedJobs>>;
  getAllJobsPaginated(filters: AdminJobFilters): Promise<DbResult<PaginatedJobs>>;
  getJobById(id: string): Promise<DbResult<Job>>;
  createJob(
    job: Omit<Job, "id" | "created_at" | "call_count" | "whatsapp_count" | "report_count" | "job_type_display">
  ): Promise<DbResult<Job>>;
  updateJob(id: string, job: Partial<Job>): Promise<DbResult<Job>>;
  softDeleteJob(id: string): Promise<{ error: string | null }>;
  hardDeleteJob(id: string): Promise<{ error: string | null }>;
  getActiveJobsByPhone(phone: string): Promise<DbResult<Job[]>>;
  findDuplicateJobs(phone: string, job_type_id: number, taluka: string): Promise<DbResult<Job[]>>;
  getAllJobsByPhone(phone: string): Promise<DbResult<Job[]>>;
  getJobTypes(): Promise<DbResult<JobType[]>>;
  getIndustries(): Promise<DbResult<Industry[]>>;
  addJobType(name: string, name_en?: string, category_id?: number): Promise<DbResult<JobType>>;
  deleteJobType(id: string): Promise<{ error: string | null }>;
  addIndustry(name_mr: string, name_en: string): Promise<DbResult<Industry>>;
  deleteIndustry(id: string): Promise<{ error: string | null }>;
  expireOldJobs(): Promise<DbResult<Job[]>>;
  upsertEmployer(phone: string, name: string): Promise<DbResult<Employer>>;
  getEmployers(): Promise<DbResult<Employer[]>>;
  updateEmployerLastContacted(phone: string): Promise<{ error: string | null }>;
  logJobClick(jobId: string, clickType: "call" | "whatsapp"): Promise<{ error: string | null }>;
  reportJob(jobId: string): Promise<{ error: string | null }>;
  getDailyClickStats(days: number): Promise<DbResult<DailyClickStats[]>>;
  upsertJobSeeker(phone: string, name: string): Promise<{ error: string | null }>;
  getJobSeekers(): Promise<DbResult<JobSeeker[]>>;
  getJobSeekerByPhone(phone: string): Promise<DbResult<JobSeeker>>;
  updateJobSeeker(phone: string, name: string): Promise<DbResult<JobSeeker>>;
  deleteJobSeeker(phone: string): Promise<{ error: string | null }>;
  updateIndustry(id: number, name_mr: string, name_en: string): Promise<DbResult<Industry>>;
  updateJobType(id: number, fields: { name_mr?: string; name_en?: string; category_id?: number }): Promise<DbResult<JobType>>;
  createEmployer(phone: string, name: string): Promise<DbResult<Employer>>;
  getEmployerByPhone(phone: string): Promise<DbResult<Employer>>;
  updateEmployer(phone: string, name: string): Promise<DbResult<Employer>>;
  deleteEmployer(phone: string): Promise<{ error: string | null }>;
  getWhatsappOutreach(filters?: { page?: number; limit?: number; message_sent?: boolean }): Promise<DbResult<{ records: WhatsappOutreach[]; total: number }>>;
  getWhatsappOutreachById(id: string): Promise<DbResult<WhatsappOutreach>>;
  updateWhatsappOutreach(id: string, fields: Partial<Pick<WhatsappOutreach, "phone" | "source_group" | "message_sent" | "sent_date">>): Promise<DbResult<WhatsappOutreach>>;
  deleteWhatsappOutreach(id: string): Promise<{ error: string | null }>;
  getJobCategories(): Promise<DbResult<JobCategory[]>>;
  getJobCategoryById(id: number): Promise<DbResult<JobCategory>>;
  createJobCategory(name_en: string, name_mr: string, slug: string): Promise<DbResult<JobCategory>>;
  updateJobCategory(id: number, fields: Partial<Pick<JobCategory, "name_en" | "name_mr" | "slug">>): Promise<DbResult<JobCategory>>;
  deleteJobCategory(id: number): Promise<{ error: string | null }>;
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
