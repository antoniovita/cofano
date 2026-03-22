import { cookies } from "next/headers";
import { getPrisma } from "@/lib/prisma";
import { verifySessionToken } from "@/lib/session";

export async function getCurrentUser() {
  const sessionCookieName = process.env.SESSION_COOKIE_NAME ?? "session";
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;
  if (!token) return null;

  let verified: ReturnType<typeof verifySessionToken>;
  try {
    verified = verifySessionToken(token);
  } catch {
    return null;
  }
  if (!verified.ok) return null;

  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { id: verified.user.id },
    select: { id: true, username: true, role: true },
  });

  return user;
}
