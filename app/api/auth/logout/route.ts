import { cookies } from "next/headers";

export async function POST() {
  const sessionCookieName = process.env.SESSION_COOKIE_NAME ?? "session";
  const cookieStore = await cookies();
  cookieStore.delete(sessionCookieName);
  return Response.json({ ok: true }, { status: 200 });
}

