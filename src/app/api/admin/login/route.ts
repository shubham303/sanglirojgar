import { NextRequest, NextResponse } from "next/server";
import { validateCredentials, setAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId, password } = body;

  if (!userId || !password) {
    return NextResponse.json(
      { error: "युजर आयडी आणि पासवर्ड आवश्यक आहे" },
      { status: 400 }
    );
  }

  if (!validateCredentials(userId, password)) {
    return NextResponse.json(
      { error: "चुकीचा युजर आयडी किंवा पासवर्ड" },
      { status: 401 }
    );
  }

  await setAdminSession();

  return NextResponse.json({ success: true });
}
