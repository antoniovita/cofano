import { cookies } from "next/headers";
import { getPrisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { createSessionToken } from "@/lib/session";

async function readCredentials(
  request: Request
): Promise<{ username?: string; password?: string }> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = (await request.json()) as unknown;
    if (!body || typeof body !== "object") return {};
    const record = body as Record<string, unknown>;
    return {
      username: typeof record.username === "string" ? record.username : undefined,
      password: typeof record.password === "string" ? record.password : undefined,
    };
  }

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const form = await request.formData();
    const username = form.get("username");
    const password = form.get("password");
    return {
      username: typeof username === "string" ? username : undefined,
      password: typeof password === "string" ? password : undefined,
    };
  }

  return {};
}

export async function POST(request: Request) {
  const { username, password } = await readCredentials(request);
  if (!username || !password) {
    return Response.json(
      { ok: false, error: "missing_credentials" },
      { status: 400 }
    );
  }

  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true, username: true, passwordHash: true, role: true },
  });

  if (!user) {
    return Response.json(
      { ok: false, error: "invalid_credentials" },
      { status: 401 }
    );
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return Response.json(
      { ok: false, error: "invalid_credentials" },
      { status: 401 }
    );
  }

  const sessionCookieName = process.env.SESSION_COOKIE_NAME ?? "session";
  const ttlSeconds = Number(process.env.SESSION_TTL_SECONDS ?? "604800"); // 7d

  let token: string;
  try {
    token = createSessionToken(
      { id: user.id, username: user.username },
      { ttlSeconds: Number.isFinite(ttlSeconds) ? ttlSeconds : 604800 }
    );
  } catch {
    return Response.json(
      { ok: false, error: "server_misconfigured" },
      { status: 500 }
    );
  }

  const cookieStore = await cookies();
  cookieStore.set({
    name: sessionCookieName,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Number.isFinite(ttlSeconds) ? ttlSeconds : 604800,
  });

  return Response.json({ ok: true }, { status: 200 });
}
