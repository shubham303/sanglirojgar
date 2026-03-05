"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { DISTRICTS, DISTRICT_TALUKAS } from "@/lib/constants";
import { useGroupedJobTypes } from "@/lib/useJobTypes";
import { Job } from "@/lib/types";
import { formatDateMarathi, formatLocation, formatExperience } from "@/lib/utils";
import { trackEvent } from "@/lib/gtag";
import JobTypePicker from "../components/JobTypePicker";

const PAGE_LIMIT = 20;
const MAX_RETRIES = 3;

const ALL = "सर्व";

interface PaginatedResponse {
  jobs: Job[];
  total: number;
  page: number;
  hasMore: boolean;
}

function SkeletonCard() {
  return (
    <div
      className="bg-white rounded-xl p-4 animate-pulse"
      style={{ borderLeft: "4px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
    >
      <div className="h-5 bg-gray-200 rounded w-1/3 mb-2" />
      <div className="space-y-1.5">
        <div className="h-4 bg-gray-100 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="h-3 bg-gray-100 rounded w-1/3" />
      </div>
    </div>
  );
}

export default function BrowseJobs() {
  const groupedJobTypes = useGroupedJobTypes();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  // Filter state (applied on button press)
  const [filterJobType, setFilterJobType] = useState(ALL);
  const [filterDistrict, setFilterDistrict] = useState(ALL);
  const [filterTaluka, setFilterTaluka] = useState(ALL);
  const [showFilters, setShowFilters] = useState(false);

  // Active filters (what's actually applied)
  const [appliedJobType, setAppliedJobType] = useState(ALL);
  const [appliedDistrict, setAppliedDistrict] = useState(ALL);
  const [appliedTaluka, setAppliedTaluka] = useState(ALL);

  const buildUrl = useCallback(
    (pageNum: number, jobType: string, district: string, taluka: string) => {
      const params = new URLSearchParams();
      params.set("page", String(pageNum));
      params.set("limit", String(PAGE_LIMIT));
      if (jobType !== ALL) params.set("job_type_id", jobType);
      if (district !== ALL) params.set("district", district);
      if (taluka !== ALL) params.set("taluka", taluka);
      return `/api/jobs?${params.toString()}`;
    },
    []
  );

  const fetchWithRetry = useCallback(
    async (url: string, retries = MAX_RETRIES): Promise<PaginatedResponse> => {
      for (let i = 0; i < retries; i++) {
        try {
          const res = await fetch(url);
          if (!res.ok) throw new Error("API error");
          return await res.json();
        } catch {
          if (i === retries - 1) throw new Error("सर्व्हरशी संपर्क होऊ शकला नाही");
        }
      }
      throw new Error("सर्व्हरशी संपर्क होऊ शकला नाही");
    },
    []
  );

  // Initial load
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchWithRetry(buildUrl(1, ALL, ALL, ALL));
        setJobs(data.jobs);
        setTotal(data.total);
        setHasMore(data.hasMore);
        setPage(1);
      } catch (e: unknown) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [buildUrl, fetchWithRetry]);

  // Apply filters (search button press)
  const applyFilters = async () => {
    setLoading(true);
    setError("");
    setAppliedJobType(filterJobType);
    setAppliedDistrict(filterDistrict);
    setAppliedTaluka(filterTaluka);
    trackEvent("filter_used", {
      job_type: filterJobType,
      district: filterDistrict,
      taluka: filterTaluka,
    });
    try {
      const data = await fetchWithRetry(
        buildUrl(1, filterJobType, filterDistrict, filterTaluka)
      );
      setJobs(data.jobs);
      setTotal(data.total);
      setHasMore(data.hasMore);
      setPage(1);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Load more
  const loadMore = async () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const data = await fetchWithRetry(
        buildUrl(nextPage, appliedJobType, appliedDistrict, appliedTaluka)
      );
      setJobs((prev) => {
        const existingIds = new Set(prev.map((j) => j.id));
        const newJobs = data.jobs.filter((j) => !existingIds.has(j.id));
        return [...prev, ...newJobs];
      });
      setHasMore(data.hasMore);
      setPage(nextPage);
    } catch {
      // silently fail on load more
    } finally {
      setLoadingMore(false);
    }
  };

  const clearFilters = () => {
    setFilterJobType(ALL);
    setFilterDistrict(ALL);
    setFilterTaluka(ALL);
    // Also apply immediately
    setAppliedJobType(ALL);
    setAppliedDistrict(ALL);
    setAppliedTaluka(ALL);
    setLoading(true);
    setError("");
    fetchWithRetry(buildUrl(1, ALL, ALL, ALL))
      .then((data) => {
        setJobs(data.jobs);
        setTotal(data.total);
        setHasMore(data.hasMore);
        setPage(1);
      })
      .catch((e: unknown) => setError((e as Error).message))
      .finally(() => setLoading(false));
  };

  const activeFilterCount =
    (appliedJobType !== ALL ? 1 : 0) +
    (appliedDistrict !== ALL ? 1 : 0) +
    (appliedTaluka !== ALL ? 1 : 0);

  const retryLoad = () => {
    setLoading(true);
    setError("");
    fetchWithRetry(buildUrl(1, appliedJobType, appliedDistrict, appliedTaluka))
      .then((data) => {
        setJobs(data.jobs);
        setTotal(data.total);
        setHasMore(data.hasMore);
        setPage(1);
      })
      .catch((e: unknown) => setError((e as Error).message))
      .finally(() => setLoading(false));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-bold text-gray-800">उपलब्ध नोकऱ्या</h1>
        {!loading && !error && (
          <span className="text-sm text-gray-400">
            {total} नोकऱ्या
          </span>
        )}
      </div>

      <div className="mb-3 flex items-center gap-2">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-3 py-1.5 rounded-full text-sm font-medium border transition"
          style={{
            backgroundColor: showFilters || activeFilterCount > 0 ? "#FF6B00" : "#ffffff",
            color: showFilters || activeFilterCount > 0 ? "#ffffff" : "#6b7280",
            borderColor: showFilters || activeFilterCount > 0 ? "#FF6B00" : "#d1d5db",
          }}
        >
          ☰ फिल्टर{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
        </button>
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-sm underline"
            style={{ color: "#FF6B00" }}
          >
            काढा
          </button>
        )}
      </div>

      {showFilters && (
        <div
          className="mb-4 p-3 rounded-xl flex flex-col gap-3"
          style={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb" }}
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">
                कामाचा प्रकार
              </label>
              <JobTypePicker
                value={filterJobType}
                onChange={setFilterJobType}
                groupedJobTypes={groupedJobTypes}
                allLabel={ALL}
              />
            </div>

            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">
                जिल्हा
              </label>
              <select
                value={filterDistrict}
                onChange={(e) => { setFilterDistrict(e.target.value); setFilterTaluka(ALL); }}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-base bg-white focus:outline-none"
                style={{ borderColor: filterDistrict !== ALL ? "#FF6B00" : undefined }}
              >
                <option value={ALL}>सर्व</option>
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {filterDistrict !== ALL && (
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  तालुका
                </label>
                <select
                  value={filterTaluka}
                  onChange={(e) => setFilterTaluka(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-base bg-white focus:outline-none"
                  style={{ borderColor: filterTaluka !== ALL ? "#FF6B00" : undefined }}
                >
                  <option value={ALL}>सर्व</option>
                  {(DISTRICT_TALUKAS[filterDistrict] || []).map((taluka) => (
                    <option key={taluka} value={taluka}>
                      {taluka}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <button
            onClick={applyFilters}
            className="w-full text-base font-semibold py-2.5 rounded-lg transition"
            style={{ backgroundColor: "#FF6B00", color: "#ffffff" }}
          >
            शोधा
          </button>
        </div>
      )}

      {error ? (
        <div className="text-center py-8">
          <p className="text-base text-red-600 mb-4">{error}</p>
          <button
            onClick={retryLoad}
            className="px-5 py-2.5 rounded-lg text-base font-medium transition"
            style={{ backgroundColor: "#FF6B00", color: "#ffffff" }}
          >
            पुन्हा प्रयत्न करा
          </button>
        </div>
      ) : loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <p className="text-center text-gray-500 text-base py-8">
          {activeFilterCount === 0
            ? "सध्या कोणत्याही नोकऱ्या उपलब्ध नाहीत"
            : "या फिल्टरनुसार नोकऱ्या सापडल्या नाहीत"}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/job/${job.id}`}
              className="block bg-white rounded-xl p-4 transition"
              style={{
                textDecoration: "none",
                color: "inherit",
                borderLeft: "4px solid #FF6B00",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)",
              }}
            >
              <div className="flex gap-3">
                {/* Job info — left side */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-base font-bold" style={{ color: "#FF6B00" }}>
                      {job.job_type_display}
                    </h2>
                    <span className="text-xs text-gray-400 whitespace-nowrap mt-0.5">
                      {formatDateMarathi(job.created_at)}
                    </span>
                  </div>
                  <div className="mt-1.5 space-y-0.5 text-sm text-gray-600">
                    <p>
                      <span className="font-medium text-gray-500">ठिकाण:</span> {formatLocation(job.taluka, job.district)}
                    </p>
                    {job.description && (
                      <p
                        className="overflow-hidden text-gray-500"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {job.description}
                      </p>
                    )}
                    {(job.minimum_education || job.experience_years) && (
                      <p className="text-xs text-gray-500">
                        {[
                          job.minimum_education,
                          job.experience_years && formatExperience(job.experience_years),
                        ].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    <p className="font-semibold text-gray-800">
                      ₹ {job.salary}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {job.employer_name}
                    </p>
                  </div>
                </div>

                {/* Action buttons — right side */}
                <div className="flex flex-col items-center justify-center shrink-0 gap-1.5 pl-2 border-l border-gray-100">
                  <span
                    role="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      fetch(`/api/jobs/${job.id}/click`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ type: "call" }),
                      });
                      trackEvent("phone_click", { job_id: job.id, job_type: job.job_type_display, employer: job.employer_name });
                      window.location.href = `tel:${job.phone}`;
                    }}
                    className="flex flex-col items-center justify-center rounded-xl px-3 py-2.5 transition"
                    style={{ backgroundColor: "#f0fdf4" }}
                  >
                    <span style={{ fontSize: "22px", lineHeight: 1 }}>📞</span>
                    <span className="text-[10px] font-semibold mt-1" style={{ color: "#16a34a" }}>
                      कॉल
                    </span>
                  </span>
                  <span
                    role="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      fetch(`/api/jobs/${job.id}/click`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ type: "whatsapp" }),
                      });
                      trackEvent("whatsapp_click", { job_id: job.id, job_type: job.job_type_display, employer: job.employer_name });
                      const waMsg = encodeURIComponent(`नमस्कार, मी mahajob.in वर तुमची ${job.job_type_display} ची जाहिरात पाहिली. मला या नोकरीबद्दल अधिक माहिती हवी आहे.\n\nhttps://www.mahajob.in/job/${job.id}`);
                      window.open(`https://wa.me/91${job.phone}?text=${waMsg}`, "_blank");
                    }}
                    className="flex flex-col items-center justify-center rounded-xl px-3 py-2.5 transition"
                    style={{ backgroundColor: "#f0fdf4" }}
                  >
                    <span style={{ fontSize: "22px", lineHeight: 1 }}>💬</span>
                    <span className="text-[10px] font-semibold mt-1" style={{ color: "#25D366" }}>
                      WA
                    </span>
                  </span>
                </div>
              </div>
            </Link>
          ))}

          {hasMore && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="w-full py-3 text-base font-medium rounded-xl border transition disabled:opacity-50"
              style={{ borderColor: "#FF6B00", color: "#FF6B00", backgroundColor: "#ffffff" }}
            >
              {loadingMore ? "लोड होत आहे..." : "अजून नोकऱ्या पहा"}
            </button>
          )}

          {/* WhatsApp share button for the site */}
          <a
            href={`https://wa.me/?text=${encodeURIComponent("महाराष्ट्रातील नोकऱ्या एकाच ठिकाणी — www.mahajob.in — मोफत आणि थेट संपर्क. नोकरी हवी असेल तर पहा, कामगार हवे असतील तर मोफत जाहिरात द्या!")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 text-base font-semibold rounded-xl transition"
            style={{ backgroundColor: "#25D366", color: "#ffffff" }}
          >
            <span style={{ fontSize: "20px", lineHeight: 1 }}>💬</span>
            मित्रांना WhatsApp वर शेअर करा
          </a>
        </div>
      )}
    </div>
  );
}
