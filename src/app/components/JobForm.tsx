"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DISTRICTS, DISTRICT_TALUKAS, GENDERS } from "@/lib/constants";
import { useJobTypes } from "@/lib/useJobTypes";
import { validateJobForm, JobFormErrors } from "@/lib/validation";
import { Field } from "./Field";

interface JobFormProps {
  mode: "create" | "edit";
  jobId?: string;
}

const EDUCATION_OPTIONS = ["शिक्षण नाही", "10वी", "12वी", "ITI", "Graduate (पदवीधर)", "BA", "BSc", "BCom", "Engineer"];
const EXPERIENCE_OPTIONS = ["0", "1", "2", "3", "3+"];

export default function JobForm({ mode, jobId }: JobFormProps) {
  const jobTypeOptions = useJobTypes();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateJobForm(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    setSubmitError("");
    try {
      const url = mode === "create" ? "/api/jobs" : `/api/jobs/${jobId}`;
      const method = mode === "create" ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          job_type_id: parseInt(form.job_type_id),
          workers_needed: parseInt(form.workers_needed),
        }),
      });
      if (res.ok) {
        setSuccess(true);
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
      <h1 className="text-xl font-bold text-gray-800 mb-4">
        {mode === "create" ? "नोकरी जाहिरात द्या" : "जाहिरात बदला"}
      </h1>

      <form onSubmit={handleSubmit} className={`space-y-4${mode === "create" ? " pb-24" : ""}`}>
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
          <select
            value={form.job_type_id}
            onChange={(e) => setForm({ ...form, job_type_id: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-base bg-white focus:outline-none focus:border-[#FF6B00]"
          >
            <option value="">-- निवडा --</option>
            {jobTypeOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
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

        {mode === "create" ? (
          <div
            className="fixed bottom-0 left-0 right-0 px-4 py-3"
            style={{ backgroundColor: "#f5f5f5", boxShadow: "0 -1px 3px rgba(0,0,0,0.06)" }}
          >
            <div className="max-w-3xl mx-auto">
              <button
                type="submit"
                disabled={submitting}
                className="w-full text-base font-semibold py-3.5 rounded-xl transition disabled:opacity-50"
                style={{ backgroundColor: "#FF6B00", color: "#ffffff" }}
              >
                {submitting ? "नोंदवत आहे..." : "जाहिरात नोंदवा"}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="submit"
            disabled={submitting}
            className="w-full text-base font-semibold py-3.5 rounded-xl transition disabled:opacity-50"
            style={{ backgroundColor: "#FF6B00", color: "#ffffff" }}
          >
            {submitting ? "जतन होत आहे..." : "बदल जतन करा"}
          </button>
        )}
      </form>
    </div>
  );
}
