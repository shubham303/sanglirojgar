"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Job } from "@/lib/types";
import { formatDateMarathi } from "@/lib/utils";

export default function EmployerJobs() {
  const params = useParams();
  const phoneFromUrl = params.phone as string;

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
        माझ्या जाहिराती
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
          placeholder="10 अंकी फोन नंबर"
          className="flex-1 min-w-0 border border-gray-200 rounded-xl px-3 py-2.5 text-base focus:outline-none focus:border-[#FF6B00]"
        />
        <button
          type="submit"
          disabled={phone.length !== 10}
          className="px-4 py-2.5 rounded-xl text-base font-medium disabled:opacity-50 transition shrink-0"
          style={{ backgroundColor: "#FF6B00", color: "#ffffff" }}
        >
          शोधा
        </button>
      </form>

      {loading ? (
        <p className="text-center text-gray-400 text-base py-8">
          लोड होत आहे...
        </p>
      ) : searched && jobs.length === 0 ? (
        <p className="text-center text-gray-400 text-base py-8">
          या नंबरवर कोणतीही जाहिरात नोंदवलेली नाही
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
                    {job.job_type}
                  </h2>
                  {!job.is_active && (
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: "#fef2f2", color: "#dc2626" }}
                    >
                      बंद
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap mt-0.5">
                  {formatDateMarathi(job.created_at)}
                </span>
              </div>
              <div className="mt-1.5 space-y-0.5 text-sm text-gray-600">
                <p>
                  <span className="font-medium text-gray-500">ठिकाण:</span> {job.taluka}, {job.district || "सांगली"}
                </p>
                {job.description && (
                  <p className="text-gray-500">{job.description}</p>
                )}
                {(job.minimum_education || job.experience_years) && (
                  <p className="text-xs text-gray-500">
                    {[
                      job.minimum_education,
                      job.experience_years && (job.experience_years === "0" ? "अनुभव नाही" : `${job.experience_years} वर्षे अनुभव`),
                    ].filter(Boolean).join(" · ")}
                  </p>
                )}
                <p className="font-semibold text-gray-800">
                  ₹ {job.salary}
                </p>
                <p className="text-xs text-gray-400">
                  कामगार हवे: {job.workers_needed}
                </p>
                <p className="text-xs text-gray-400">
                  📞 {job.call_count ?? 0} कॉल &nbsp; 💬 {job.whatsapp_count ?? 0} WhatsApp
                </p>
              </div>

              <div className="flex flex-wrap gap-2 mt-3 pt-3" style={{ borderTop: "1px solid #f3f4f6" }}>
                {job.is_active ? (
                  <>
                    <Link
                      href={`/job/${job.id}/edit`}
                      className="px-3.5 py-1.5 rounded-lg text-sm font-medium transition"
                      style={{ backgroundColor: "#FF6B00", color: "#ffffff" }}
                    >
                      बदल करा
                    </Link>
                    <button
                      onClick={() => handleToggleActive(job.id, false)}
                      disabled={togglingId === job.id}
                      className="px-3.5 py-1.5 rounded-lg text-sm font-medium transition disabled:opacity-50"
                      style={{ backgroundColor: "#fef3c7", color: "#92400e" }}
                    >
                      {togglingId === job.id ? "..." : "बंद करा"}
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
                      {togglingId === job.id ? "..." : "पुन्हा सुरू करा"}
                    </button>
                    {confirmDeleteId === job.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">कायमचे काढायचे?</span>
                        <button
                          onClick={() => handleDelete(job.id)}
                          disabled={deletingId === job.id}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium"
                          style={{ backgroundColor: "#dc2626", color: "#ffffff" }}
                        >
                          हो
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-medium"
                        >
                          नाही
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(job.id)}
                        className="px-3.5 py-1.5 rounded-lg text-sm font-medium transition"
                        style={{ backgroundColor: "#fef2f2", color: "#b91c1c" }}
                      >
                        काढून टाका
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
