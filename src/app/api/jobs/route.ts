import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getFirstValidationError } from "@/lib/validation";
import { prepareJobData, validateTalukaDistrict } from "@/lib/job-data";
import { JOB_EXPIRY_MS } from "@/lib/constants";
import { postJobToFacebook } from "@/lib/facebook-post";

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
  const seed_raw = searchParams.get("seed");
  const seed = seed_raw ? parseInt(seed_raw) : undefined;

  const { data, error } = await db.getActiveJobsPaginated({
    page,
    limit,
    job_type_id,
    district,
    taluka,
    search,
    seed,
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

  // Duplicate check (skip if explicitly requested, only applicable when phone is provided)
  if (!body.skip_duplicate_check && jobData.phone) {
    const dupResult = await db.findDuplicateJobs(jobData.phone, jobData.job_type_id, jobData.taluka);
    if (dupResult.error) {
      console.error("Duplicate check failed, proceeding:", dupResult.error);
    } else if (dupResult.data && dupResult.data.length > 0) {
      return NextResponse.json(
        {
          error: "या फोन नंबरवर हाच कामाचा प्रकार आणि तालुका असलेली जाहिरात आधीच आहे.",
          code: "DUPLICATE_JOBS",
          duplicates: dupResult.data,
        },
        { status: 409 }
      );
    }
  }

  // Compute expires_at: use last_date if provided, otherwise default (60 days)
  let expiresAt: string;
  if (jobData.last_date) {
    // Set expiry to end of the last_date day (23:59:59 IST → UTC)
    const d = new Date(jobData.last_date + "T23:59:59+05:30");
    expiresAt = d.toISOString();
  } else {
    expiresAt = new Date(Date.now() + JOB_EXPIRY_MS).toISOString();
  }

  const { last_date: _lastDate, ...jobDataWithoutLastDate } = jobData;
  const { data, error } = await db.createJob({
    ...jobDataWithoutLastDate,
    is_active: true,
    is_deleted: false,
    expires_at: expiresAt,
    ...(body.is_premium ? { is_premium: true } : {}),
  });

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  // Post to Facebook Group (non-blocking, fails silently)
  if (data) {
    postJobToFacebook(data).catch(() => {});
  }

  return NextResponse.json(data, { status: 201 });
}
