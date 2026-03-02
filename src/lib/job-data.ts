import { DISTRICT_TALUKAS } from "./constants";

interface RawJobBody {
  employer_name: string;
  phone: string;
  job_type_id: string | number;
  district?: string;
  taluka: string;
  salary?: string;
  description?: string;
  minimum_education?: string;
  experience_years?: string;
  workers_needed: string | number;
  gender?: string;
}

export function prepareJobData(body: RawJobBody) {
  return {
    employer_name: body.employer_name.trim(),
    phone: body.phone,
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
  };
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
