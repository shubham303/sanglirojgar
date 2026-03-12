"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Job } from "@/lib/types";
import { JobCardInfo } from "@/app/components/JobCardInfo";
import { trackEvent } from "@/lib/gtag";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export default function EmployerJobs() {
  const params = useParams();
  const phoneFromUrl = params.phone as string;
  const { t } = useTranslation();

  const [phone, setPhone] = useState(phoneFromUrl || "");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchJobs = async (phoneNum: string) => {
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/jobs/employer/${phoneNum}`);
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (phoneFromUrl && phoneFromUrl.length === 10) {
      fetchJobs(phoneFromUrl);
    }
  }, [phoneFromUrl]);

  const handleSearch = () => {
    if (phone.length === 10) {
      fetchJobs(phone);
    }
  };

  const handleToggleActive = async (id: string, newStatus: boolean) => {
    setTogglingId(id);
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: newStatus }),
      });
      if (res.ok) {
        const updatedJob = await res.json();
        if (newStatus === true) {
          trackEvent("job_reactivated", { job_id: id });
        }
        setJobs((prev) =>
          prev
            .map((j) => (j.id === id ? updatedJob : j))
            .sort((a, b) => {
              if (a.is_active !== b.is_active) return a.is_active ? -1 : 1;
              return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            })
        );
      }
    } catch {
      // ignore
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: "DELETE" });
      if (res.ok) {
        setJobs((prev) => prev.filter((j) => j.id !== id));
      }
    } catch {
      // ignore
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-3">
        {t("myAds.title")}
      </h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
        className="flex gap-2 mb-5"
      >
        <input
          type="tel"
          inputMode="numeric"
          value={phone}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "");
            if (val.length <= 10) setPhone(val);
          }}
          placeholder={t("form.phonePlaceholder")}
          className="flex-1 min-w-0 border border-gray-200 rounded-xl px-3 py-2.5 text-base focus:outline-none focus:border-[#FF6B00]"
        />
        <button
          type="submit"
          disabled={phone.length !== 10}
          className="px-4 py-2.5 rounded-xl text-base font-medium disabled:opacity-50 transition shrink-0"
          style={{ backgroundColor: "#FF6B00", color: "#ffffff" }}
        >
          {t("myAds.search")}
        </button>
      </form>

      {searched && !loading && jobs.length > 0 && (
        <div
          className="text-sm text-gray-600 rounded-xl px-4 py-3 mb-4"
          style={{ backgroundColor: "#eff6ff", borderLeft: "3px solid #93c5fd" }}
        >
          {t("myAds.expireNote")}
        </div>
      )}

      {loading ? (
        <p className="text-center text-gray-400 text-base py-8">
          {t("jobs.loading")}
        </p>
      ) : searched && jobs.length === 0 ? (
        <p className="text-center text-gray-400 text-base py-8">
          {t("myAds.noAds")}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-xl p-4"
              style={{
                borderLeft: `4px solid ${job.is_active ? "#FF6B00" : "#d1d5db"}`,
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                opacity: job.is_active ? 1 : 0.6,
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h2
                    className="text-base font-bold"
                    style={{ color: job.is_active ? "#FF6B00" : "#6b7280" }}
                  >
                    {job.job_type_display}
                  </h2>
                  {!job.is_active && (
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: "#fef2f2", color: "#dc2626" }}
                    >
                      {t("myAds.closed")}
                    </span>
                  )}
                </div>
              </div>
              <JobCardInfo
                job={job}
                hideHeader
                showDescription
                showWorkerCount
                showClickCounts
              />

              <div className="flex flex-wrap gap-2 mt-3 pt-3" style={{ borderTop: "1px solid #f3f4f6" }}>
                {job.is_active ? (
                  <>
                    <Link
                      href={`/job/${job.id}/edit`}
                      className="px-3.5 py-1.5 rounded-lg text-sm font-medium transition"
                      style={{ backgroundColor: "#FF6B00", color: "#ffffff" }}
                    >
                      {t("myAds.edit")}
                    </Link>
                    <button
                      onClick={() => handleToggleActive(job.id, false)}
                      disabled={togglingId === job.id}
                      className="px-3.5 py-1.5 rounded-lg text-sm font-medium transition disabled:opacity-50"
                      style={{ backgroundColor: "#fef3c7", color: "#92400e" }}
                    >
                      {togglingId === job.id ? "..." : t("myAds.deactivate")}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleToggleActive(job.id, true)}
                      disabled={togglingId === job.id}
                      className="px-3.5 py-1.5 rounded-lg text-sm font-medium transition disabled:opacity-50"
                      style={{ backgroundColor: "#dcfce7", color: "#15803d" }}
                    >
                      {togglingId === job.id ? "..." : t("myAds.reactivate")}
                    </button>
                    {confirmDeleteId === job.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{t("myAds.deleteConfirm")}</span>
                        <button
                          onClick={() => handleDelete(job.id)}
                          disabled={deletingId === job.id}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium"
                          style={{ backgroundColor: "#dc2626", color: "#ffffff" }}
                        >
                          {t("myAds.yes")}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-medium"
                        >
                          {t("myAds.no")}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(job.id)}
                        className="px-3.5 py-1.5 rounded-lg text-sm font-medium transition"
                        style={{ backgroundColor: "#fef2f2", color: "#b91c1c" }}
                      >
                        {t("myAds.delete")}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
