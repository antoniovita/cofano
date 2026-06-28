import { getCurrentUser } from "@/lib/currentUser";
import { getPrisma } from "@/lib/prisma";

function unauth() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

// PATCH /api/me/preferences — update locale and/or theme
export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauth();

  let body: unknown;
  try { body = await req.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }

  if (typeof body !== "object" || body === null) return Response.json({ error: "Invalid body" }, { status: 400 });
  const b = body as Record<string, unknown>;

  const data: { locale?: string; theme?: "DARK" | "LIGHT" } = {};

  if (typeof b.locale === "string") {
    const locale = b.locale.trim().toLowerCase();
    if (!/^[a-z]{2}([-_][a-z]{2})?$/.test(locale)) return Response.json({ error: "Invalid locale" }, { status: 400 });
    data.locale = locale;
  }

  if (typeof b.theme === "string") {
    const theme = b.theme.toUpperCase();
    if (theme !== "DARK" && theme !== "LIGHT") return Response.json({ error: "Invalid theme" }, { status: 400 });
    data.theme = theme;
  }

  if (Object.keys(data).length === 0) return Response.json({ error: "No fields to update" }, { status: 400 });

  const prisma = getPrisma();
  await prisma.user.update({ where: { id: user.id }, data });

  return Response.json({ ok: true });
}
