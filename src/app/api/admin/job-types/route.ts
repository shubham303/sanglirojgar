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

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/admin/job-types — Add a new job type (admin only)
export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name } = body;

  if (!name || !name.trim()) {
    return NextResponse.json(
      { error: "कामाचा प्रकार रिकामा ठेवता येणार नाही" },
      { status: 400 }
    );
  }

  const db = getDb();
  const { data, error } = await db.addJobType(name.trim());

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  return NextResponse.json(data, { status: 201 });
}

// DELETE /api/admin/job-types — Delete a job type (admin only)
export async function DELETE(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json(
      { error: "Job type ID आवश्यक आहे" },
      { status: 400 }
    );
  }

  const db = getDb();
  const { error } = await db.deleteJobType(id);

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
