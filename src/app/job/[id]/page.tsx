import type { Metadata } from "next";
import { getDb } from "@/lib/db";
import JobDetailClient from "./job-detail-client";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const db = getDb();
  const { data: job } = await db.getJobById(id);

  if (!job) {
    return {
      title: "जाहिरात सापडली नाही — सांगली रोजगार",
    };
  }

  const title = `${job.job_type} — ${job.taluka} — सांगली रोजगार`;
  const description = job.description
    ? `${job.job_type} | पगार: ${job.salary} | ${job.description.slice(0, 120)}`
    : `${job.job_type} | पगार: ${job.salary} | ${job.employer_name}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      siteName: "सांगली रोजगार",
    },
  };
}

export default function JobDetailPage() {
  return <JobDetailClient />;
}
