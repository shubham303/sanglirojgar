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

  const { employer_name, phone, job_type, district, taluka, salary, description, minimum_education, experience_years, workers_needed, gender } = body;

  const { data, error } = await db.updateJob(id, {
    employer_name: employer_name.trim(),
    phone,
    job_type,
    state: "महाराष्ट्र",
    district: district || "सांगली",
    taluka,
    salary: salary.trim(),
    description: description ? description.trim() : "",
    minimum_education: minimum_education || null,
    experience_years: experience_years || null,
    workers_needed: typeof workers_needed === "string" ? parseInt(workers_needed) : workers_needed,
    gender: gender || "both",
  });

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
  const body = await request.json();

  if (typeof body.is_active !== "boolean") {
    return NextResponse.json(
      { error: "is_active must be a boolean" },
      { status: 400 }
    );
  }

  const { data, error } = await db.updateJob(id, { is_active: body.is_active });

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE /api/jobs/[id] — Permanently delete a job
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = getDb();
  const { id } = await params;

  const { error } = await db.hardDeleteJob(id);

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
