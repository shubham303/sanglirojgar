"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ADMIN_PHONE, DISTRICTS, DISTRICT_TALUKAS, GENDERS } from "@/lib/constants";
import { useGroupedJobTypes } from "@/lib/useJobTypes";
import { validateJobForm, JobFormErrors } from "@/lib/validation";
import { trackEvent } from "@/lib/gtag";
import { Job } from "@/lib/types";
import { Field } from "./Field";
import { JobCardInfo } from "./JobCardInfo";
import JobTypePicker from "./JobTypePicker";

interface JobFormProps {
  mode: "create" | "edit";
  jobId?: string;
}

const EDUCATION_OPTIONS = ["शिक्षण नाही", "10वी", "12वी", "ITI", "Graduate (पदवीधर)", "BA", "BSc", "BCom", "Engineer"];
const EXPERIENCE_OPTIONS = ["0", "1", "2", "3", "3+"];

export default function JobForm({ mode, jobId }: JobFormProps) {
  const groupedJobTypes = useGroupedJobTypes();
  const [form, setForm] = useState({
    employer_name: "",
    phone: "",
    job_type_id: "",
    district: "सांगली",
    taluka: "",
    salary: "",
    description: "",
    minimum_education: "12वी",
    experience_years: "0",
    workers_needed: "",
    gender: "both",
  });
  const [errors, setErrors] = useState<JobFormErrors>({});
  const [loading, setLoading] = useState(mode === "edit");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [duplicateJobs, setDuplicateJobs] = useState<Job[]>([]);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);

  // Edit mode: load existing data
  useEffect(() => {
    if (mode === "edit" && jobId) {
      fetch(`/api/jobs/${jobId}`)
        .then((res) => res.json())
        .then((data) => {
          setForm({
            employer_name: data.employer_name || "",
            phone: data.phone || "",
            job_type_id: String(data.job_type_id || ""),
            district: data.district || "सांगली",
            taluka: data.taluka || "",
            salary: data.salary || "",
            description: data.description || "",
            minimum_education: data.minimum_education || "12वी",
            experience_years: data.experience_years || "0",
            workers_needed: String(data.workers_needed || ""),
            gender: data.gender || "both",
          });
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [mode, jobId]);

  const handleSubmit = async (e?: React.FormEvent, skipDuplicateCheck = false) => {
    if (e) e.preventDefault();
    const errs = validateJobForm(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    setSubmitError("");
    try {
      const url = mode === "create" ? "/api/jobs" : `/api/jobs/${jobId}`;
      const method = mode === "create" ? "POST" : "PUT";
      const payload: Record<string, unknown> = {
        ...form,
        job_type_id: parseInt(form.job_type_id),
        workers_needed: parseInt(form.workers_needed),
      };
      if (mode === "create" && skipDuplicateCheck) {
        payload.skip_duplicate_check = true;
      }
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        if (mode === "create") {
          trackEvent("job_posted", { job_type: form.job_type_id, district: form.district, taluka: form.taluka });
        }
        setSuccess(true);
      } else if (res.status === 409 && mode === "create") {
        const data = await res.json().catch(() => null);
        if (data?.code === "DUPLICATE_JOBS" && data.duplicates) {
          setDuplicateJobs(data.duplicates);
          setShowDuplicateWarning(true);
        } else {
          setSubmitError(data?.error || "जाहिरात नोंदवता आली नाही. कृपया पुन्हा प्रयत्न करा.");
        }
      } else {
        const data = await res.json().catch(() => null);
        setSubmitError(
          data?.error ||
            (mode === "create"
              ? "जाहिरात नोंदवता आली नाही. कृपया पुन्हा प्रयत्न करा."
              : "बदल जतन करता आले नाहीत. कृपया पुन्हा प्रयत्न करा.")
        );
      }
    } catch {
      setSubmitError("सर्व्हरशी संपर्क होऊ शकला नाही. कृपया पुन्हा प्रयत्न करा.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <p className="text-center text-gray-500 text-lg py-8">लोड होत आहे...</p>
    );
  }

  if (success) {
    return (
      <div className="text-center py-12">
        <div
          className="bg-white rounded-xl p-6 max-w-sm mx-auto"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
        >
          <p className="text-lg font-semibold mb-5" style={{ color: "#15803d" }}>
            {mode === "create"
              ? "तुमची जाहिरात यशस्वीरीत्या नोंदवली गेली!"
              : "बदल यशस्वीरीत्या जतन केले!"}
          </p>
          <div className="flex flex-col gap-2.5">
            <Link
              href={`/employer/${form.phone}`}
              className="text-sm font-semibold py-3 rounded-xl text-center transition block"
              style={{ backgroundColor: "#FF6B00", color: "#ffffff" }}
            >
              माझ्या जाहिराती {mode === "create" ? "पहा" : ""}
            </Link>
            {mode === "create" && (
              <Link
                href="/"
                className="text-sm py-2.5 rounded-xl text-center transition font-medium"
                style={{ color: "#6b7280" }}
              >
                मुख्य पानावर जा
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-800">
          {mode === "create" ? "नोकरी जाहिरात द्या" : "जाहिरात बदला"}
        </h1>
        {mode === "create" && (
          <p className="text-sm text-gray-400 mt-1">2 मिनिटांत मोफत जाहिरात — कोणतेही चार्जेस नाहीत</p>
        )}
      </div>

      {mode === "create" && (
        <a
          href={`https://wa.me/91${ADMIN_PHONE}?text=${encodeURIComponent("नमस्कार, मला जाहिरात देताना अडचण येत आहे.")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 mb-4 p-3 rounded-xl"
          style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}
        >
          <span
            className="w-9 h-9 flex items-center justify-center rounded-full shrink-0"
            style={{ backgroundColor: "#25D366" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
            </svg>
          </span>
          <p className="text-xs text-gray-600">
            जाहिरात देताना काही अडचण आल्यास, आम्हाला <span className="font-semibold" style={{ color: "#25D366" }}>WhatsApp</span> वर संपर्क करा
          </p>
        </a>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white rounded-xl p-4"
        style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
      >
        <Field label="नोकरी देणाऱ्याचे नाव" error={errors.employer_name}>
          <input
            type="text"
            value={form.employer_name}
            onChange={(e) =>
              setForm({ ...form, employer_name: e.target.value })
            }
            placeholder={mode === "create" ? "तुमचे नाव किंवा व्यवसायाचे नाव" : undefined}
            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-base focus:outline-none focus:border-[#FF6B00]"
          />
        </Field>

        <Field label="फोन नंबर" error={errors.phone}>
          <input
            type="tel"
            inputMode="numeric"
            value={form.phone}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              if (val.length <= 10) setForm({ ...form, phone: val });
            }}
            placeholder={mode === "create" ? "10 अंकी फोन नंबर" : undefined}
            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-base focus:outline-none focus:border-[#FF6B00]"
          />
        </Field>

        <Field label="कामाचा प्रकार" error={errors.job_type_id}>
          <JobTypePicker
            value={form.job_type_id}
            onChange={(val) => setForm({ ...form, job_type_id: val })}
            groupedJobTypes={groupedJobTypes}
          />
        </Field>

        <Field label="राज्य">
          <input
            type="text"
            value="महाराष्ट्र"
            readOnly
            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-base bg-gray-50 text-gray-500 cursor-not-allowed"
          />
        </Field>

        <Field label="जिल्हा" error={errors.district}>
          <select
            value={form.district}
            onChange={(e) => setForm({ ...form, district: e.target.value, taluka: "" })}
            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-base bg-white focus:outline-none focus:border-[#FF6B00]"
          >
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </Field>

        <Field label="तालुका" error={errors.taluka}>
          <select
            value={form.taluka}
            onChange={(e) => setForm({ ...form, taluka: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-base bg-white focus:outline-none focus:border-[#FF6B00]"
          >
            <option value="">-- निवडा --</option>
            {(DISTRICT_TALUKAS[form.district] || []).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>

        <Field label="कामाचे स्वरूप" error={errors.description}>
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            placeholder="कामाबद्दल थोडक्यात माहिती लिहा (ऐच्छिक)"
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-base focus:outline-none focus:border-[#FF6B00] resize-vertical"
          />
        </Field>

        <Field label="किमान शिक्षण" error={errors.minimum_education}>
          <select
            value={form.minimum_education}
            onChange={(e) => setForm({ ...form, minimum_education: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-base bg-white focus:outline-none focus:border-[#FF6B00]"
          >
            {EDUCATION_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </Field>

        <Field label="अनुभव (वर्षे)" error={errors.experience_years}>
          <select
            value={form.experience_years}
            onChange={(e) => setForm({ ...form, experience_years: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-base bg-white focus:outline-none focus:border-[#FF6B00]"
          >
            {EXPERIENCE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </Field>

        <Field label="पगार / मजुरी" error={errors.salary}>
          <input
            type="text"
            value={form.salary}
            onChange={(e) => setForm({ ...form, salary: e.target.value })}
            placeholder={mode === "create" ? "उदा. 500 रुपये प्रतिदिन" : undefined}
            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-base focus:outline-none focus:border-[#FF6B00]"
          />
        </Field>

        <Field label="लिंग" error={errors.gender}>
          <select
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-base bg-white focus:outline-none focus:border-[#FF6B00]"
          >
            {GENDERS.map((g) => (
              <option key={g} value={g === "पुरुष (Male)" ? "male" : g === "महिला (Female)" ? "female" : "both"}>
                {g}
              </option>
            ))}
          </select>
        </Field>

        <Field label="किती कामगार हवे" error={errors.workers_needed}>
          <input
            type="number"
            inputMode="numeric"
            value={form.workers_needed}
            onChange={(e) =>
              setForm({ ...form, workers_needed: e.target.value })
            }
            min="1"
            placeholder={mode === "create" ? "किमान 1" : undefined}
            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-base focus:outline-none focus:border-[#FF6B00]"
          />
        </Field>

        {submitError && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            {submitError}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full text-base font-semibold py-3.5 rounded-xl transition disabled:opacity-50"
          style={{ backgroundColor: "#FF6B00", color: "#ffffff" }}
        >
          {submitting
            ? (mode === "create" ? "नोंदवत आहे..." : "जतन होत आहे...")
            : (mode === "create" ? "जाहिरात नोंदवा" : "बदल जतन करा")}
        </button>

        {mode === "create" && (
          <div className="flex items-center justify-center gap-4 pt-2 text-xs text-gray-400">
            <span>100% मोफत</span>
            <span style={{ color: "#d1d5db" }}>|</span>
            <span>लॉगिन नाही</span>
            <span style={{ color: "#d1d5db" }}>|</span>
            <span>तात्काळ प्रकाशित</span>
          </div>
        )}
      </form>

      {showDuplicateWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-5" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.15)" }}>
            <h2 className="text-lg font-bold text-gray-800 mb-2">
              सारखी जाहिरात आधीच आहे
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              या फोन नंबरवर हाच कामाचा प्रकार आणि तालुका असलेली जाहिरात आधीच सक्रिय आहे. कृपया आधी तुमच्या जाहिराती तपासा.
            </p>

            <div className="space-y-3 mb-4">
              {duplicateJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-gray-50 rounded-lg p-3"
                  style={{ borderLeft: "3px solid #FF6B00" }}
                >
                  <JobCardInfo
                    job={job}
                    showDescription
                    truncateDescription
                    showEmployerName
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2.5">
              <Link
                href={`/employer/${form.phone}`}
                className="text-sm font-semibold py-3 rounded-xl text-center transition block"
                style={{ backgroundColor: "#FF6B00", color: "#ffffff" }}
              >
                माझ्या जाहिराती पहा आणि व्यवस्थापित करा
              </Link>
              <button
                onClick={() => {
                  setShowDuplicateWarning(false);
                  handleSubmit(undefined, true);
                }}
                disabled={submitting}
                className="text-sm font-medium py-2.5 rounded-xl text-center transition border border-gray-300 disabled:opacity-50"
                style={{ color: "#374151" }}
              >
                {submitting ? "नोंदवत आहे..." : "तरीही नवीन जाहिरात द्या"}
              </button>
              <button
                onClick={() => setShowDuplicateWarning(false)}
                className="text-sm py-2 rounded-xl text-center transition"
                style={{ color: "#6b7280" }}
              >
                रद्द करा
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
