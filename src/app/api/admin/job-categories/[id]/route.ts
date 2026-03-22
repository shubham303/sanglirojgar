import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/admin/job-categories/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const db = getDb();
  const { data, error } = await db.getJobCategoryById(parseInt(id));

  if (error || !data) {
    return NextResponse.json({ error: error || "Not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

// PUT /api/admin/job-categories/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { name_en, name_mr, slug } = body;

  const fields: { name_en?: string; name_mr?: string; slug?: string } = {};
  if (name_en !== undefined) fields.name_en = name_en.trim();
  if (name_mr !== undefined) fields.name_mr = name_mr.trim();
  if (slug !== undefined) fields.slug = slug.trim();

  if (Object.keys(fields).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const db = getDb();
  const { data, error } = await db.updateJobCategory(parseInt(id), fields);

  if (error || !data) {
    return NextResponse.json({ error: error || "Failed to update" }, { status: 400 });
  }

  return NextResponse.json(data);
}

// DELETE /api/admin/job-categories/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const db = getDb();
  const { error } = await db.deleteJobCategory(parseInt(id));

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
