import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

// POST /api/admin/employers/bulk-contact — Mark multiple employers as contacted
export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { phones } = await request.json();
  if (!Array.isArray(phones) || phones.length === 0) {
    return NextResponse.json({ error: "phones array required" }, { status: 400 });
  }

  const db = getDb();
  const errors: string[] = [];

  for (const phone of phones) {
    const { error } = await db.updateEmployerLastContacted(phone);
    if (error) errors.push(`${phone}: ${error}`);
  }

  if (errors.length > 0) {
    return NextResponse.json({ success: false, errors }, { status: 207 });
  }

  return NextResponse.json({ success: true });
}
