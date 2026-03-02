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

export function validateJobForm(form: JobFormData): JobFormErrors {
  const errs: JobFormErrors = {};

  if (!form.employer_name || form.employer_name.trim().length < 2) {
    errs.employer_name = "नाव किमान 2 अक्षरे असणे आवश्यक आहे";
  }

  if (!form.phone || !/^\d{10}$/.test(form.phone)) {
    errs.phone = "फोन नंबर 10 अंकी असणे आवश्यक आहे";
  }

  const jtId = typeof form.job_type_id === "string" ? parseInt(form.job_type_id) : form.job_type_id;
  if (!jtId || isNaN(jtId)) {
    errs.job_type_id = "हे क्षेत्र रिकामे ठेवता येणार नाही";
  }

  if (!form.district) {
    errs.district = "हे क्षेत्र रिकामे ठेवता येणार नाही";
  }

  if (!form.taluka) {
    errs.taluka = "हे क्षेत्र रिकामे ठेवता येणार नाही";
  }

  const wn =
    typeof form.workers_needed === "number"
      ? form.workers_needed
      : parseInt(form.workers_needed);
  if (!form.workers_needed || isNaN(wn) || wn < 1) {
    errs.workers_needed = "किमान 1 कामगार आवश्यक आहे";
  }

  return errs;
}

/** Returns the first error message, or null if valid. Used by API routes. */
export function getFirstValidationError(form: JobFormData): string | null {
  const errs = validateJobForm(form);
  const firstKey = Object.keys(errs)[0] as keyof JobFormErrors | undefined;
  return firstKey ? errs[firstKey]! : null;
}
