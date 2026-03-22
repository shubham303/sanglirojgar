import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// GET /api/job-types — Public endpoint to fetch all job type options
// ?grouped=category → category-grouped structure
// ?popular=true     → top 12 most-used job types sorted by frequency
// default           → flat list with id, name_mr, name_en, label
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const popular = searchParams.get("popular") === "true";

  const db = getDb();
  const { data, error } = await db.getJobTypes();
  if (error || !data) {
    return NextResponse.json({ error: error || "Failed to load job types" }, { status: 500 });
  }

  if (searchParams.get("grouped") === "category") {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: categories } = await supabase
      .from("job_categories")
      .select("id, name_mr, name_en")
      .order("id", { ascending: true });

    const { data: jobTypesWithCat } = await supabase
      .from("job_types")
      .select("id, name_mr, name_en, category_id")
      .order("id", { ascending: true });

    const groupMap = new Map<number, { category_id: number; category_mr: string; category_en: string; options: { id: number; name_mr: string; name_en: string; label: string }[] }>();

    for (const cat of categories || []) {
      groupMap.set(cat.id, { category_id: cat.id, category_mr: cat.name_mr, category_en: cat.name_en, options: [] });
    }
    for (const jt of jobTypesWithCat || []) {
      const group = groupMap.get(jt.category_id);
      if (group) group.options.push({ id: jt.id, name_mr: jt.name_mr, name_en: jt.name_en, label: `${jt.name_mr} (${jt.name_en})` });
    }

    return NextResponse.json(Array.from(groupMap.values()).filter((g) => g.options.length > 0));
  }

  if (popular) {
    // Query job_type_id counts directly from Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: rows } = await supabase
      .from("jobs")
      .select("job_type_id")
      .eq("is_deleted", false);

    const counts = new Map<number, number>();
    for (const row of rows || []) {
      counts.set(row.job_type_id, (counts.get(row.job_type_id) || 0) + 1);
    }

    const topIds = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([id]) => id);

    const result = topIds
      .map((id) => data.find((jt) => jt.id === id))
      .filter(Boolean)
      .map((jt) => ({ id: jt!.id, name_mr: jt!.name_mr, name_en: jt!.name_en, label: `${jt!.name_mr} (${jt!.name_en})` }));

    return NextResponse.json(result);
  }

  // Flat list (default) — includes name_mr and name_en for richer display
  return NextResponse.json(data.map((jt) => ({
    id: jt.id,
    name_mr: jt.name_mr,
    name_en: jt.name_en,
    label: `${jt.name_mr} (${jt.name_en})`,
  })));
}
