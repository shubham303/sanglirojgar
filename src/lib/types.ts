export interface Job {
  id: string;
  employer_name: string;
  phone: string;
  job_type: string;
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
  id: string;
  name: string;
  created_at: string;
}
