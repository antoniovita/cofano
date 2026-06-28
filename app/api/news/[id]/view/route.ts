import { getPrisma } from "@/lib/prisma";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const prisma = getPrisma();

    const exists = await prisma.news.findUnique({ where: { id }, select: { id: true } });
    if (!exists) return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });

    await prisma.news.update({ where: { id }, data: { views: { increment: 1 } } });

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500 });
  }
}
