import type { Metadata } from "next";
import { getDb } from "@/lib/db";
import { SITE_URL } from "@/lib/config";
import { formatLocation } from "@/lib/utils";
import { getJobTypeMarathi } from "@/lib/constants";
import JobDetailClient from "./job-detail-client";

/** Resolve Marathi name from job_type_display ("मराठी (English)") or fall back to constants */
function resolveJobTypeMarathi(job: { job_type_id: number; job_type_display?: string }): string {
  if (job.job_type_display) {
    // job_type_display is "मराठी (English)" — extract the Marathi part before " ("
    const idx = job.job_type_display.indexOf(" (");
    if (idx > 0) return job.job_type_display.slice(0, idx);
    return job.job_type_display;
  }
  return resolveJobTypeMarathi(job);
}

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const db = getDb();
  const { data: job } = await db.getJobById(id);

  if (!job) {
    return {
      title: "जाहिरात सापडली नाही",
    };
  }

  const loc = formatLocation(job.taluka, job.district);
  const jobTypeName = resolveJobTypeMarathi(job);
  const title = `${jobTypeName} — ${loc} | पगार ₹${job.salary}`;
  const description = job.description
    ? `${jobTypeName} नोकरी ${loc} मध्ये. पगार: ₹${job.salary}. ${job.description.slice(0, 120)}`
    : `${jobTypeName} नोकरी ${loc} मध्ये. पगार: ₹${job.salary}. ${job.employer_name} यांच्याकडे. थेट फोन करा.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/job/${id}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      siteName: "महा जॉब",
      url: `${SITE_URL}/job/${id}`,
    },
  };
}

export default async function JobDetailPage({ params }: Props) {
  const { id } = await params;
  const db = getDb();
  const { data: job } = await db.getJobById(id);

  // JSON-LD structured data for Google JobPosting rich results
  const jsonLd = job
    ? {
        "@context": "https://schema.org",
        "@type": "JobPosting",
        title: resolveJobTypeMarathi(job),
        description: job.description || `${resolveJobTypeMarathi(job)} — ${formatLocation(job.taluka, job.district)}`,
        datePosted: job.created_at,
        jobLocation: {
          "@type": "Place",
          address: {
            "@type": "PostalAddress",
            addressLocality: job.taluka,
            addressRegion: job.district || "सांगली",
            addressCountry: "IN",
          },
        },
        baseSalary: {
          "@type": "MonetaryAmount",
          currency: "INR",
          value: job.salary,
        },
        hiringOrganization: {
          "@type": "Organization",
          name: job.employer_name,
        },
        employmentType: "FULL_TIME",
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <JobDetailClient />
    </>
  );
}
