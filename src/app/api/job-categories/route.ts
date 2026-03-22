import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/job-categories — List all job categories (public)
export async function GET() {
  const db = getDb();
  const { data, error } = await db.getJobCategories();

  if (error || !data) {
    return NextResponse.json({ error: error || "Failed to fetch" }, { status: 500 });
  }

  return NextResponse.json(data);
}
