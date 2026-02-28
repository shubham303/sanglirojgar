import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/job-types — Public endpoint to fetch all job types
export async function GET() {
  const db = getDb();
  const { data, error } = await db.getJobTypes();

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  // Return just the names for public use
  const names = (data || []).map((jt) => jt.name);
  return NextResponse.json(names);
}
