"use client";

import { useState } from "react";
import Link from "next/link";
import { JOB_TYPES, TALUKAS } from "@/lib/constants";

interface FormErrors {
  employer_name?: string;
  phone?: string;
  job_type?: string;
  taluka?: string;
  salary?: string;
  description?: string;
  workers_needed?: string;
}

export default function PostJob() {
  const [form, setForm] = useState({
    employer_name: "",
    phone: "",
    job_type: "",
    taluka: "",
    salary: "",
    description: "",
    workers_needed: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    if (!form.employer_name || form.employer_name.trim().length < 2) {
      errs.employer_name = "नाव किमान 2 अक्षरे असणे आवश्यक आहे";
    }
    if (!form.phone || form.phone.length !== 10) {
      errs.phone = "फोन नंबर 10 अंकी असणे आवश्यक आहे";
    }
    if (!form.job_type) {
      errs.job_type = "हे क्षेत्र रिकामे ठेवता येणार नाही";
    }
    if (!form.taluka) {
      errs.taluka = "हे क्षेत्र रिकामे ठेवता येणार नाही";
    }
    if (!form.salary || !form.salary.trim()) {
      errs.salary = "हे क्षेत्र रिकामे ठेवता येणार नाही";
    }
    const wn = parseInt(form.workers_needed);
    if (!form.workers_needed || isNaN(wn) || wn < 1) {
      errs.workers_needed = "किमान 1 कामगार आवश्यक आहे";
    }
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
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

  if (success) {
    return (
      <div className="text-center py-12">
        <p className="text-xl font-semibold mb-6" style={{ color: "#15803d" }}>
          तुमची जाहिरात यशस्वीरीत्या नोंदवली गेली!
        </p>
        <div className="flex flex-col gap-3 items-center">
          <Link
            href={`/employer/${form.phone}`}
            className="underline text-lg"
            style={{ color: "#FF6B00" }}
          >
            माझ्या जाहिराती पहा
          </Link>
          <Link href="/" className="underline text-base" style={{ color: "#4b5563" }}>
            मुख्य पानावर जा
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        नोकरी जाहिरात द्या
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5 pb-24">
        <Field label="नोकरी देणाऱ्याचे नाव" error={errors.employer_name}>
          <input
            type="text"
            value={form.employer_name}
            onChange={(e) =>
              setForm({ ...form, employer_name: e.target.value })
            }
            placeholder="तुमचे नाव किंवा व्यवसायाचे नाव"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-[#FF6B00]"
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
            placeholder="10 अंकी फोन नंबर"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-[#FF6B00]"
          />
        </Field>

        <Field label="कामाचा प्रकार" error={errors.job_type}>
          <select
            value={form.job_type}
            onChange={(e) => setForm({ ...form, job_type: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg bg-white focus:outline-none focus:border-[#FF6B00]"
          >
            <option value="">-- निवडा --</option>
            {JOB_TYPES.map((type) => (
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
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg bg-white focus:outline-none focus:border-[#FF6B00]"
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
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-[#FF6B00] resize-vertical"
          />
        </Field>

        <Field label="पगार / मजुरी" error={errors.salary}>
          <input
            type="text"
            value={form.salary}
            onChange={(e) => setForm({ ...form, salary: e.target.value })}
            placeholder="उदा. 500 रुपये प्रतिदिन"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-[#FF6B00]"
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
            placeholder="किमान 1"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-[#FF6B00]"
          />
        </Field>

        <div className="fixed bottom-0 left-0 right-0 border-t border-orange-100 px-4 py-3" style={{ backgroundColor: "#FFF9F2" }}>
          <div className="max-w-3xl mx-auto">
            <button
              type="submit"
              disabled={submitting}
              className="w-full text-lg font-semibold py-4 rounded-lg transition disabled:opacity-50"
              style={{ backgroundColor: "#FF6B00", color: "#ffffff" }}
            >
              {submitting ? "नोंदवत आहे..." : "जाहिरात नोंदवा"}
            </button>
          </div>
        </div>
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
      <label className="block text-lg font-medium text-gray-700 mb-1">
        {label}
      </label>
      {children}
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
}
