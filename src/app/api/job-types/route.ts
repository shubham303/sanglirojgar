import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/job-types — Public endpoint to fetch all job type options
// ?grouped=true returns industry-grouped structure for <optgroup> dropdowns
export async function GET(request: NextRequest) {
  const grouped = request.nextUrl.searchParams.get("grouped") === "true";

  const db = getDb();
  const { data, error } = await db.getJobTypes();
  if (error || !data) {
    return NextResponse.json({ error: error || "Failed to load job types" }, { status: 500 });
  }

  if (grouped) {
    const { data: industries, error: indError } = await db.getIndustries();
    if (indError || !industries) {
      return NextResponse.json({ error: indError || "Failed to load industries" }, { status: 500 });
    }

    const groupMap = new Map<number, {
      industry_id: number;
      industry_mr: string;
      industry_en: string;
      options: { id: number; label: string }[];
    }>();

    // Initialize groups in industry order
    for (const ind of industries) {
      groupMap.set(ind.id, {
        industry_id: ind.id,
        industry_mr: ind.name_mr,
        industry_en: ind.name_en,
        options: [],
      });
    }

    for (const jt of data) {
      const indId = jt.industry_id || 1;
      let group = groupMap.get(indId);
      if (!group) {
        group = {
          industry_id: indId,
          industry_mr: "सामान्य",
          industry_en: "General",
          options: [],
        };
        groupMap.set(indId, group);
      }
      group.options.push({ id: jt.id, label: `${jt.name_mr} (${jt.name_en})` });
    }

    const result = Array.from(groupMap.values()).filter((g) => g.options.length > 0);
    return NextResponse.json(result);
  }

  // Flat list (default)
  const options = data.map((jt) => ({
    id: jt.id,
    label: `${jt.name_mr} (${jt.name_en})`,
  }));

  return NextResponse.json(options);
}
