import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/admin/job-types — List all job types (admin only)
export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const { data, error } = await db.getJobTypes();

  if (error || !data) {
    return NextResponse.json({ error: error || "Failed to fetch job types" }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/admin/job-types — Add a new job type (admin only)
export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, name_en, category_id } = body;

  if (!name || !name.trim()) {
    return NextResponse.json(
      { error: "कामाचा प्रकार रिकामा ठेवता येणार नाही" },
      { status: 400 }
    );
  }

  const db = getDb();
  const { data, error } = await db.addJobType(
    name.trim(),
    name_en?.trim() || undefined,
    category_id || undefined
  );

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  return NextResponse.json(data, { status: 201 });
}

