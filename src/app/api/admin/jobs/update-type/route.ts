import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

// PATCH /api/admin/jobs/update-type — Update job_type_id for a job (admin only)
// Body: { job_id: string, job_type_id: number }
export async function PATCH(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { job_id, job_type_id } = body;

  if (!job_id) {
    return NextResponse.json({ error: "job_id is required" }, { status: 400 });
  }
  if (!job_type_id || typeof job_type_id !== "number") {
    return NextResponse.json({ error: "job_type_id must be a number" }, { status: 400 });
  }

  const db = getDb();
  const { data, error } = await db.updateJob(job_id, { job_type_id });

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  return NextResponse.json({ success: true, job: data });
}
