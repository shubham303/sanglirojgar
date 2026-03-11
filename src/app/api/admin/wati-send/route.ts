import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// POST /api/admin/wati-send — Send a WATI template message to a single number
// Body: { phone: string, template_name: string, broadcast_name?: string }
export async function POST(request: NextRequest) {
  const endpoint = process.env.WATI_ENDPOINT;
  const apiKey = process.env.WATI_API_KEY;

  if (!endpoint || !apiKey) {
    return NextResponse.json(
      { error: "WATI_ENDPOINT and WATI_API_KEY must be set in .env" },
      { status: 500 }
    );
  }

  let body: { phone?: string; template_name?: string; broadcast_name?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { phone, template_name, broadcast_name } = body;

  if (!phone || !template_name) {
    return NextResponse.json(
      { error: "phone and template_name are required" },
      { status: 400 }
    );
  }

  // Strip leading +91 or 91 if present, WATI expects 10-digit Indian number
  const cleanPhone = phone.replace(/^\+?91/, "").replace(/\D/g, "");

  try {
    const url = `${endpoint}/api/v1/sendTemplateMessage?whatsappNumber=91${cleanPhone}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        template_name,
        broadcast_name: broadcast_name || template_name,
        parameters: [],
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      return NextResponse.json({ success: true, data });
    } else {
      return NextResponse.json(
        { error: data?.message || `WATI returned ${res.status}`, data },
        { status: 502 }
      );
    }
  } catch (e: unknown) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 }
    );
  }
}
