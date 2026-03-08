import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { cleanPhone } from "@/lib/clean-phone";

export const dynamic = "force-dynamic";

// GET /api/admin/whatsapp-outreach — Get today's added numbers + pending count
export async function GET() {
  const supabase = getSupabase();

  // Today's numbers (IST start of day)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data: todayNumbers, error: todayErr } = await supabase
    .from("whatsapp_outreach")
    .select("phone, source_group, added_date")
    .gte("added_date", todayStart.toISOString())
    .order("added_date", { ascending: false });

  if (todayErr) {
    return NextResponse.json({ error: todayErr.message }, { status: 500 });
  }

  // Pending count
  const { count, error: countErr } = await supabase
    .from("whatsapp_outreach")
    .select("id", { count: "exact", head: true })
    .eq("message_sent", false);

  if (countErr) {
    return NextResponse.json({ error: countErr.message }, { status: 500 });
  }

  return NextResponse.json({
    todayNumbers: todayNumbers ?? [],
    pendingCount: count ?? 0,
  });
}

// POST /api/admin/whatsapp-outreach — Add phone numbers
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { numbers, source_group } = body as {
    numbers: string;
    source_group?: string;
  };

  if (!numbers || typeof numbers !== "string") {
    return NextResponse.json({ error: "numbers required" }, { status: 400 });
  }

  const lines = numbers
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const cleaned: string[] = [];
  for (const line of lines) {
    const phone = cleanPhone(line);
    if (phone) cleaned.push(phone);
  }

  if (cleaned.length === 0) {
    return NextResponse.json(
      { error: "No valid phone numbers found" },
      { status: 400 }
    );
  }

  const supabase = getSupabase();

  // Deduplicate within the batch
  const unique = [...new Set(cleaned)];

  // Check which phones already exist
  const { data: existing } = await supabase
    .from("whatsapp_outreach")
    .select("phone")
    .in("phone", unique);

  const existingSet = new Set((existing ?? []).map((r) => r.phone));
  const newPhones = unique.filter((p) => !existingSet.has(p));

  // Insert new numbers
  if (newPhones.length > 0) {
    const rows = newPhones.map((phone) => ({
      phone,
      source_group: source_group?.trim() || null,
    }));
    await supabase.from("whatsapp_outreach").insert(rows);
  }

  const added = newPhones.length;
  const duplicates = unique.length - added;

  return NextResponse.json({ added, duplicates, total: unique.length });
}
