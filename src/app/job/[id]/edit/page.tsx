"use client";

import { useParams } from "next/navigation";
import JobForm from "@/app/components/JobForm";

export default function EditJob() {
  const params = useParams();
  const id = params.id as string;

  return <JobForm mode="edit" jobId={id} />;
}
