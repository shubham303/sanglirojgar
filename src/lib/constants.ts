import districtTalukasData from "./district-talukas.json";
import jobTypesData from "./job-types.json";

// Job types — single source of truth from job-types.json
export const JOB_TYPES = jobTypesData;

// Marathi-only names (used as form values, filter params, DB values)
export const JOB_TYPE_NAMES = jobTypesData.map((jt) => jt.marathi);

// Returns bilingual label: "मराठी (English)"
const jobTypeLabelMap = new Map<string, string>();
for (const jt of jobTypesData) {
  jobTypeLabelMap.set(jt.marathi, `${jt.marathi} (${jt.english})`);
}
export function getJobTypeLabel(name: string): string {
  return jobTypeLabelMap.get(name) || name;
}

export const GENDERS = ["पुरुष (Male)", "महिला (Female)", "दोन्ही (Both)"];

export const DISTRICT_TALUKAS: Record<string, string[]> = districtTalukasData;

export const DISTRICTS = Object.keys(DISTRICT_TALUKAS);

// Flat list of all talukas (for filters that show all)
export const TALUKAS = Object.values(DISTRICT_TALUKAS).flat();
