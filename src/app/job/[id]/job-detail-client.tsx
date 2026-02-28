"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Job } from "@/lib/types";
import { formatDateMarathi } from "@/lib/utils";

export default function JobDetail() {
  const params = useParams();
  const id = params.id as string;

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
      <p className="text-center text-gray-500 text-lg py-8">लोड होत आहे...</p>
    );
  }

  if (notFound || !job) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-600 mb-4">जाहिरात सापडली नाही</p>
        <Link
          href="/jobs"
          className="underline text-lg"
          style={{ color: "#FF6B00" }}
        >
          सर्व नोकऱ्या पहा
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/jobs"
        className="inline-block mb-3 text-sm font-medium"
        style={{ color: "#FF6B00" }}
      >
        ← सर्व नोकऱ्या
      </Link>

      <div
        className="bg-white rounded-xl p-4 sm:p-5"
        style={{ borderLeft: "4px solid #FF6B00", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
      >
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-xl font-bold" style={{ color: "#FF6B00" }}>
            {job.job_type}
          </h1>
          <span className="text-xs text-gray-400 whitespace-nowrap mt-1">
            {formatDateMarathi(job.created_at)}
          </span>
        </div>

        <div className="mt-3 space-y-2.5 text-sm text-gray-700">
          <div className="flex items-baseline gap-2">
            <span className="font-medium text-gray-400 text-xs w-24 shrink-0">तालुका</span>
            <p className="text-base">{job.taluka}</p>
          </div>

          {job.description && (
            <div className="flex items-baseline gap-2">
              <span className="font-medium text-gray-400 text-xs w-24 shrink-0">कामाचे स्वरूप</span>
              <p className="text-base whitespace-pre-wrap">{job.description}</p>
            </div>
          )}

          {job.minimum_education && (
            <div className="flex items-baseline gap-2">
              <span className="font-medium text-gray-400 text-xs w-24 shrink-0">किमान शिक्षण</span>
              <p className="text-base">{job.minimum_education}</p>
            </div>
          )}

          {job.experience_years && (
            <div className="flex items-baseline gap-2">
              <span className="font-medium text-gray-400 text-xs w-24 shrink-0">अनुभव</span>
              <p className="text-base">{job.experience_years === "0" ? "अनुभव नाही" : `${job.experience_years} वर्षे`}</p>
            </div>
          )}

          <div className="flex items-baseline gap-2">
            <span className="font-medium text-gray-400 text-xs w-24 shrink-0">पगार / मजुरी</span>
            <p className="text-base font-semibold text-gray-800">₹ {job.salary}</p>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-medium text-gray-400 text-xs w-24 shrink-0">कामगार हवे</span>
            <p className="text-base">{job.workers_needed}</p>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-medium text-gray-400 text-xs w-24 shrink-0">नोकरी देणारा</span>
            <p className="text-base">{job.employer_name}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2.5">
          <a
            href={`tel:${job.phone}`}
            onClick={() => {
              fetch(`/api/jobs/${id}/click`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: "call" }),
              });
            }}
            className="text-base font-semibold py-3 rounded-xl transition text-center"
            style={{ backgroundColor: "#16a34a", color: "#ffffff" }}
          >
            📞 फोन करा: {job.phone}
          </a>
          <a
            href={`https://wa.me/91${job.phone}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              fetch(`/api/jobs/${id}/click`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: "whatsapp" }),
              });
            }}
            className="text-base font-semibold py-3 rounded-xl transition text-center"
            style={{ backgroundColor: "#25D366", color: "#ffffff" }}
          >
            💬 WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
