import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, phone } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "नाव आवश्यक आहे" }, { status: 400 });
  }

  if (!phone || typeof phone !== "string" || !/^\d{10}$/.test(phone)) {
    return NextResponse.json({ error: "10 अंकी फोन नंबर आवश्यक आहे" }, { status: 400 });
  }

  const db = getDb();
  const { error } = await db.upsertJobSeeker(phone.trim(), name.trim());

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
