"use client";

import { useState, useEffect, useCallback } from "react";
import { Job, JobType } from "@/lib/types";
import { TALUKAS } from "@/lib/constants";
import { formatDateMarathi } from "@/lib/utils";

type AdminTab = "job_types" | "all_jobs";

interface PaginatedJobs {
  jobs: Job[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>("job_types");

  // Login form
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  // Job types
  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // All Jobs tab state
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsTotal, setJobsTotal] = useState(0);
  const [jobsPage, setJobsPage] = useState(1);
  const [jobsHasMore, setJobsHasMore] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filters
  const [filterJobType, setFilterJobType] = useState("");
  const [filterTaluka, setFilterTaluka] = useState("");
  const [filterPhone, setFilterPhone] = useState("");
  const [filterSearch, setFilterSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");

  // Check if already logged in by trying to fetch job types
  useEffect(() => {
    fetch("/api/admin/job-types")
      .then((res) => {
        if (res.ok) {
          setIsLoggedIn(true);
          return res.json();
        }
        return null;
      })
      .then((data) => {
        if (Array.isArray(data)) setJobTypes(data);
      })
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

      if (res.ok) {
        setIsLoggedIn(true);
        fetchJobTypes();
      } else {
        const data = await res.json();
        setLoginError(data.error || "लॉगिन अयशस्वी");
      }
    } catch {
      setLoginError("काहीतरी चूक झाली");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setIsLoggedIn(false);
    setJobTypes([]);
    setUserId("");
    setPassword("");
    setJobs([]);
  };

  const fetchJobTypes = async () => {
    setLoadingTypes(true);
    try {
      const res = await fetch("/api/admin/job-types");
      if (res.ok) {
        const data = await res.json();
        setJobTypes(Array.isArray(data) ? data : []);
      }
    } catch {
      // ignore
    } finally {
      setLoadingTypes(false);
    }
  };

  const fetchJobs = useCallback(async (page: number, append: boolean) => {
    if (append) setLoadingMore(true);
    else setLoadingJobs(true);

    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "20");
      if (filterJobType) params.set("job_type", filterJobType);
      if (filterTaluka) params.set("taluka", filterTaluka);
      if (filterPhone) params.set("phone", filterPhone);
      if (filterSearch) params.set("search", filterSearch);
      if (filterStatus === "active") params.set("is_active", "true");
      if (filterStatus === "inactive") params.set("is_active", "false");

      const res = await fetch(`/api/admin/jobs?${params.toString()}`);
      if (res.ok) {
        const data: PaginatedJobs = await res.json();
        setJobs((prev) => (append ? [...prev, ...data.jobs] : data.jobs));
        setJobsTotal(data.total);
        setJobsPage(data.page);
        setJobsHasMore(data.hasMore);
      }
    } catch {
      // ignore
    } finally {
      setLoadingJobs(false);
      setLoadingMore(false);
    }
  }, [filterJobType, filterTaluka, filterPhone, filterSearch, filterStatus]);

  // Fetch jobs when tab switches or filters change
  useEffect(() => {
    if (activeTab === "all_jobs" && isLoggedIn) {
      fetchJobs(1, false);
    }
  }, [activeTab, isLoggedIn, fetchJobs]);

  const handleAddType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;

    setAdding(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/admin/job-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTypeName.trim() }),
      });

      if (res.ok) {
        setNewTypeName("");
        setSuccessMsg("कामाचा प्रकार जोडला गेला!");
        fetchJobTypes();
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "जोडता आले नाही");
      }
    } catch {
      setError("काहीतरी चूक झाली");
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteType = async (id: string) => {
    setDeletingId(id);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/admin/job-types", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setSuccessMsg("कामाचा प्रकार काढला गेला!");
        fetchJobTypes();
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "काढता आले नाही");
      }
    } catch {
      setError("काहीतरी चूक झाली");
    } finally {
      setDeletingId(null);
    }
  };

  if (checking) {
    return (
      <p className="text-center text-gray-500 text-lg py-8">लोड होत आहे...</p>
    );
  }

  // Login form
  if (!isLoggedIn) {
    return (
      <div className="max-w-sm mx-auto mt-10">
        <div
          className="bg-white rounded-xl p-5"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
        >
          <h1 className="text-xl font-bold text-gray-800 mb-5 text-center">
            Admin Login
          </h1>

          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                युजर आयडी
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="युजर आयडी टाका"
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-base focus:outline-none focus:border-[#FF6B00]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                पासवर्ड
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="पासवर्ड टाका"
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-base focus:outline-none focus:border-[#FF6B00]"
              />
            </div>

            {loginError && (
              <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                {loginError}
              </p>
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

  // Admin dashboard
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
        <button
          onClick={handleLogout}
          className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-500 transition"
        >
          Logout
        </button>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 mb-4 bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setActiveTab("job_types")}
          className="flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition"
          style={
            activeTab === "job_types"
              ? { backgroundColor: "#ffffff", color: "#1f2937", boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }
              : { backgroundColor: "transparent", color: "#6b7280" }
          }
        >
          कामाचे प्रकार
        </button>
        <button
          onClick={() => setActiveTab("all_jobs")}
          className="flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition"
          style={
            activeTab === "all_jobs"
              ? { backgroundColor: "#ffffff", color: "#1f2937", boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }
              : { backgroundColor: "transparent", color: "#6b7280" }
          }
        >
          सर्व जाहिराती
        </button>
      </div>

      {/* Job Types Tab */}
      {activeTab === "job_types" && (
        <>
          {/* Add new job type */}
          <div
            className="bg-white rounded-xl p-4 mb-4"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
          >
            <h2 className="text-base font-bold text-gray-800 mb-3">
              नवीन कामाचा प्रकार जोडा
            </h2>

            <form onSubmit={handleAddType} className="flex gap-2">
              <input
                type="text"
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
                placeholder="उदा. पेंटर, टेलर..."
                className="flex-1 border border-gray-200 rounded-xl px-3.5 py-2.5 text-base focus:outline-none focus:border-[#FF6B00]"
              />
              <button
                type="submit"
                disabled={adding || !newTypeName.trim()}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 whitespace-nowrap"
                style={{ backgroundColor: "#FF6B00", color: "#ffffff" }}
              >
                {adding ? "..." : "जोडा"}
              </button>
            </form>

            {successMsg && (
              <p
                className="text-xs mt-2.5 px-3 py-2 rounded-lg"
                style={{ color: "#15803d", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}
              >
                {successMsg}
              </p>
            )}
            {error && (
              <p className="text-red-600 text-xs mt-2.5 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
          </div>

          {/* Job types list */}
          <div
            className="bg-white rounded-xl p-4"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
          >
            <h2 className="text-base font-bold text-gray-800 mb-3">
              कामाचे प्रकार ({jobTypes.length})
            </h2>

            {loadingTypes ? (
              <p className="text-gray-400 text-sm py-4">लोड होत आहे...</p>
            ) : jobTypes.length === 0 ? (
              <p className="text-gray-400 text-sm py-4">कोणतेही कामाचे प्रकार नाहीत</p>
            ) : (
              <div className="space-y-1.5">
                {jobTypes.map((jt) => (
                  <div
                    key={jt.id}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5"
                    style={{ backgroundColor: "#fafafa" }}
                  >
                    <span className="text-sm text-gray-800">{jt.name}</span>
                    <button
                      onClick={() => handleDeleteType(jt.id)}
                      disabled={deletingId === jt.id}
                      className="px-3 py-1.5 text-xs rounded-lg transition disabled:opacity-50 font-medium"
                      style={{
                        backgroundColor: "#fef2f2",
                        color: "#dc2626",
                      }}
                    >
                      {deletingId === jt.id ? "..." : "काढा"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* All Jobs Tab */}
      {activeTab === "all_jobs" && (
        <>
          {/* Filters */}
          <div
            className="bg-white rounded-xl p-4 mb-4"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
          >
            <div className="grid grid-cols-2 gap-2 mb-2">
              <select
                value={filterJobType}
                onChange={(e) => setFilterJobType(e.target.value)}
                className="border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:border-[#FF6B00]"
              >
                <option value="">सर्व कामे</option>
                {jobTypes.map((jt) => (
                  <option key={jt.id} value={jt.name}>{jt.name}</option>
                ))}
              </select>

              <select
                value={filterTaluka}
                onChange={(e) => setFilterTaluka(e.target.value)}
                className="border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:border-[#FF6B00]"
              >
                <option value="">सर्व तालुके</option>
                {TALUKAS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              <input
                type="text"
                value={filterPhone}
                onChange={(e) => setFilterPhone(e.target.value)}
                placeholder="फोन नंबर"
                className="border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:border-[#FF6B00]"
              />

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as "all" | "active" | "inactive")}
                className="border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:border-[#FF6B00]"
              >
                <option value="all">सर्व स्थिती</option>
                <option value="active">सक्रिय</option>
                <option value="inactive">निष्क्रिय</option>
              </select>
            </div>

            <input
              type="text"
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              placeholder="शोधा (नाव, वर्णन, कामाचा प्रकार...)"
              className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:border-[#FF6B00]"
            />
          </div>

          {/* Jobs count */}
          <p className="text-xs text-gray-500 mb-2 px-1">
            एकूण: {jobsTotal} जाहिराती
          </p>

          {/* Jobs list */}
          {loadingJobs ? (
            <p className="text-gray-400 text-sm py-8 text-center">लोड होत आहे...</p>
          ) : jobs.length === 0 ? (
            <p className="text-gray-400 text-sm py-8 text-center">कोणत्याही जाहिराती सापडल्या नाहीत</p>
          ) : (
            <div className="space-y-2">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-xl p-3.5"
                  style={{
                    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                    opacity: job.is_active ? 1 : 0.55,
                  }}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-bold text-gray-800 truncate">
                          {job.employer_name}
                        </span>
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                          style={
                            job.is_active
                              ? { backgroundColor: "#f0fdf4", color: "#15803d" }
                              : { backgroundColor: "#fef2f2", color: "#dc2626" }
                          }
                        >
                          {job.is_active ? "सक्रिय" : "निष्क्रिय"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{job.phone}</p>
                    </div>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded font-medium whitespace-nowrap"
                      style={{ backgroundColor: "#fff7ed", color: "#c2410c" }}
                    >
                      {job.job_type}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-gray-500 flex-wrap">
                    <span>{job.taluka}</span>
                    <span>{job.salary}</span>
                    <span>{formatDateMarathi(job.created_at)}</span>
                  </div>

                  {/* Click counts */}
                  <div className="flex items-center gap-3 mt-1.5 text-[11px]">
                    <span
                      className="px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: "#eff6ff", color: "#1d4ed8" }}
                    >
                      Call: {job.call_count}
                    </span>
                    <span
                      className="px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: "#f0fdf4", color: "#15803d" }}
                    >
                      WhatsApp: {job.whatsapp_count}
                    </span>
                  </div>
                </div>
              ))}

              {/* Load more */}
              {jobsHasMore && (
                <button
                  onClick={() => fetchJobs(jobsPage + 1, true)}
                  disabled={loadingMore}
                  className="w-full py-2.5 text-sm font-semibold rounded-xl transition disabled:opacity-50"
                  style={{ backgroundColor: "#f3f4f6", color: "#374151" }}
                >
                  {loadingMore ? "लोड होत आहे..." : "आणखी पहा"}
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
