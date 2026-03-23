"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Job } from "@/lib/types";
import JobTypePicker from "@/app/components/JobTypePicker";
import { formatDateMarathi } from "@/lib/utils";
import { DISTRICTS, DISTRICT_TALUKAS, GENDERS } from "@/lib/constants";

const EDUCATION_OPTIONS = ["शिक्षण नाही", "10वी", "12वी", "ITI", "Graduate (पदवीधर)", "BA", "BSc", "BCom", "Engineer"];
const EXPERIENCE_OPTIONS = ["0", "1", "2", "3", "3+"];

interface EditForm {
  employer_name: string;
  job_type_id: string;
  district: string;
  taluka: string;
  salary: string;
  description: string;
  minimum_education: string;
  experience_years: string;
  workers_needed: string;
  gender: string;
  is_premium: boolean;
}

export default function AdminReviewPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  // Modals
  const [detailJob, setDetailJob] = useState<Job | null>(null);
  const [editJob, setEditJob] = useState<Job | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Confirm delete
  const [deleteJob, setDeleteJob] = useState<Job | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Auth check
  useEffect(() => {
    fetch("/api/admin/job-types")
      .then((res) => { if (res.ok) setIsLoggedIn(true); })
      .finally(() => setChecking(false));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoggingIn(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, password }),
      });
      if (res.ok) setIsLoggedIn(true);
      else {
        const data = await res.json();
        setLoginError(data.error || "लॉगिन अयशस्वी");
      }
    } catch {
      setLoginError("काहीतरी चूक झाली");
    } finally {
      setLoggingIn(false);
    }
  };

  const fetchJobs = useCallback(async (pageNum: number, append: boolean) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    try {
      const params = new URLSearchParams({
        is_reviewed: "false",
        is_deleted: "false",
        page: String(pageNum),
        limit: "50",
      });
      const res = await fetch(`/api/admin/jobs?${params}`);
      if (res.ok) {
        const data = await res.json();
        setJobs((prev) => {
          if (!append) return data.jobs;
          const seen = new Set(prev.map((j: Job) => j.id));
          return [...prev, ...data.jobs.filter((j: Job) => !seen.has(j.id))];
        });
        setTotal(data.total);
        setPage(data.page);
        setHasMore(data.hasMore);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) fetchJobs(1, false);
  }, [isLoggedIn, fetchJobs]);

  // Remove job from local list
  const removeJob = (id: string) => setJobs((prev) => prev.filter((j) => j.id !== id));

  const handleApprove = async (job: Job) => {
    const res = await fetch(`/api/admin/jobs/${job.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_reviewed: true }),
    });
    if (res.ok) removeJob(job.id);
  };

  const handleToggleActive = async (job: Job) => {
    const res = await fetch(`/api/admin/jobs/${job.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !job.is_active }),
    });
    if (res.ok) {
      const updated = await res.json();
      setJobs((prev) => prev.map((j) => (j.id === job.id ? updated : j)));
      if (detailJob?.id === job.id) setDetailJob(updated);
    }
  };

  const handleDelete = async () => {
    if (!deleteJob) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/jobs/${deleteJob.id}`, { method: "DELETE" });
    if (res.ok) {
      removeJob(deleteJob.id);
      if (detailJob?.id === deleteJob.id) setDetailJob(null);
    }
    setDeleting(false);
    setDeleteJob(null);
  };

  const openEdit = (job: Job) => {
    setEditJob(job);
    setEditForm({
      employer_name: job.employer_name || "",
      job_type_id: String(job.job_type_id),
      district: job.district,
      taluka: job.taluka,
      salary: job.salary,
      description: job.description || "",
      minimum_education: job.minimum_education || "12वी",
      experience_years: job.experience_years || "0",
      workers_needed: String(job.workers_needed),
      gender: job.gender,
      is_premium: !!job.is_premium,
    });
    setSaveError("");
  };

  const handleSaveEdit = async () => {
    if (!editJob || !editForm) return;
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch(`/api/admin/jobs/${editJob.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editForm,
          job_type_id: parseInt(editForm.job_type_id),
          workers_needed: parseInt(editForm.workers_needed) || 1,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setJobs((prev) => prev.map((j) => (j.id === editJob.id ? updated : j)));
        if (detailJob?.id === editJob.id) setDetailJob(updated);
        setEditJob(null);
        setEditForm(null);
      } else {
        const data = await res.json();
        setSaveError(data.error || "Save failed");
      }
    } finally {
      setSaving(false);
    }
  };

  if (checking) {
    return <p className="text-center text-gray-500 text-lg py-8">लोड होत आहे...</p>;
  }

  if (!isLoggedIn) {
    return (
      <div className="max-w-sm mx-auto mt-10">
        <div className="bg-white rounded-xl p-5" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <h1 className="text-xl font-bold text-gray-800 mb-5 text-center">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-3.5">
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="युजर आयडी"
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-base focus:outline-none focus:border-[#FF6B00]"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="पासवर्ड"
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-base focus:outline-none focus:border-[#FF6B00]"
            />
            {loginError && (
              <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-xl px-3 py-2">{loginError}</p>
            )}
            <button
              type="submit"
              disabled={loggingIn || !userId || !password}
              className="w-full text-base font-semibold py-3 rounded-xl transition disabled:opacity-50"
              style={{ backgroundColor: "#FF6B00", color: "#ffffff" }}
            >
              {loggingIn ? "लॉगिन होत आहे..." : "लॉगिन"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Job Review Queue</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {loading ? "लोड होत आहे..." : `${total} जाहिराती review साठी प्रलंबित`}
          </p>
        </div>
        <Link
          href="/admin"
          className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-500"
        >
          ← Admin
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm py-12 text-center">लोड होत आहे...</p>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">✅</div>
          <p className="text-gray-600 font-semibold">सर्व जाहिराती review झाल्या!</p>
          <p className="text-gray-400 text-sm mt-1">नवीन जाहिरात आल्यावर इथे दिसेल.</p>
        </div>
      ) : (
        <>
          {/* Scrollable table */}
          <div className="rounded-xl overflow-hidden border border-gray-200" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[900px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 whitespace-nowrap">तारीख</th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 whitespace-nowrap">नोकरी देणारे</th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 whitespace-nowrap">फोन</th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 whitespace-nowrap">काम</th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 whitespace-nowrap">ठिकाण</th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 whitespace-nowrap">पगार</th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 whitespace-nowrap">माहिती</th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 whitespace-nowrap">लिंग / जागा</th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {jobs.map((job) => (
                    <tr
                      key={job.id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      style={{ opacity: job.is_active ? 1 : 0.6 }}
                      onClick={() => setDetailJob(job)}
                    >
                      <td className="px-3 py-2.5 text-xs text-gray-500 whitespace-nowrap">
                        {formatDateMarathi(job.created_at)}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="font-semibold text-gray-800 text-xs">{job.employer_name || "—"}</span>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-gray-600 whitespace-nowrap">{job.phone}</td>
                      <td className="px-3 py-2.5">
                        <span
                          className="text-[11px] px-1.5 py-0.5 rounded font-medium whitespace-nowrap"
                          style={{ backgroundColor: "#fff7ed", color: "#c2410c" }}
                        >
                          {job.job_type_display}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-gray-600 whitespace-nowrap">
                        {job.taluka}, {job.district}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-gray-700 whitespace-nowrap">{job.salary}</td>
                      <td className="px-3 py-2.5 max-w-[220px]">
                        <p className="text-xs text-gray-600 truncate">{job.description || "—"}</p>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-gray-600 whitespace-nowrap">
                        {job.gender} / {job.workers_needed}
                      </td>
                      <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5">
                          {/* Approve */}
                          <button
                            onClick={() => handleApprove(job)}
                            title="Approve"
                            className="w-7 h-7 flex items-center justify-center rounded-lg transition hover:bg-green-100"
                            style={{ backgroundColor: "#f0fdf4" }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </button>
                          {/* Edit */}
                          <button
                            onClick={() => openEdit(job)}
                            title="Edit"
                            className="w-7 h-7 flex items-center justify-center rounded-lg transition hover:bg-blue-100"
                            style={{ backgroundColor: "#eff6ff" }}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          {/* Disable / Enable */}
                          <button
                            onClick={() => handleToggleActive(job)}
                            title={job.is_active ? "Disable" : "Enable"}
                            className="w-7 h-7 flex items-center justify-center rounded-lg transition"
                            style={{ backgroundColor: job.is_active ? "#fef2f2" : "#f0fdf4" }}
                          >
                            {job.is_active ? (
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                              </svg>
                            ) : (
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="16" />
                                <line x1="8" y1="12" x2="16" y2="12" />
                              </svg>
                            )}
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => setDeleteJob(job)}
                            title="Delete"
                            className="w-7 h-7 flex items-center justify-center rounded-lg transition hover:bg-red-100"
                            style={{ backgroundColor: "#fef2f2" }}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                              <path d="M10 11v6M14 11v6" />
                              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {hasMore && (
            <button
              onClick={() => fetchJobs(page + 1, true)}
              disabled={loadingMore}
              className="w-full mt-3 py-2.5 text-sm font-semibold rounded-xl transition disabled:opacity-50"
              style={{ backgroundColor: "#f3f4f6", color: "#374151" }}
            >
              {loadingMore ? "लोड होत आहे..." : "आणखी पहा"}
            </button>
          )}
        </>
      )}

      {/* ── Detail Modal ── */}
      {detailJob && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
          onClick={() => setDetailJob(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.18)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-3.5 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-base font-bold text-gray-800">जाहिरात तपशील</h2>
              <button onClick={() => setDetailJob(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <DetailRow label="नोकरी देणारे" value={detailJob.employer_name || "—"} />
              <DetailRow label="फोन" value={detailJob.phone || "—"} />
              <DetailRow label="कामाचा प्रकार" value={detailJob.job_type_display || String(detailJob.job_type_id)} highlight />
              <DetailRow label="ठिकाण" value={`${detailJob.taluka}, ${detailJob.district}`} />
              <DetailRow label="पगार" value={detailJob.salary} />
              <DetailRow label="लिंग" value={detailJob.gender} />
              <DetailRow label="आवश्यक जागा" value={String(detailJob.workers_needed)} />
              <DetailRow label="किमान शिक्षण" value={detailJob.minimum_education || "—"} />
              <DetailRow label="अनुभव" value={detailJob.experience_years ? `${detailJob.experience_years} वर्षे` : "—"} />
              <DetailRow label="तारीख" value={formatDateMarathi(detailJob.created_at)} />
              <DetailRow
                label="स्थिती"
                value={detailJob.is_active ? "सक्रिय" : "निष्क्रिय"}
                valueStyle={detailJob.is_active ? { color: "#15803d" } : { color: "#dc2626" }}
              />
              {detailJob.is_premium && <DetailRow label="Premium" value="हो" highlight />}
              {detailJob.tags && detailJob.tags.length > 0 && (
                <DetailRow label="Tags" value={detailJob.tags.join(", ")} />
              )}
              {detailJob.description && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">माहिती / वर्णन</p>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap bg-gray-50 rounded-lg px-3 py-2.5 leading-relaxed">
                    {detailJob.description}
                  </p>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => { setDetailJob(null); openEdit(detailJob); }}
                  className="flex-1 py-2.5 text-sm font-semibold rounded-xl"
                  style={{ backgroundColor: "#eff6ff", color: "#2563eb" }}
                >
                  संपादित करा
                </button>
                <button
                  onClick={() => handleApprove(detailJob).then(() => setDetailJob(null))}
                  className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white"
                  style={{ backgroundColor: "#16a34a" }}
                >
                  ✓ Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editJob && editForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
          onClick={() => { setEditJob(null); setEditForm(null); }}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto"
            style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.18)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-3.5 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-base font-bold text-gray-800">जाहिरात संपादित करा</h2>
              <button onClick={() => { setEditJob(null); setEditForm(null); }} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
            </div>
            <div className="px-5 py-4 space-y-3.5">
              {/* Employer name */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">नोकरी देणाऱ्याचे नाव</label>
                <input
                  value={editForm.employer_name}
                  onChange={(e) => setEditForm({ ...editForm, employer_name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              {/* Job type */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">कामाचा प्रकार</label>
                <JobTypePicker
                  value={editForm.job_type_id}
                  onChange={(val) => setEditForm({ ...editForm, job_type_id: val })}
                />
              </div>

              {/* District + Taluka */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">जिल्हा</label>
                  <select
                    value={editForm.district}
                    onChange={(e) => setEditForm({ ...editForm, district: e.target.value, taluka: "" })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#FF6B00]"
                  >
                    {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">तालुका</label>
                  <select
                    value={editForm.taluka}
                    onChange={(e) => setEditForm({ ...editForm, taluka: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#FF6B00]"
                  >
                    <option value="">निवडा</option>
                    {(DISTRICT_TALUKAS[editForm.district] || []).map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {/* Salary */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">पगार</label>
                <input
                  value={editForm.salary}
                  onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#FF6B00]"
                  placeholder="उदा. ₹15,000/महिना"
                />
              </div>

              {/* Gender + Workers */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">लिंग</label>
                  <select
                    value={editForm.gender}
                    onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#FF6B00]"
                  >
                    {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
                    <option value="both">दोन्ही (Both)</option>
                    <option value="male">पुरुष (Male)</option>
                    <option value="female">महिला (Female)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">जागा</label>
                  <input
                    type="number"
                    min="1"
                    value={editForm.workers_needed}
                    onChange={(e) => setEditForm({ ...editForm, workers_needed: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>
              </div>

              {/* Education + Experience */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">किमान शिक्षण</label>
                  <select
                    value={editForm.minimum_education}
                    onChange={(e) => setEditForm({ ...editForm, minimum_education: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#FF6B00]"
                  >
                    {EDUCATION_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">अनुभव (वर्षे)</label>
                  <select
                    value={editForm.experience_years}
                    onChange={(e) => setEditForm({ ...editForm, experience_years: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#FF6B00]"
                  >
                    {EXPERIENCE_OPTIONS.map((o) => <option key={o} value={o}>{o === "0" ? "अनुभव नाही" : `${o} वर्षे`}</option>)}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">माहिती / वर्णन</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#FF6B00] resize-none"
                  placeholder="जाहिरातीची माहिती"
                />
              </div>

              {/* Premium toggle */}
              <label className="flex items-center gap-2.5 cursor-pointer">
                <div
                  className="w-10 h-5 rounded-full relative transition-colors duration-200"
                  style={{ backgroundColor: editForm.is_premium ? "#FF6B00" : "#d1d5db" }}
                  onClick={() => setEditForm({ ...editForm, is_premium: !editForm.is_premium })}
                >
                  <div
                    className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200"
                    style={{ transform: editForm.is_premium ? "translateX(22px)" : "translateX(2px)" }}
                  />
                </div>
                <span className="text-sm text-gray-700">Premium जाहिरात</span>
              </label>

              {saveError && (
                <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">{saveError}</p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => { setEditJob(null); setEditForm(null); }}
                  className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-gray-200 text-gray-600"
                >
                  रद्द करा
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white transition disabled:opacity-50"
                  style={{ backgroundColor: "#FF6B00" }}
                >
                  {saving ? "सेव्ह होत आहे..." : "सेव्ह करा"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteJob && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
          onClick={() => setDeleteJob(null)}
        >
          <div
            className="bg-white rounded-2xl p-5 w-full max-w-sm"
            style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.18)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-base font-bold text-gray-800 mb-1">जाहिरात काढायची आहे का?</p>
            <p className="text-sm text-gray-600 mb-4">
              <span className="font-semibold">{deleteJob.employer_name}</span> यांची{" "}
              <span className="font-semibold">{deleteJob.job_type_display}</span> जाहिरात काढली जाईल.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteJob(null)}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-gray-200 text-gray-600"
              >
                रद्द करा
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white transition disabled:opacity-50"
                style={{ backgroundColor: "#dc2626" }}
              >
                {deleting ? "काढत आहे..." : "काढा"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({
  label,
  value,
  highlight,
  valueStyle,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  valueStyle?: React.CSSProperties;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-xs text-gray-500 w-32 shrink-0 pt-0.5">{label}</span>
      {highlight ? (
        <span
          className="text-xs px-1.5 py-0.5 rounded font-medium"
          style={{ backgroundColor: "#fff7ed", color: "#c2410c" }}
        >
          {value}
        </span>
      ) : (
        <span className="text-sm font-medium text-gray-800" style={valueStyle}>{value}</span>
      )}
    </div>
  );
}
