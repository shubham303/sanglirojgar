import { NextResponse } from "next/server";
import { JOB_TYPE_NAMES } from "@/lib/constants";

// GET /api/job-types — Public endpoint to fetch all job type names
export async function GET() {
  return NextResponse.json(JOB_TYPE_NAMES);
}
