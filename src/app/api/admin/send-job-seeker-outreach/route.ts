import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// POST /api/admin/send-job-seeker-outreach — Send WhatsApp template to job seekers not yet contacted
// Body: { template_name?: string }
export async function POST(request: NextRequest) {
  const endpoint = process.env.WATI_ENDPOINT;
  const apiKey = process.env.WATI_API_KEY;

  if (!endpoint || !apiKey) {
    return NextResponse.json(
      { error: "WATI_ENDPOINT and WATI_API_KEY must be set in .env" },
      { status: 500 }
    );
  }

  let body: { template_name?: string; batch_size?: number } = {};
  try {
    body = await request.json();
  } catch {
    // use default
  }

  const templateName = body.template_name || "job_seeker_intro";
  const batchSize = Math.min(Math.max(body.batch_size || 1, 1), 500);

  const supabase = getSupabase();

  // Fetch up to 10 job seekers not yet contacted
  const { data: pending, error: fetchErr } = await supabase
    .from("job_seekers")
    .select("phone, name")
    .is("last_contacted_at", null)
    .limit(batchSize);

  if (fetchErr) {
    return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  }

  if (!pending || pending.length === 0) {
    return NextResponse.json({ sent: 0, failed: 0, total: 0 });
  }

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const seeker of pending) {
    try {
      const cleanPhone = seeker.phone.replace(/^\+?91/, "").replace(/\D/g, "");
      const url = `${endpoint}/api/v1/sendTemplateMessage?whatsappNumber=91${cleanPhone}`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          template_name: templateName,
          broadcast_name: "job_seeker_outreach",
          parameters: [],
        }),
      });

      if (res.ok) {
        await supabase
          .from("job_seekers")
          .update({ last_contacted_at: new Date().toISOString() })
          .eq("phone", seeker.phone);
        sent++;
      } else {
        const errData = await res.json().catch(() => ({}));
        errors.push(`${seeker.phone}: ${errData?.message || res.status}`);
        failed++;
      }
    } catch {
      failed++;
    }
  }

  return NextResponse.json({ sent, failed, total: pending.length, errors });
}
