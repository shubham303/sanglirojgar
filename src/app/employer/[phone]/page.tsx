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

  const fetchJobs = async (phoneNum: string) => {
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/jobs/employer/${phoneNum}`);
      const data = await res.json();
      setJobs(data);
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

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: "DELETE" });
      if (res.ok) {
        setJobs(jobs.filter((j) => j.id !== id));
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
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        माझ्या जाहिराती
      </h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
        className="flex gap-2 mb-6"
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
          className="flex-1 min-w-0 border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-[#FF6B00]"
        />
        <button
          type="submit"
          disabled={phone.length !== 10}
          className="px-5 py-3 rounded-lg text-lg font-medium disabled:opacity-50 transition shrink-0"
          style={{ backgroundColor: "#FF6B00", color: "#ffffff" }}
        >
          शोधा
        </button>
      </form>

      {loading ? (
        <p className="text-center text-gray-500 text-lg py-8">
          लोड होत आहे...
        </p>
      ) : searched && jobs.length === 0 ? (
        <p className="text-center text-gray-500 text-lg py-8">
          या नंबरवर कोणतीही जाहिरात नोंदवलेली नाही
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {jobs.map((job) => (
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
                  <span className="font-medium">किती कामगार हवे:</span>{" "}
                  {job.workers_needed}
                </p>
              </div>
              <p className="text-sm text-gray-400 mt-2">
                {formatDateMarathi(job.created_at)}
              </p>

              <div className="flex flex-wrap gap-2 mt-3">
                <Link
                  href={`/job/${job.id}/edit`}
                  className="px-4 py-2 rounded-lg text-base transition"
                  style={{ backgroundColor: "#FF6B00", color: "#ffffff" }}
                >
                  बदल करा
                </Link>

                {confirmDeleteId === job.id ? (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                    <span className="text-sm text-gray-600">
                      हे पोस्टिंग काढायचे आहे का?
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(job.id)}
                        disabled={deletingId === job.id}
                        className="px-4 py-2 rounded-lg text-sm"
                        style={{ backgroundColor: "#dc2626", color: "#ffffff" }}
                      >
                        हो
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm"
                      >
                        नाही
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(job.id)}
                    className="px-4 py-2 rounded-lg text-base transition"
                    style={{ backgroundColor: "#fee2e2", color: "#b91c1c" }}
                  >
                    काढून टाका
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
