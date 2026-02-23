"use client";

import { useEffect, useState } from "react";
import { JOB_TYPES } from "@/lib/constants";
import { Job } from "@/lib/types";
import { formatDateMarathi } from "@/lib/utils";

export default function BrowseJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("सर्व प्रकार");

  useEffect(() => {
    fetch("/api/jobs")
      .then((res) => res.json())
      .then((data) => {
        setJobs(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredJobs =
    filter === "सर्व प्रकार"
      ? jobs
      : jobs.filter((job) => job.job_type === filter);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">उपलब्ध नोकऱ्या</h1>

      <div className="mb-6">
        <label className="block text-lg font-medium text-gray-700 mb-2">
          कामाचा प्रकार
        </label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg bg-white focus:outline-none focus:border-[#FF6B00]"
        >
          <option value="सर्व प्रकार">सर्व प्रकार</option>
          {JOB_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 text-lg py-8">
          लोड होत आहे...
        </p>
      ) : filteredJobs.length === 0 ? (
        <p className="text-center text-gray-500 text-lg py-8">
          {filter === "सर्व प्रकार"
            ? "सध्या कोणत्याही नोकऱ्या उपलब्ध नाहीत"
            : "या प्रकारच्या नोकऱ्या सध्या उपलब्ध नाहीत"}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white border border-orange-100 rounded-lg p-4 shadow-sm"
            >
              <h2 className="text-xl font-bold" style={{ color: "#FF6B00" }}>
                {job.job_type}
              </h2>
              <div className="mt-2 space-y-1 text-base text-gray-700">
                <p>
                  <span className="font-medium">तालुका:</span> {job.taluka}
                </p>
                {job.description && (
                  <p>
                    <span className="font-medium">कामाचे स्वरूप:</span>{" "}
                    {job.description}
                  </p>
                )}
                <p>
                  <span className="font-medium">पगार / मजुरी:</span>{" "}
                  {job.salary}
                </p>
                <p>
                  <span className="font-medium">नोकरी देणाऱ्याचे नाव:</span>{" "}
                  {job.employer_name}
                </p>
              </div>
              <a
                href={`tel:${job.phone}`}
                className="inline-block mt-3 text-lg font-semibold px-6 py-3 rounded-lg transition"
                style={{ backgroundColor: "#16a34a", color: "#ffffff" }}
              >
                फोन करा: {job.phone}
              </a>
              <p className="text-sm text-gray-400 mt-2">
                {formatDateMarathi(job.created_at)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
