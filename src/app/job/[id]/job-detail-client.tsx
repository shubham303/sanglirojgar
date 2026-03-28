"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Job } from "@/lib/types";
import { formatDateMarathi, formatExperience } from "@/lib/utils";
import { trackEvent } from "@/lib/gtag";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { districtDisplayName, talukaDisplayName } from "@/lib/i18n/locations";
import { DEFAULT_CONTACT_PHONE } from "@/lib/constants";

export default function JobDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { t, lang } = useTranslation();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/jobs/${id}`)
      .then((res) => {
        if (!res.ok) {
          setNotFound(true);
          setLoading(false);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setJob(data);
          setLoading(false);
        }
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <p className="text-center text-gray-500 text-lg py-8">{t("jobs.loading")}</p>
    );
  }

  if (notFound || !job) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-600 mb-4">{t("detail.notFound")}</p>
        <Link
          href="/jobs"
          className="underline text-lg"
          style={{ color: "#FF6B00" }}
        >
          {t("detail.viewAll")}
        </Link>
      </div>
    );
  }

  const genderText = job.gender === "male" ? t("detail.male") : job.gender === "female" ? t("detail.female") : t("detail.both");

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="inline-block mb-3 text-sm font-medium cursor-pointer bg-transparent border-none p-0"
        style={{ color: "#FF6B00" }}
      >
        {t("detail.allJobs")}
      </button>

      <div
        className="bg-white rounded-xl p-4 sm:p-5"
        style={{ borderLeft: "4px solid #FF6B00", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
      >
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-xl font-bold" style={{ color: "#FF6B00" }}>
            {job.job_type_display}
          </h1>
          <div className="flex items-center gap-2 shrink-0 mt-1">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`नोकरी उपलब्ध — ${job.job_type_display} — ${job.taluka} — पगार: ${job.salary} — संपर्क: ${job.phone} — अधिक नोकऱ्यांसाठी पहा: www.mahajob.in`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center rounded-lg"
              style={{ width: 32, height: 32, backgroundColor: "#25D366" }}
              title={t("detail.shareTitle")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
            </a>
            <span className="text-xs text-gray-400 whitespace-nowrap">
              {formatDateMarathi(job.created_at, lang)}
            </span>
          </div>
        </div>

        <div className="mt-3 space-y-2.5 text-sm text-gray-700">
          <div className="flex items-baseline gap-2">
            <span className="font-medium text-gray-400 text-xs w-24 shrink-0">{t("detail.state")}</span>
            <p className="text-base">{lang === "en" ? "Maharashtra" : (job.state || "महाराष्ट्र")}</p>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-medium text-gray-400 text-xs w-24 shrink-0">{t("detail.district")}</span>
            <p className="text-base">{districtDisplayName(job.district || "सांगली", lang)}</p>
          </div>

          {job.taluka && job.taluka !== (job.district || "सांगली") && (
            <div className="flex items-baseline gap-2">
              <span className="font-medium text-gray-400 text-xs w-24 shrink-0">{t("detail.taluka")}</span>
              <p className="text-base">{talukaDisplayName(job.taluka, lang)}</p>
            </div>
          )}

          {job.description && (
            <div className="flex items-baseline gap-2">
              <span className="font-medium text-gray-400 text-xs w-24 shrink-0">{t("detail.workNature")}</span>
              <p className="text-base whitespace-pre-wrap">{job.description}</p>
            </div>
          )}

          {job.minimum_education && (
            <div className="flex items-baseline gap-2">
              <span className="font-medium text-gray-400 text-xs w-24 shrink-0">{t("detail.education")}</span>
              <p className="text-base">{job.minimum_education}</p>
            </div>
          )}

          {job.experience_years && (
            <div className="flex items-baseline gap-2">
              <span className="font-medium text-gray-400 text-xs w-24 shrink-0">{t("detail.experience")}</span>
              <p className="text-base">{formatExperience(job.experience_years, lang)}</p>
            </div>
          )}

          <div className="flex items-baseline gap-2">
            <span className="font-medium text-gray-400 text-xs w-24 shrink-0">{t("detail.salary")}</span>
            <p className="text-base font-semibold text-gray-800">₹ {job.salary}</p>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-medium text-gray-400 text-xs w-24 shrink-0">{t("detail.workersNeeded")}</span>
            <p className="text-base">{job.workers_needed}</p>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-medium text-gray-400 text-xs w-24 shrink-0">{t("detail.gender")}</span>
            <p className="text-base">{genderText}</p>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-medium text-gray-400 text-xs w-24 shrink-0">{t("detail.employer")}</span>
            <p className="text-base">{job.employer_name}</p>
          </div>
        </div>

        <p className="mt-4 text-xs text-gray-400 text-center">
          {t("detail.disclaimer")}
        </p>

        {/* Contact buttons — dynamic based on what the employer provided */}
        <div className="mt-3 flex flex-col gap-2.5">
          {(() => {
            const contactPhone = job.phone || DEFAULT_CONTACT_PHONE;
            return (
              <>
                <a
                  href={`tel:${contactPhone}`}
                  onClick={() => {
                    fetch(`/api/jobs/${id}/click`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ type: "call" }),
                    });
                    trackEvent("phone_click", { job_id: id, job_type: job.job_type_display, employer: job.employer_name });
                    trackEvent("job_contact", { job_id: id, contact_method: "phone", job_type: job.job_type_display, employer: job.employer_name, page: "job_detail" });
                  }}
                  className="text-base font-semibold py-3 rounded-xl transition text-center"
                  style={{ backgroundColor: "#16a34a", color: "#ffffff" }}
                >
                  {t("detail.call")} {contactPhone}
                </a>
                <a
                  href={`https://wa.me/91${contactPhone}?text=${encodeURIComponent(`नमस्कार, मी mahajob.in वर तुमची ${job.job_type_display} ची जाहिरात पाहिली. मला या नोकरीबद्दल अधिक माहिती हवी आहे.\n\nhttps://www.mahajob.in/job/${id}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    fetch(`/api/jobs/${id}/click`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ type: "whatsapp" }),
                    });
                    trackEvent("whatsapp_click", { job_id: id, job_type: job.job_type_display, employer: job.employer_name });
                    trackEvent("job_contact", { job_id: id, contact_method: "whatsapp", job_type: job.job_type_display, employer: job.employer_name, page: "job_detail" });
                  }}
                  className="text-base font-semibold py-3 rounded-xl transition text-center"
                  style={{ backgroundColor: "#25D366", color: "#ffffff" }}
                >
                  💬 WhatsApp
                </a>
              </>
            );
          })()}

          {job.email && (
            <a
              href={`mailto:${job.email}`}
              onClick={() => {
                trackEvent("job_contact", { job_id: id, contact_method: "email", job_type: job.job_type_display, employer: job.employer_name, page: "job_detail" });
              }}
              className="text-base font-semibold py-3 rounded-xl transition text-center"
              style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
            >
              {t("detail.email")}: {job.email}
            </a>
          )}

          {job.application_link && (
            <a
              href={job.application_link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                trackEvent("job_contact", { job_id: id, contact_method: "application_link", job_type: job.job_type_display, employer: job.employer_name, page: "job_detail" });
              }}
              className="text-base font-semibold py-3 rounded-xl transition text-center"
              style={{ backgroundColor: "#7c3aed", color: "#ffffff" }}
            >
              {t("detail.apply")}
            </a>
          )}
        </div>

        <div className="mt-3 text-center">
          <a
            href={`https://wa.me/919960739351?text=${encodeURIComponent(`Hi, I want to report a suspicious job listing on mahajob.in. Job ID: ${id} - ${job.job_type_display}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              fetch(`/api/jobs/${id}/report`, { method: "POST" });
              trackEvent("job_report", { job_id: id, job_type: job.job_type_display, employer: job.employer_name });
            }}
            className="text-xs text-red-400 hover:text-red-500 transition"
          >
            ⚠ Report this job
          </a>
        </div>
      </div>
    </div>
  );
}
