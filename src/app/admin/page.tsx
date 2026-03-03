"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { Job } from "@/lib/types";
import { Employer } from "@/lib/types";
import { DISTRICTS, DISTRICT_TALUKAS } from "@/lib/constants";
import { useGroupedJobTypes } from "@/lib/useJobTypes";
import { formatDateMarathi, formatLocation } from "@/lib/utils";

type EmployerSortOption = "date_added" | "job_count" | "last_contacted";

type AdminTab = "all_jobs" | "employers";

interface PaginatedJobs {
  jobs: Job[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export default function AdminPage() {
  const groupedJobTypes = useGroupedJobTypes();
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
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive" | "deleted">("all");

  // Employers tab state
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [loadingEmployers, setLoadingEmployers] = useState(false);
  const [employerSearch, setEmployerSearch] = useState("");
  const [employerSort, setEmployerSort] = useState<EmployerSortOption>("date_added");

  // Contact modal state
  const [contactModal, setContactModal] = useState<{
    employer: Employer;
    type: "call" | "whatsapp";
  } | null>(null);

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
      if (filterStatus === "deleted") params.set("is_deleted", "true");

      const res = await fetch(`/api/admin/jobs?${params.toString()}`);
      if (res.ok) {
        const data: PaginatedJobs = await res.json();
        setJobs((prev) => {
          if (!append) return data.jobs;
          const existing = new Set(prev.map((j) => j.id));
          return [...prev, ...data.jobs.filter((j) => !existing.has(j.id))];
        });
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

  const filteredEmployers = useMemo(() => {
    let list = employerSearch
      ? employers.filter(
          (emp) =>
            emp.employer_name.toLowerCase().includes(employerSearch.toLowerCase()) ||
            emp.phone.includes(employerSearch)
        )
      : [...employers];

    list.sort((a, b) => {
      switch (employerSort) {
        case "date_added":
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        case "job_count":
          return b.job_count - a.job_count;
        case "last_contacted": {
          // Null (never contacted) should be on top
          const aTime = a.last_contacted_by_admin_at ? new Date(a.last_contacted_by_admin_at).getTime() : 0;
          const bTime = b.last_contacted_by_admin_at ? new Date(b.last_contacted_by_admin_at).getTime() : 0;
          return aTime - bTime;
        }
        default:
          return 0;
      }
    });

    return list;
  }, [employers, employerSearch, employerSort]);

  const handleContactEmployer = (employer: Employer, type: "call" | "whatsapp") => {
    if (employer.last_contacted_by_admin_at) {
      const lastContactedDate = new Date(employer.last_contacted_by_admin_at);
      const daysSince = Math.floor((Date.now() - lastContactedDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSince < 30) {
        setContactModal({ employer, type });
        return;
      }
    }
    proceedWithContact(employer, type);
  };

  const proceedWithContact = async (employer: Employer, type: "call" | "whatsapp") => {
    setContactModal(null);

    // Update last_contacted_by_admin_at
    await fetch(`/api/admin/employers/${employer.phone}/contact`, { method: "POST" });

    // Update local state
    setEmployers((prev) =>
      prev.map((emp) =>
        emp.phone === employer.phone
          ? { ...emp, last_contacted_by_admin_at: new Date().toISOString() }
          : emp
      )
    );

    // Open call or WhatsApp
    if (type === "call") {
      window.open(`tel:${employer.phone}`, "_self");
    } else {
      window.open(`https://wa.me/91${employer.phone}`, "_blank");
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
                {groupedJobTypes.map((group) => (
                  <optgroup key={group.industry_id} label={`${group.industry_mr} (${group.industry_en})`}>
                    {group.options.map((opt) => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                  </optgroup>
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
                onChange={(e) => setFilterStatus(e.target.value as "all" | "active" | "inactive" | "deleted")}
                className="border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:border-[#FF6B00]"
              >
                <option value="all">सर्व स्थिती</option>
                <option value="active">सक्रिय</option>
                <option value="inactive">निष्क्रिय</option>
                <option value="deleted">काढलेले</option>
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
                    opacity: job.is_deleted ? 0.45 : job.is_active ? 1 : 0.55,
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
                            job.is_deleted
                              ? { backgroundColor: "#f3f4f6", color: "#6b7280" }
                              : job.is_active
                              ? { backgroundColor: "#f0fdf4", color: "#15803d" }
                              : { backgroundColor: "#fef2f2", color: "#dc2626" }
                          }
                        >
                          {job.is_deleted ? "काढलेले" : job.is_active ? "सक्रिय" : "निष्क्रिय"}
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
            className="bg-white rounded-xl p-4 mb-4 space-y-2"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
          >
            <input
              type="text"
              value={employerSearch}
              onChange={(e) => setEmployerSearch(e.target.value)}
              placeholder="शोधा (नाव किंवा फोन नंबर)"
              className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:border-[#FF6B00]"
            />
            <select
              value={employerSort}
              onChange={(e) => setEmployerSort(e.target.value as EmployerSortOption)}
              className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:border-[#FF6B00]"
            >
              <option value="date_added">नवीन नोकरी देणारे आधी</option>
              <option value="job_count">जास्त जाहिराती आधी</option>
              <option value="last_contacted">कमी संपर्क केलेले आधी</option>
            </select>
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
                <div
                  key={emp.phone}
                  className="bg-white rounded-xl p-3.5"
                  style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      href={`/employer/${emp.phone}`}
                      className="flex-1 min-w-0"
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <p className="text-sm font-bold text-gray-800 truncate">
                        {emp.employer_name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{emp.phone}</p>
                      {emp.last_contacted_by_admin_at && (
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          संपर्क: {formatDateMarathi(emp.last_contacted_by_admin_at)}
                        </p>
                      )}
                    </Link>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded font-medium whitespace-nowrap"
                        style={{ backgroundColor: "#fff7ed", color: "#c2410c" }}
                      >
                        {emp.job_count}
                      </span>
                      <button
                        onClick={() => handleContactEmployer(emp, "call")}
                        className="w-8 h-8 flex items-center justify-center rounded-lg transition"
                        style={{ backgroundColor: "#eff6ff" }}
                        title="Call"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleContactEmployer(emp, "whatsapp")}
                        className="w-8 h-8 flex items-center justify-center rounded-lg transition"
                        style={{ backgroundColor: "#f0fdf4" }}
                        title="WhatsApp"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#16a34a">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Contact Confirmation Modal */}
      {contactModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
          onClick={() => setContactModal(null)}
        >
          <div
            className="bg-white rounded-xl p-5 w-full max-w-sm"
            style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.15)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm font-bold text-gray-800 mb-2">
              पुन्हा संपर्क करायचा आहे का?
            </p>
            <p className="text-sm text-gray-600 mb-4">
              तुम्ही <span className="font-semibold">{contactModal.employer.employer_name}</span> यांना{" "}
              <span className="font-semibold">
                {formatDateMarathi(contactModal.employer.last_contacted_by_admin_at!)}
              </span>{" "}
              रोजी संपर्क केला होता. पुन्हा {contactModal.type === "call" ? "कॉल" : "WhatsApp मेसेज"} करायचा आहे का?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setContactModal(null)}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-gray-200 text-gray-600 transition"
              >
                रद्द करा
              </button>
              <button
                onClick={() => proceedWithContact(contactModal.employer, contactModal.type)}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white transition"
                style={{ backgroundColor: "#FF6B00" }}
              >
                होय, संपर्क करा
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
