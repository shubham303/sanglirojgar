import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
import { cleanPhone } from "@/lib/clean-phone";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// GET /api/admin/whatsapp-outreach — Get outreach records with optional filters
export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const view = searchParams.get("view"); // "today" for legacy dashboard view

  // Legacy dashboard view: today's numbers + pending count
  if (view === "today") {
    const supabase = getSupabase();

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

  // Standard paginated list
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");
  const messageSentParam = searchParams.get("message_sent");
  const message_sent = messageSentParam !== null ? messageSentParam === "true" : undefined;

  const db = getDb();
  const { data, error } = await db.getWhatsappOutreach({ page, limit, message_sent });

  if (error || !data) {
    return NextResponse.json({ error: error || "Failed to fetch" }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/admin/whatsapp-outreach — Add phone numbers for outreach
export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
    return NextResponse.json({ error: "No valid phone numbers found" }, { status: 400 });
  }

  const supabase = getSupabase();
  const unique = [...new Set(cleaned)];

  const { data: existing } = await supabase
    .from("whatsapp_outreach")
    .select("phone")
    .in("phone", unique);

  const existingSet = new Set((existing ?? []).map((r) => r.phone));
  const newPhones = unique.filter((p) => !existingSet.has(p));

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
