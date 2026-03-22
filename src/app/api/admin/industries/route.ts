import { NextRequest, NextResponse } from "next/server";
// Note: DELETE and GET/PUT by ID are handled in /[id]/route.ts
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/admin/industries — List all industries (admin only)
export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const { data, error } = await db.getIndustries();

  if (error || !data) {
    return NextResponse.json({ error: error || "Failed to fetch industries" }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/admin/industries — Add a new industry (admin only)
export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name_mr, name_en } = body;

  if (!name_mr || !name_mr.trim()) {
    return NextResponse.json(
      { error: "उद्योगाचे मराठी नाव रिकामे ठेवता येणार नाही" },
      { status: 400 }
    );
  }

  if (!name_en || !name_en.trim()) {
    return NextResponse.json(
      { error: "उद्योगाचे इंग्रजी नाव रिकामे ठेवता येणार नाही" },
      { status: 400 }
    );
  }

  const db = getDb();
  const { data, error } = await db.addIndustry(name_mr.trim(), name_en.trim());

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  return NextResponse.json(data, { status: 201 });
}

