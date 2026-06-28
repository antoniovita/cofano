import { getCurrentUser } from "@/lib/currentUser";
import { getPrisma } from "@/lib/prisma";

function unauth() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

// GET /api/news/saved — list saved news for current user
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauth();

  const prisma = getPrisma();
  const saved = await prisma.savedNews.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      news: {
        include: {
          author: { select: { id: true, username: true, role: true } },
          translations: {
            where: { locale: user.locale ?? "pt" },
            take: 1,
            select: { locale: true, title: true, content: true, wordCount: true, readingTimeMinutes: true },
          },
        },
      },
    },
  });

  const items = saved.map(({ createdAt, news: n }) => {
    const t = n.translations[0];
    return {
      savedAt: createdAt,
      id: n.id,
      title: t?.title ?? "",
      tag: n.tag,
      cover: n.cover,
      views: n.views,
      wordCount: t?.wordCount ?? 0,
      readingTimeMinutes: t?.readingTimeMinutes ?? 0,
      createdAt: n.createdAt,
      author: n.author,
    };
  });

  return Response.json(items);
}

// POST /api/news/saved?id=<newsId>
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauth();

  const { searchParams } = new URL(req.url);
  const newsId = searchParams.get("id")?.trim();
  if (!newsId) return Response.json({ error: "id is required" }, { status: 400 });

  const prisma = getPrisma();
  const exists = await prisma.news.findUnique({ where: { id: newsId }, select: { id: true } });
  if (!exists) return Response.json({ error: "Not found" }, { status: 404 });

  await prisma.savedNews.upsert({
    where: { userId_newsId: { userId: user.id, newsId } },
    create: { userId: user.id, newsId },
    update: {},
  });

  return Response.json({ ok: true });
}

// DELETE /api/news/saved?id=<newsId>
export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauth();

  const { searchParams } = new URL(req.url);
  const newsId = searchParams.get("id")?.trim();
  if (!newsId) return Response.json({ error: "id is required" }, { status: 400 });

  const prisma = getPrisma();
  await prisma.savedNews.deleteMany({ where: { userId: user.id, newsId } });

  return Response.json({ ok: true });
}
