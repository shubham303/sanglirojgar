import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/admin/job-seekers/[phone]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ phone: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { phone } = await params;
  const db = getDb();
  const { data, error } = await db.getJobSeekerByPhone(phone);

  if (error || !data) {
    return NextResponse.json({ error: error || "Not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

// PUT /api/admin/job-seekers/[phone]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ phone: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { phone } = await params;
  const body = await request.json();
  const { name } = body;

  if (!name || !name.trim()) {
    return NextResponse.json({ error: "नाव रिकामे ठेवता येणार नाही" }, { status: 400 });
  }

  const db = getDb();
  const { data, error } = await db.updateJobSeeker(phone, name.trim());

  if (error || !data) {
    return NextResponse.json({ error: error || "Failed to update" }, { status: 400 });
  }

  return NextResponse.json(data);
}

// DELETE /api/admin/job-seekers/[phone]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ phone: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { phone } = await params;
  const db = getDb();
  const { error } = await db.deleteJobSeeker(phone);

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
