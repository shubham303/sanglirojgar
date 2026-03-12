export interface JobFormData {
  employer_name: string;
  phone: string;
  job_type_id: string | number;
  district: string;
  taluka: string;
  salary: string;
  description?: string;
  minimum_education: string;
  experience_years: string;
  workers_needed: string | number;
  gender: string;
}

export interface JobFormErrors {
  employer_name?: string;
  phone?: string;
  job_type_id?: string;
  district?: string;
  taluka?: string;
  salary?: string;
  description?: string;
  minimum_education?: string;
  experience_years?: string;
  workers_needed?: string;
  gender?: string;
}

/** Returns errors as translation keys. Resolve with t() in components. */
export function validateJobForm(form: JobFormData): JobFormErrors {
  const errs: JobFormErrors = {};

  if (!form.employer_name || form.employer_name.trim().length < 2) {
    errs.employer_name = "validation.nameMin";
  }

  if (!form.phone || !/^\d{10}$/.test(form.phone)) {
    errs.phone = "validation.phoneDigits";
  }

  const jtId = typeof form.job_type_id === "string" ? parseInt(form.job_type_id) : form.job_type_id;
  if (!jtId || isNaN(jtId)) {
    errs.job_type_id = "validation.required";
  }

  if (!form.district) {
    errs.district = "validation.required";
  }

  if (!form.taluka) {
    errs.taluka = "validation.required";
  }

  const wn =
    typeof form.workers_needed === "number"
      ? form.workers_needed
      : parseInt(form.workers_needed);
  if (!form.workers_needed || isNaN(wn) || wn < 1) {
    errs.workers_needed = "validation.minWorkers";
  }

  return errs;
}

/** Returns the first error message, or null if valid. Used by API routes. */
export function getFirstValidationError(form: JobFormData): string | null {
  const errs = validateJobForm(form);
  const firstKey = Object.keys(errs)[0] as keyof JobFormErrors | undefined;
  if (!firstKey) return null;
  // API routes get Marathi errors (they're not user-facing in the same way)
  const keyMap: Record<string, string> = {
    "validation.nameMin": "नाव किमान 2 अक्षरे असणे आवश्यक आहे",
    "validation.phoneDigits": "फोन नंबर 10 अंकी असणे आवश्यक आहे",
    "validation.required": "हे क्षेत्र रिकामे ठेवता येणार नाही",
    "validation.minWorkers": "किमान 1 कामगार आवश्यक आहे",
  };
  const errKey = errs[firstKey]!;
  return keyMap[errKey] || errKey;
}
