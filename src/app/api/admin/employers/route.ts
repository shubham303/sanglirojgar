import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/admin/employers — List all employers (admin only)
export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const { data, error } = await db.getEmployers();

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/admin/employers — Create a new employer (admin only)
export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { phone, name } = body;

  if (!phone || !phone.trim()) {
    return NextResponse.json({ error: "फोन नंबर आवश्यक आहे" }, { status: 400 });
  }
  if (!name || !name.trim()) {
    return NextResponse.json({ error: "नाव आवश्यक आहे" }, { status: 400 });
  }

  const db = getDb();
  const { data, error } = await db.createEmployer(phone.trim(), name.trim());

  if (error || !data) {
    return NextResponse.json({ error: error || "Failed to create" }, { status: 400 });
  }

  return NextResponse.json(data, { status: 201 });
}
