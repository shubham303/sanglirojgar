"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Job } from "@/lib/types";
import { Employer } from "@/lib/types";
import { DISTRICTS, DISTRICT_TALUKAS } from "@/lib/constants";
import { useJobTypes } from "@/lib/useJobTypes";
import { formatDateMarathi, formatLocation } from "@/lib/utils";

type AdminTab = "all_jobs" | "employers";

interface PaginatedJobs {
  jobs: Job[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export default function AdminPage() {
  const jobTypeOptions = useJobTypes();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>("all_jobs");

  // Login form
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  // All Jobs tab state
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsTotal, setJobsTotal] = useState(0);
  const [jobsPage, setJobsPage] = useState(1);
  const [jobsHasMore, setJobsHasMore] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filters
  const [filterJobType, setFilterJobType] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterTaluka, setFilterTaluka] = useState("");
  const [filterPhone, setFilterPhone] = useState("");
  const [filterSearch, setFilterSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");

  // Employers tab state
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [loadingEmployers, setLoadingEmployers] = useState(false);
  const [employerSearch, setEmployerSearch] = useState("");

  // Check if already logged in
  useEffect(() => {
    fetch("/api/admin/job-types")
      .then((res) => {
        if (res.ok) {
          setIsLoggedIn(true);
        }
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
    setUserId("");
    setPassword("");
    setJobs([]);
    setEmployers([]);
  };

  const fetchJobs = useCallback(async (page: number, append: boolean) => {
    if (append) setLoadingMore(true);
    else setLoadingJobs(true);

    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "20");
      if (filterJobType) params.set("job_type_id", filterJobType);
      if (filterDistrict) params.set("district", filterDistrict);
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
  }, [filterJobType, filterDistrict, filterTaluka, filterPhone, filterSearch, filterStatus]);

  const fetchEmployers = useCallback(async () => {
    setLoadingEmployers(true);
    try {
      const res = await fetch("/api/admin/employers");
      if (res.ok) {
        const data = await res.json();
        setEmployers(Array.isArray(data) ? data : []);
      }
    } catch {
      // ignore
    } finally {
      setLoadingEmployers(false);
    }
  }, []);

  // Fetch data when tab switches
  useEffect(() => {
    if (!isLoggedIn) return;
    if (activeTab === "all_jobs") {
      fetchJobs(1, false);
    } else if (activeTab === "employers") {
      fetchEmployers();
    }
  }, [activeTab, isLoggedIn, fetchJobs, fetchEmployers]);

  const filteredEmployers = employerSearch
    ? employers.filter(
        (emp) =>
          emp.employer_name.toLowerCase().includes(employerSearch.toLowerCase()) ||
          emp.phone.includes(employerSearch)
      )
    : employers;

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
        <button
          onClick={() => setActiveTab("employers")}
          className="flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition"
          style={
            activeTab === "employers"
              ? { backgroundColor: "#ffffff", color: "#1f2937", boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }
              : { backgroundColor: "transparent", color: "#6b7280" }
          }
        >
          नोकरी देणारे
        </button>
      </div>

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
                {jobTypeOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>

              <select
                value={filterDistrict}
                onChange={(e) => { setFilterDistrict(e.target.value); setFilterTaluka(""); }}
                className="border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:border-[#FF6B00]"
              >
                <option value="">सर्व जिल्हे</option>
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              {filterDistrict ? (
                <select
                  value={filterTaluka}
                  onChange={(e) => setFilterTaluka(e.target.value)}
                  className="border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:border-[#FF6B00]"
                >
                  <option value="">सर्व तालुके</option>
                  {(DISTRICT_TALUKAS[filterDistrict] || []).map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              ) : (
                <select
                  disabled
                  className="border border-gray-200 rounded-lg px-2.5 py-2 text-sm bg-gray-50 text-gray-400"
                >
                  <option>जिल्हा निवडा</option>
                </select>
              )}

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
              placeholder="शोधा (नाव, वर्णन...)"
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
                      {job.job_type_display}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-gray-500 flex-wrap">
                    <span>{formatLocation(job.taluka, job.district)}</span>
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

      {/* Employers Tab */}
      {activeTab === "employers" && (
        <>
          <div
            className="bg-white rounded-xl p-4 mb-4"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
          >
            <input
              type="text"
              value={employerSearch}
              onChange={(e) => setEmployerSearch(e.target.value)}
              placeholder="शोधा (नाव किंवा फोन नंबर)"
              className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:border-[#FF6B00]"
            />
          </div>

          <p className="text-xs text-gray-500 mb-2 px-1">
            एकूण: {filteredEmployers.length} नोकरी देणारे
          </p>

          {loadingEmployers ? (
            <p className="text-gray-400 text-sm py-8 text-center">लोड होत आहे...</p>
          ) : filteredEmployers.length === 0 ? (
            <p className="text-gray-400 text-sm py-8 text-center">कोणतेही नोकरी देणारे सापडले नाहीत</p>
          ) : (
            <div className="space-y-2">
              {filteredEmployers.map((emp) => (
                <Link
                  key={emp.phone}
                  href={`/employer/${emp.phone}`}
                  className="block bg-white rounded-xl p-3.5 transition"
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">
                        {emp.employer_name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{emp.phone}</p>
                    </div>
                    <span
                      className="text-xs px-2 py-1 rounded-lg font-medium whitespace-nowrap"
                      style={{ backgroundColor: "#fff7ed", color: "#c2410c" }}
                    >
                      {emp.job_count} {emp.job_count === 1 ? "जाहिरात" : "जाहिराती"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
