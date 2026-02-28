import { cookies } from "next/headers";

const ADMIN_USER = "shubham";
const ADMIN_PASS = "shubham";
const COOKIE_NAME = "admin_session";
const SESSION_TOKEN = "sanglirojgar_admin_active";

export function validateCredentials(
  userId: string,
  password: string
): boolean {
  return userId === ADMIN_USER && password === ADMIN_PASS;
}

export async function setAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, SESSION_TOKEN, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 1 day
  });
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME);
  return token?.value === SESSION_TOKEN;
}
