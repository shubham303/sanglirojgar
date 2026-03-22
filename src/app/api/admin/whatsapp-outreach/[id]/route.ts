import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/admin/whatsapp-outreach/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const db = getDb();
  const { data, error } = await db.getWhatsappOutreachById(id);

  if (error || !data) {
    return NextResponse.json({ error: error || "Not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

// PUT /api/admin/whatsapp-outreach/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { phone, source_group, message_sent, sent_date } = body;

  const fields: Record<string, unknown> = {};
  if (phone !== undefined) fields.phone = phone;
  if (source_group !== undefined) fields.source_group = source_group;
  if (message_sent !== undefined) fields.message_sent = message_sent;
  if (sent_date !== undefined) fields.sent_date = sent_date;

  if (Object.keys(fields).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const db = getDb();
  const { data, error } = await db.updateWhatsappOutreach(id, fields);

  if (error || !data) {
    return NextResponse.json({ error: error || "Failed to update" }, { status: 400 });
  }

  return NextResponse.json(data);
}

// DELETE /api/admin/whatsapp-outreach/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const db = getDb();
  const { error } = await db.deleteWhatsappOutreach(id);

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
