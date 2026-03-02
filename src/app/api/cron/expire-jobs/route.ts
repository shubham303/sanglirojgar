import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { Job } from "@/lib/types";

export const dynamic = "force-dynamic";

/** Stub: will be replaced with real WhatsApp/SMS notification later */
function notifyEmployerExpired(job: Job) {
  console.log(
    `[expire-jobs] Job ${job.id} expired — employer: ${job.employer_name}, phone: ${job.phone}`
  );
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const { data, error } = await db.expireOldJobs();

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  const expiredJobs = data ?? [];
  for (const job of expiredJobs) {
    notifyEmployerExpired(job);
  }

  return NextResponse.json({
    success: true,
    expired_count: expiredJobs.length,
  });
}
