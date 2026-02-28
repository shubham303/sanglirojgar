import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = getDb();
  const { id } = await params;

  let body: { type?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.type !== "call" && body.type !== "whatsapp") {
    return NextResponse.json(
      { error: "type must be 'call' or 'whatsapp'" },
      { status: 400 }
    );
  }

  const field = body.type === "call" ? "call_count" : "whatsapp_count";
  const { error } = await db.incrementJobClick(id, field);

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
