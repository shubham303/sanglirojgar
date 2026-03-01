import type { Metadata } from "next";
import { getDb } from "@/lib/db";
import JobDetailClient from "./job-detail-client";

const BASE_URL = "https://www.mahajob.in";

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

  const title = `${job.job_type} — ${job.taluka}, ${job.district || "सांगली"} | पगार ₹${job.salary}`;
  const description = job.description
    ? `${job.job_type} नोकरी ${job.taluka}, ${job.district || "सांगली"} मध्ये. पगार: ₹${job.salary}. ${job.description.slice(0, 120)}`
    : `${job.job_type} नोकरी ${job.taluka}, ${job.district || "सांगली"} मध्ये. पगार: ₹${job.salary}. ${job.employer_name} यांच्याकडे. थेट फोन करा.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/job/${id}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      siteName: "सांगली रोजगार",
      url: `${BASE_URL}/job/${id}`,
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
        title: job.job_type,
        description: job.description || `${job.job_type} — ${job.taluka}, ${job.district || "सांगली"}`,
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
