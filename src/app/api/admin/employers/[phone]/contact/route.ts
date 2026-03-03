import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

// POST /api/admin/employers/[phone]/contact — Mark employer as contacted by admin
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ phone: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { phone } = await params;
  const db = getDb();
  const { error } = await db.updateEmployerLastContacted(phone);

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
