import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/jobs/employer/[phone] — Fetch all active jobs for a phone number
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ phone: string }> }
) {
  const db = getDb();
  const { phone } = await params;

  if (!phone || phone.length !== 10 || !/^\d{10}$/.test(phone)) {
    return NextResponse.json(
      { error: "फोन नंबर 10 अंकी असणे आवश्यक आहे" },
      { status: 400 }
    );
  }

  const { data, error } = await db.getAllJobsByPhone(phone);

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json(data);
}
