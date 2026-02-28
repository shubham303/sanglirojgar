"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { TALUKAS } from "@/lib/constants";
import { validateJobForm, JobFormErrors } from "@/lib/validation";

export default function EditJob() {
  const params = useParams();
  const id = params.id as string;

  const [form, setForm] = useState({
    employer_name: "",
    phone: "",
    job_type: "",
    taluka: "",
    salary: "",
    description: "",
    workers_needed: "",
  });
  const [errors, setErrors] = useState<JobFormErrors>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [jobTypes, setJobTypes] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      fetch(`/api/jobs/${id}`).then((res) => res.json()),
      fetch("/api/job-types").then((res) => res.json()),
    ])
      .then(([data, typesData]) => {
        setForm({
          employer_name: data.employer_name || "",
          phone: data.phone || "",
          job_type: data.job_type || "",
          taluka: data.taluka || "",
          salary: data.salary || "",
          description: data.description || "",
          workers_needed: String(data.workers_needed || ""),
        });
        setJobTypes(Array.isArray(typesData) ? typesData : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateJobForm(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          workers_needed: parseInt(form.workers_needed),
        }),
      });
      if (res.ok) {
        setSuccess(true);
      }
    } catch {
      // ignore
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
            बदल यशस्वीरीत्या जतन केले!
          </p>
          <Link
            href={`/employer/${form.phone}`}
            className="text-sm font-semibold py-3 rounded-xl text-center transition block"
            style={{ backgroundColor: "#FF6B00", color: "#ffffff" }}
          >
            माझ्या जाहिराती
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-4">जाहिरात बदला</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="नोकरी देणाऱ्याचे नाव" error={errors.employer_name}>
          <input
            type="text"
            value={form.employer_name}
            onChange={(e) =>
              setForm({ ...form, employer_name: e.target.value })
            }
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
            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-base focus:outline-none focus:border-[#FF6B00]"
          />
        </Field>

        <Field label="कामाचा प्रकार" error={errors.job_type}>
          <select
            value={form.job_type}
            onChange={(e) => setForm({ ...form, job_type: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-base bg-white focus:outline-none focus:border-[#FF6B00]"
          >
            <option value="">-- निवडा --</option>
            {jobTypes.map((type) => (
              <option key={type} value={type}>
                {type}
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
            {TALUKAS.map((t) => (
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

        <Field label="पगार / मजुरी" error={errors.salary}>
          <input
            type="text"
            value={form.salary}
            onChange={(e) => setForm({ ...form, salary: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-base focus:outline-none focus:border-[#FF6B00]"
          />
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
            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-base focus:outline-none focus:border-[#FF6B00]"
          />
        </Field>

        <button
          type="submit"
          disabled={submitting}
          className="w-full text-base font-semibold py-3.5 rounded-xl transition disabled:opacity-50"
          style={{ backgroundColor: "#FF6B00", color: "#ffffff" }}
        >
          {submitting ? "जतन होत आहे..." : "बदल जतन करा"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-500 mb-1">
        {label}
      </label>
      {children}
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
  );
}
