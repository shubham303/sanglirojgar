import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { cleanPhone } from "@/lib/clean-phone";

export const dynamic = "force-dynamic";

// GET /api/admin/job-seekers — Get job seekers stats
export async function GET() {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("job_seekers")
    .select("phone, name, created_at, last_contacted_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    seekers: data ?? [],
    total: data?.length ?? 0,
  });
}

// POST /api/admin/job-seekers — Bulk add job seekers from CSV data
export async function POST(request: NextRequest) {
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
