import { getCurrentUser } from "@/lib/currentUser";
import { getPrisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

async function readCredentials(
  request: Request
): Promise<{ username?: string; password?: string; role?: "ADMIN" | "USER" }> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = (await request.json()) as unknown;
    if (!body || typeof body !== "object") return {};
    const record = body as Record<string, unknown>;
    const role = typeof record.role === "string" ? record.role : undefined;
    return {
      username: typeof record.username === "string" ? record.username : undefined,
      password: typeof record.password === "string" ? record.password : undefined,
      role: role === "ADMIN" || role === "USER" ? role : undefined,
    };
  }

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const form = await request.formData();
    const username = form.get("username");
    const password = form.get("password");
    const role = form.get("role");
    return {
      username: typeof username === "string" ? username : undefined,
      password: typeof password === "string" ? password : undefined,
      role: role === "ADMIN" || role === "USER" ? role : undefined,
    };
  }

  return {};
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (currentUser.role !== "ADMIN") {
    return Response.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const { username, password, role } = await readCredentials(request);
  if (!username || !password) {
    return Response.json(
      { ok: false, error: "missing_credentials" },
      { status: 400 }
    );
  }

  const passwordHash = await hashPassword(password);

  try {
    const prisma = getPrisma();
    const user = await prisma.user.create({
      data: { username, passwordHash, role: role ?? "USER" },
      select: { id: true, username: true, role: true },
    });
    return Response.json({ ok: true, user }, { status: 201 });
  } catch {
    return Response.json({ ok: false, error: "conflict" }, { status: 409 });
  }
}
