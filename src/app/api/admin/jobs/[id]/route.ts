import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
import { JOB_EXPIRY_MS } from "@/lib/constants";

export const dynamic = "force-dynamic";

// PATCH /api/admin/jobs/[id] — Update admin-controlled fields (is_reviewed, is_active, is_premium)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const db = getDb();
  const { data: existing } = await db.getJobById(id);
  if (!existing || existing.is_deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updateData: Record<string, unknown> = {};

  if (typeof body.is_reviewed === "boolean") {
    updateData.is_reviewed = body.is_reviewed;
  }
  if (typeof body.is_active === "boolean") {
    updateData.is_active = body.is_active;
    if (body.is_active === true) {
      updateData.expires_at = new Date(Date.now() + JOB_EXPIRY_MS).toISOString();
    }
  }
  if (typeof body.is_premium === "boolean") {
    updateData.is_premium = body.is_premium;
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const { data, error } = await db.updateJob(id, updateData);

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json(data);
}

// PUT /api/admin/jobs/[id] — Full job edit by admin
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const db = getDb();

  const { data: existing } = await db.getJobById(id);
  if (!existing || existing.is_deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();

  // Build update object from allowed fields
  const updateData: Record<string, unknown> = {};
  const fields = [
    "employer_name", "job_type_id", "district", "taluka", "salary",
    "description", "minimum_education", "experience_years",
    "workers_needed", "gender", "is_active", "is_premium", "is_reviewed", "tags",
  ];
  for (const field of fields) {
    if (field in body) updateData[field] = body[field];
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  // Sync employer name if changed and phone is available
  if (updateData.employer_name && typeof updateData.employer_name === "string" && existing.phone) {
    await db.upsertEmployer(existing.phone, updateData.employer_name);
  }

  const { data, error } = await db.updateJob(id, updateData);

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE /api/admin/jobs/[id] — Soft-delete a job
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const db = getDb();

  const { error } = await db.softDeleteJob(id);

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
