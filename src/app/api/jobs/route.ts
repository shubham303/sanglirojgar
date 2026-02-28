import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getFirstValidationError } from "@/lib/validation";

export const dynamic = "force-dynamic";

// GET /api/jobs — Fetch active jobs with pagination and filters
export async function GET(request: NextRequest) {
  const db = getDb();
  const { searchParams } = new URL(request.url);

  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
  const job_type = searchParams.get("job_type") || undefined;
  const taluka = searchParams.get("taluka") || undefined;
  const search = searchParams.get("search") || undefined;

  const { data, error } = await db.getActiveJobsPaginated({
    page,
    limit,
    job_type,
    taluka,
    search,
  });

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/jobs — Create a new job posting
export async function POST(request: NextRequest) {
  const db = getDb();
  const body = await request.json();

  const validationError = getFirstValidationError(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const { employer_name, phone, job_type, taluka, salary, description, workers_needed } = body;

  const { data, error } = await db.createJob({
    employer_name: employer_name.trim(),
    phone,
    job_type,
    taluka,
    salary: salary.trim(),
    description: description ? description.trim() : "",
    workers_needed: typeof workers_needed === "string" ? parseInt(workers_needed) : workers_needed,
    is_active: true,
  });

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
