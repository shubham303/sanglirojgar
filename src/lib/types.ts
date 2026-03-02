export interface Job {
  id: string;
  employer_name: string;
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
}

export interface JobType {
  id: number;
  name_mr: string;
  name_en: string;
}

export interface Employer {
  phone: string;
  employer_name: string;
  job_count: number;
}
