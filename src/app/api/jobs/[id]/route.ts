import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// GET /api/jobs/[id] — Fetch a single job by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = getSupabase();
  const { id } = await params;

  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(data);
}

// PUT /api/jobs/[id] — Update a job posting
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = getSupabase();
  const { id } = await params;
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

  const { data, error } = await supabase
    .from("jobs")
    .update({
      employer_name: employer_name.trim(),
      phone,
      job_type,
      taluka,
      salary: salary.trim(),
      description: description ? description.trim() : "",
      workers_needed,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE /api/jobs/[id] — Soft delete (set is_active = false)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = getSupabase();
  const { id } = await params;

  const { error } = await supabase
    .from("jobs")
    .update({ is_active: false })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
