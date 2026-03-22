import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/admin/industries/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const db = getDb();
  const { data, error } = await db.getIndustries();

  if (error || !data) {
    return NextResponse.json({ error: error || "Failed to fetch" }, { status: 500 });
  }

  const industry = data.find((i) => i.id === parseInt(id));
  if (!industry) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(industry);
}

// PUT /api/admin/industries/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { name_mr, name_en } = body;

  if (!name_mr || !name_mr.trim()) {
    return NextResponse.json({ error: "उद्योगाचे मराठी नाव रिकामे ठेवता येणार नाही" }, { status: 400 });
  }
  if (!name_en || !name_en.trim()) {
    return NextResponse.json({ error: "उद्योगाचे इंग्रजी नाव रिकामे ठेवता येणार नाही" }, { status: 400 });
  }

  const db = getDb();
  const { data, error } = await db.updateIndustry(parseInt(id), name_mr.trim(), name_en.trim());

  if (error || !data) {
    return NextResponse.json({ error: error || "Failed to update" }, { status: 400 });
  }

  return NextResponse.json(data);
}

// DELETE /api/admin/industries/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const db = getDb();
  const { error } = await db.deleteIndustry(id);

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
