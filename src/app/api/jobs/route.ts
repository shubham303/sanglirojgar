import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getFirstValidationError } from "@/lib/validation";
import { prepareJobData, validateTalukaDistrict } from "@/lib/job-data";

export const dynamic = "force-dynamic";

// GET /api/jobs — Fetch active jobs with pagination and filters
export async function GET(request: NextRequest) {
  const db = getDb();
  const { searchParams } = new URL(request.url);

  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
  const job_type_id_raw = searchParams.get("job_type_id");
  const job_type_id = job_type_id_raw ? parseInt(job_type_id_raw) : undefined;
  const district = searchParams.get("district") || undefined;
  const taluka = searchParams.get("taluka") || undefined;
  const search = searchParams.get("search") || undefined;

  const { data, error } = await db.getActiveJobsPaginated({
    page,
    limit,
    job_type_id,
    district,
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

  const jobData = prepareJobData(body);

  const talukaError = validateTalukaDistrict(jobData.district, jobData.taluka);
  if (talukaError) {
    return NextResponse.json({ error: talukaError }, { status: 400 });
  }

  const { data, error } = await db.createJob({
    ...jobData,
    is_active: true,
  });

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
