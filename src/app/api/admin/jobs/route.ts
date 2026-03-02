import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
import { AdminJobFilters } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/admin/jobs — List all jobs with filters (admin only)
export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  const filters: AdminJobFilters = {
    page: parseInt(searchParams.get("page") || "1"),
    limit: parseInt(searchParams.get("limit") || "20"),
  };

  const jobTypeId = searchParams.get("job_type_id");
  if (jobTypeId) filters.job_type_id = parseInt(jobTypeId);

  const district = searchParams.get("district");
  if (district) filters.district = district;

  const taluka = searchParams.get("taluka");
  if (taluka) filters.taluka = taluka;

  const phone = searchParams.get("phone");
  if (phone) filters.phone = phone;

  const search = searchParams.get("search");
  if (search) filters.search = search;

  const isActive = searchParams.get("is_active");
  if (isActive === "true") filters.is_active = true;
  else if (isActive === "false") filters.is_active = false;

  const db = getDb();
  const { data, error } = await db.getAllJobsPaginated(filters);

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json(data);
}
