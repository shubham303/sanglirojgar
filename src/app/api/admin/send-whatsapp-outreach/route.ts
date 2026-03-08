import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// POST /api/admin/send-whatsapp-outreach — Send WhatsApp template to pending contacts
export async function POST() {
  const endpoint = process.env.WATI_ENDPOINT;
  const apiKey = process.env.WATI_API_KEY;
  const templateName = process.env.WATI_TEMPLATE_NAME;

  if (!endpoint || !apiKey || !templateName) {
    return NextResponse.json(
      { error: "WATI environment variables not configured" },
      { status: 500 }
    );
  }

  const supabase = getSupabase();

  // Fetch all pending contacts
  const { data: pending, error: fetchErr } = await supabase
    .from("whatsapp_outreach")
    .select("id, phone")
    .eq("message_sent", false);

  if (fetchErr) {
    return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  }

  if (!pending || pending.length === 0) {
    return NextResponse.json({ sent: 0, failed: 0, total: 0 });
  }

  let sent = 0;
  let failed = 0;

  for (const record of pending) {
    try {
      const url = `${endpoint}/api/v1/sendTemplateMessage?whatsappNumber=${record.phone}`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          template_name: templateName,
          broadcast_name: "whatsapp_outreach",
          parameters: [],
        }),
      });

      if (res.ok) {
        // Mark as sent
        await supabase
          .from("whatsapp_outreach")
          .update({ message_sent: true, sent_date: new Date().toISOString() })
          .eq("id", record.id);
        sent++;
      } else {
        failed++;
      }
    } catch {
      failed++;
    }
  }

  return NextResponse.json({ sent, failed, total: pending.length });
}
