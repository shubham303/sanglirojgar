import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/admin/job-categories — List all job categories (admin only)
export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const { data, error } = await db.getJobCategories();

  if (error || !data) {
    return NextResponse.json({ error: error || "Failed to fetch" }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/admin/job-categories — Create a new job category (admin only)
export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name_en, name_mr, slug } = body;

  if (!name_en || !name_en.trim()) {
    return NextResponse.json({ error: "इंग्रजी नाव आवश्यक आहे" }, { status: 400 });
  }
  if (!name_mr || !name_mr.trim()) {
    return NextResponse.json({ error: "मराठी नाव आवश्यक आहे" }, { status: 400 });
  }
  if (!slug || !slug.trim()) {
    return NextResponse.json({ error: "Slug आवश्यक आहे" }, { status: 400 });
  }

  const db = getDb();
  const { data, error } = await db.createJobCategory(name_en.trim(), name_mr.trim(), slug.trim());

  if (error || !data) {
    return NextResponse.json({ error: error || "Failed to create" }, { status: 400 });
  }

  return NextResponse.json(data, { status: 201 });
}
