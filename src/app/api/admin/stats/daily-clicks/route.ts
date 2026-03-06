import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/admin/stats/daily-clicks?days=30
export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const days = parseInt(request.nextUrl.searchParams.get("days") || "30");
  const db = getDb();
  const { data, error } = await db.getDailyClickStats(days);

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json(data);
}
