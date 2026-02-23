import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/jobs — Fetch all active jobs
export async function GET() {
  const db = getDb();
  const { data, error } = await db.getActiveJobs();

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/jobs — Create a new job posting
export async function POST(request: NextRequest) {
  const db = getDb();
  const body = await request.json();

  const {
    employer_name,
    phone,
    job_type,
    taluka,
    salary,
    description,
    workers_needed,
  } = body;

  // Server-side validation
  if (!employer_name || employer_name.trim().length < 2) {
    return NextResponse.json(
      { error: "नाव किमान 2 अक्षरे असणे आवश्यक आहे" },
      { status: 400 }
    );
  }
  if (!phone || phone.length !== 10 || !/^\d{10}$/.test(phone)) {
    return NextResponse.json(
      { error: "फोन नंबर 10 अंकी असणे आवश्यक आहे" },
      { status: 400 }
    );
  }
  if (!job_type) {
    return NextResponse.json(
      { error: "कामाचा प्रकार आवश्यक आहे" },
      { status: 400 }
    );
  }
  if (!taluka) {
    return NextResponse.json(
      { error: "तालुका आवश्यक आहे" },
      { status: 400 }
    );
  }
  if (!salary || !salary.trim()) {
    return NextResponse.json(
      { error: "पगार / मजुरी आवश्यक आहे" },
      { status: 400 }
    );
  }
  if (!workers_needed || workers_needed < 1) {
    return NextResponse.json(
      { error: "किमान 1 कामगार आवश्यक आहे" },
      { status: 400 }
    );
  }

  const { data, error } = await db.createJob({
    employer_name: employer_name.trim(),
    phone,
    job_type,
    taluka,
    salary: salary.trim(),
    description: description ? description.trim() : "",
    workers_needed,
    is_active: true,
  });

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
