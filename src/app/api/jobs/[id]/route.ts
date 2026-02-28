import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getFirstValidationError } from "@/lib/validation";

export const dynamic = "force-dynamic";

// GET /api/jobs/[id] — Fetch a single job by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = getDb();
  const { id } = await params;

  const { data, error } = await db.getJobById(id);

  if (error || !data) {
    return NextResponse.json({ error: error || "Not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

// PUT /api/jobs/[id] — Update a job posting
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = getDb();
  const { id } = await params;
  const body = await request.json();

  const validationError = getFirstValidationError(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const { employer_name, phone, job_type, taluka, salary, description, workers_needed } = body;

  const { data, error } = await db.updateJob(id, {
    employer_name: employer_name.trim(),
    phone,
    job_type,
    taluka,
    salary: salary.trim(),
    description: description ? description.trim() : "",
    workers_needed: typeof workers_needed === "string" ? parseInt(workers_needed) : workers_needed,
  });

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE /api/jobs/[id] — Soft delete (set is_active = false)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = getDb();
  const { id } = await params;

  const { error } = await db.softDeleteJob(id);

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
