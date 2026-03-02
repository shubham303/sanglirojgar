import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { JOB_TYPE_OPTIONS } from "@/lib/constants";

export const dynamic = "force-dynamic";

// GET /api/job-types — Public endpoint to fetch all job type options
export async function GET() {
  try {
    const db = getDb();
    const { data, error } = await db.getJobTypes();
    if (error || !data) throw new Error(error || "No data");

    const options = data.map((jt) => ({
      id: jt.id,
      label: `${jt.name_mr} (${jt.name_en})`,
    }));

    return NextResponse.json(options);
  } catch {
    // Fallback to hardcoded constants
    return NextResponse.json(JOB_TYPE_OPTIONS);
  }
}
