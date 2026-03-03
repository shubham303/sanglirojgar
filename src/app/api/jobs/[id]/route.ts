import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getFirstValidationError } from "@/lib/validation";
import { prepareJobData, validateTalukaDistrict } from "@/lib/job-data";
import { JOB_EXPIRY_MS } from "@/lib/constants";

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

  if (data.is_deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
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

  // Prevent editing deleted jobs
  const { data: existing } = await db.getJobById(id);
  if (!existing || existing.is_deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();

  const validationError = getFirstValidationError(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const jobData = prepareJobData(body);

  const talukaError = validateTalukaDistrict(jobData.district, jobData.taluka);
  if (talukaError) {
    return NextResponse.json({ error: talukaError }, { status: 400 });
  }

  // Update employer name in employers table if provided
  if (jobData.employer_name && existing) {
    await db.upsertEmployer(existing.phone, jobData.employer_name);
  }

  const { data, error } = await db.updateJob(id, jobData);

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json(data);
}

// PATCH /api/jobs/[id] — Toggle is_active status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = getDb();
  const { id } = await params;

  // Prevent reactivating deleted jobs
  const { data: existing } = await db.getJobById(id);
  if (!existing || existing.is_deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();

  if (typeof body.is_active !== "boolean") {
    return NextResponse.json(
      { error: "is_active must be a boolean" },
      { status: 400 }
    );
  }

  const updateData: Record<string, unknown> = { is_active: body.is_active };
  // Reset expiry on reactivation
  if (body.is_active === true) {
    updateData.expires_at = new Date(Date.now() + JOB_EXPIRY_MS).toISOString();
  }

  const { data, error } = await db.updateJob(id, updateData);

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE /api/jobs/[id] — Soft-delete a job (mark as deleted, preserved in DB)
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
