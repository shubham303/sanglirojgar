import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/admin/job-types/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const db = getDb();
  const { data, error } = await db.getJobTypes();

  if (error || !data) {
    return NextResponse.json({ error: error || "Failed to fetch" }, { status: 500 });
  }

  const jobType = data.find((jt) => jt.id === parseInt(id));
  if (!jobType) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(jobType);
}

// PUT /api/admin/job-types/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { name_mr, name_en, category_id } = body;

  if (name_mr !== undefined && !name_mr.trim()) {
    return NextResponse.json({ error: "कामाचा प्रकार रिकामा ठेवता येणार नाही" }, { status: 400 });
  }

  const fields: { name_mr?: string; name_en?: string; category_id?: number } = {};
  if (name_mr !== undefined) fields.name_mr = name_mr.trim();
  if (name_en !== undefined) fields.name_en = name_en.trim();
  if (category_id !== undefined) fields.category_id = category_id;

  if (Object.keys(fields).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const db = getDb();
  const { data, error } = await db.updateJobType(parseInt(id), fields);

  if (error || !data) {
    return NextResponse.json({ error: error || "Failed to update" }, { status: 400 });
  }

  return NextResponse.json(data);
}

// DELETE /api/admin/job-types/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const db = getDb();
  const { error } = await db.deleteJobType(id);

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
