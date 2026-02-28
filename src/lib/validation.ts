export interface JobFormData {
  employer_name: string;
  phone: string;
  job_type: string;
  taluka: string;
  salary: string;
  description?: string;
  workers_needed: string | number;
}

export interface JobFormErrors {
  employer_name?: string;
  phone?: string;
  job_type?: string;
  taluka?: string;
  salary?: string;
  description?: string;
  workers_needed?: string;
}

export function validateJobForm(form: JobFormData): JobFormErrors {
  const errs: JobFormErrors = {};

  if (!form.employer_name || form.employer_name.trim().length < 2) {
    errs.employer_name = "नाव किमान 2 अक्षरे असणे आवश्यक आहे";
  }

  if (!form.phone || !/^\d{10}$/.test(form.phone)) {
    errs.phone = "फोन नंबर 10 अंकी असणे आवश्यक आहे";
  }

  if (!form.job_type) {
    errs.job_type = "हे क्षेत्र रिकामे ठेवता येणार नाही";
  }

  if (!form.taluka) {
    errs.taluka = "हे क्षेत्र रिकामे ठेवता येणार नाही";
  }

  if (!form.salary || !String(form.salary).trim()) {
    errs.salary = "हे क्षेत्र रिकामे ठेवता येणार नाही";
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
