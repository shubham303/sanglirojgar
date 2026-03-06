export interface Job {
  id: string;
  employer_name?: string; // populated via JOIN from employers table
  phone: string;
  job_type_id: number;
  job_type_display?: string; // populated via JOIN: "मराठी (English)"
  state: string;
  district: string;
  taluka: string;
  salary: string;
  description: string;
  minimum_education: string;
  experience_years: string;
  workers_needed: number;
  gender: string;
  call_count: number;
  whatsapp_count: number;
  created_at: string;
  is_active: boolean;
  is_deleted: boolean;
  expires_at?: string;
  is_scraped?: boolean;
}

export interface Industry {
  id: number;
  name_mr: string;
  name_en: string;
}

export interface JobType {
  id: number;
  name_mr: string;
  name_en: string;
  industry_id: number;
}

export interface Employer {
  phone: string;
  employer_name: string;
  job_count: number;
  created_at?: string;
  last_contacted_by_admin_at?: string | null;
}

export interface DuplicateJobsResponse {
  error: string;
  code: "DUPLICATE_JOBS";
  duplicates: Job[];
}

export interface DailyClickStats {
  date: string; // YYYY-MM-DD
  call_count: number;
  whatsapp_count: number;
}
