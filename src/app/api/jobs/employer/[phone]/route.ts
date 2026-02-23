import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// GET /api/jobs/employer/[phone] — Fetch all active jobs for a phone number
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ phone: string }> }
) {
  const supabase = getSupabase();
  const { phone } = await params;

  if (!phone || phone.length !== 10 || !/^\d{10}$/.test(phone)) {
    return NextResponse.json(
      { error: "फोन नंबर 10 अंकी असणे आवश्यक आहे" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("phone", phone)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
