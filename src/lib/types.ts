export interface Job {
  id: string;
  employer_name: string;
  phone: string;
  job_type: string;
  taluka: string;
  salary: string;
  description: string;
  workers_needed: number;
  created_at: string;
  is_active: boolean;
}

export interface JobType {
  id: string;
  name: string;
  created_at: string;
}
