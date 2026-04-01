import { DISTRICT_TALUKAS } from "./constants";

interface RawJobBody {
  employer_name: string;
  phone?: string;
  email?: string;
  application_link?: string;
  job_type_id: string | number;
  district?: string;
  taluka: string;
  salary?: string;
  description?: string;
  minimum_education?: string;
  experience_years?: string;
  workers_needed: string | number;
  gender?: string;
  is_scraped?: boolean | string;
  last_date?: string | null;
  tags?: string[];
}

interface PreparedJobData {
  employer_name: string;
  phone?: string | null;
  email?: string | null;
  application_link?: string | null;
  job_type_id: number;
  state: string;
  district: string;
  taluka: string;
  salary: string;
  description: string;
  minimum_education: string;
  experience_years: string;
  workers_needed: number;
  gender: string;
  is_scraped?: boolean;
  last_date?: string | null;
  tags?: string[];
  [key: string]: unknown;
}

export function prepareJobData(body: RawJobBody): PreparedJobData {
  const data: PreparedJobData = {
    employer_name: body.employer_name.trim(),
    phone: body.phone || null,
    email: body.email ? body.email.trim().toLowerCase() : null,
    application_link: body.application_link ? body.application_link.trim() : null,
    job_type_id:
      typeof body.job_type_id === "string"
        ? parseInt(body.job_type_id)
        : body.job_type_id,
    state: "महाराष्ट्र" as const,
    district: body.district || "सांगली",
    taluka: body.taluka,
    salary: body.salary ? body.salary.trim() : "",
    description: body.description ? body.description.trim() : "",
    minimum_education: body.minimum_education || "",
    experience_years: body.experience_years || "",
    workers_needed:
      typeof body.workers_needed === "string"
        ? parseInt(body.workers_needed)
        : body.workers_needed,
    gender: body.gender || "both",
    last_date: body.last_date || null,
    tags: Array.isArray(body.tags) ? body.tags : [],
  };

  if (body.is_scraped !== undefined) {
    data.is_scraped =
      typeof body.is_scraped === "string"
        ? body.is_scraped === "true"
        : body.is_scraped;
  }

  return data;
}

export function validateTalukaDistrict(
  district: string,
  taluka: string
): string | null {
  const talukas = DISTRICT_TALUKAS[district];
  if (!talukas) {
    return `अवैध जिल्हा: ${district}`;
  }
  if (!talukas.includes(taluka)) {
    return `"${taluka}" हा तालुका "${district}" जिल्ह्यात नाही`;
  }
  return null;
}
