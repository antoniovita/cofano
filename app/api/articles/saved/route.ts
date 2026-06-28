import { getCurrentUser } from "@/lib/currentUser";
import { getPrisma } from "@/lib/prisma";

function unauth() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

// GET /api/articles/saved — list saved articles for current user
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauth();

  const prisma = getPrisma();
  const saved = await prisma.savedArticle.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      article: {
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

  const items = saved.map(({ createdAt, article: a }) => {
    const t = a.translations[0];
    return {
      savedAt: createdAt,
      id: a.id,
      title: t?.title ?? "",
      tag: a.tag,
      cover: a.cover,
      views: a.views,
      wordCount: t?.wordCount ?? 0,
      readingTimeMinutes: t?.readingTimeMinutes ?? 0,
      createdAt: a.createdAt,
      author: a.author,
    };
  });

  return Response.json(items);
}

// POST /api/articles/saved?id=<articleId>
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauth();

  const { searchParams } = new URL(req.url);
  const articleId = searchParams.get("id")?.trim();
  if (!articleId) return Response.json({ error: "id is required" }, { status: 400 });

  const prisma = getPrisma();
  const exists = await prisma.article.findUnique({ where: { id: articleId }, select: { id: true } });
  if (!exists) return Response.json({ error: "Not found" }, { status: 404 });

  await prisma.savedArticle.upsert({
    where: { userId_articleId: { userId: user.id, articleId } },
    create: { userId: user.id, articleId },
    update: {},
  });

  return Response.json({ ok: true });
}

// DELETE /api/articles/saved?id=<articleId>
export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauth();

  const { searchParams } = new URL(req.url);
  const articleId = searchParams.get("id")?.trim();
  if (!articleId) return Response.json({ error: "id is required" }, { status: 400 });

  const prisma = getPrisma();
  await prisma.savedArticle.deleteMany({ where: { userId: user.id, articleId } });

  return Response.json({ ok: true });
}
