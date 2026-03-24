import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
import { cleanPhone } from "@/lib/clean-phone";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// GET /api/admin/job-seekers — List all job seekers (admin only)
export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const { data, error } = await db.getJobSeekers();

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({
    seekers: data ?? [],
    total: data?.length ?? 0,
  });
}

// PATCH /api/admin/job-seekers — Bulk mark job seekers as contacted (admin only)
export async function PATCH(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { phones } = body as { phones: string[] };

  if (!phones || !Array.isArray(phones) || phones.length === 0) {
    return NextResponse.json({ error: "No phones provided" }, { status: 400 });
  }

  const supabase = getSupabase();
  const { error } = await supabase
    .from("job_seekers")
    .update({ last_contacted_at: new Date().toISOString() })
    .in("phone", phones);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ marked: phones.length });
}

// POST /api/admin/job-seekers — Bulk add job seekers from CSV data (admin only)
export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { rows } = body as { rows: { name: string; phone: string }[] };

  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "No rows provided" }, { status: 400 });
  }

  // Clean and deduplicate
  const seen = new Set<string>();
  const cleaned: { phone: string; name: string }[] = [];

  for (const row of rows) {
    const phone = cleanPhone(row.phone || "");
    if (!phone || seen.has(phone)) continue;
    seen.add(phone);
    cleaned.push({ phone, name: (row.name || "").trim() });
  }

  if (cleaned.length === 0) {
    return NextResponse.json({ error: "No valid phone numbers found" }, { status: 400 });
  }

  const supabase = getSupabase();

  // Check which phones already exist
  const phones = cleaned.map((r) => r.phone);
  const { data: existing } = await supabase
    .from("job_seekers")
    .select("phone")
    .in("phone", phones);

  const existingSet = new Set((existing ?? []).map((r) => r.phone));
  const newRows = cleaned.filter((r) => !existingSet.has(r.phone));

  if (newRows.length > 0) {
    const { error } = await supabase.from("job_seekers").insert(newRows);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({
    added: newRows.length,
    duplicates: cleaned.length - newRows.length,
    total: cleaned.length,
  });
}
