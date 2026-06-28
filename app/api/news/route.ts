import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/currentUser";
import { getPrisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function toPositiveInt(value: string | null, fallback: number) {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function toBool(value: string | null) {
  if (!value) return null;
  const v = value.toLowerCase();
  if (v === "true" || v === "1" || v === "yes") return true;
  if (v === "false" || v === "0" || v === "no") return false;
  return null;
}

function getLocale(value: string | null) {
  const locale = (value || "").trim().toLowerCase();
  if (!locale) return "pt";
  if (!/^[a-z]{2}([-_][a-z]{2})?$/.test(locale)) return null;
  return locale.replace("_", "-");
}

function computeWordMetrics(content: string) {
  const words = content.trim().split(/\s+/g).filter(Boolean);
  const wordCount = words.length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
  return { wordCount, readingTimeMinutes };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(body: Record<string, unknown>, key: string) {
  const value = body[key];
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function getBoolean(body: Record<string, unknown>, key: string) {
  const value = body[key];
  return typeof value === "boolean" ? value : null;
}

type ApiNewsShape = {
  id: string;
  title: string;
  content: string;
  tag: string;
  cover: string;
  published: boolean;
  featured: boolean;
  wordCount: number;
  readingTimeMinutes: number;
  views: number;
  locale: string;
  defaultLocale: string;
  createdAt: Date;
  updatedAt: Date;
  author: { id: string; username: string; role: string };
};

function shapeNews(
  news: {
    id: string;
    tag: string;
    cover: string;
    published: boolean;
    featured: boolean;
    views: number;
    defaultLocale: string;
    createdAt: Date;
    updatedAt: Date;
    author: { id: string; username: string; role: string };
    translations: Array<{
      locale: string;
      title: string;
      content: string;
      wordCount: number;
      readingTimeMinutes: number;
    }>;
  },
  locale: string
): ApiNewsShape {
  const t = news.translations[0];
  return {
    id: news.id,
    title: t?.title || "",
    content: t?.content || "",
    wordCount: t?.wordCount || 0,
    readingTimeMinutes: t?.readingTimeMinutes || 0,
    tag: news.tag,
    cover: news.cover,
    published: news.published,
    featured: news.featured,
    views: news.views,
    locale: t?.locale || locale,
    defaultLocale: news.defaultLocale,
    createdAt: news.createdAt,
    updatedAt: news.updatedAt,
    author: news.author,
  };
}

const TRANSLATION_SELECT = {
  locale: true,
  title: true,
  content: true,
  wordCount: true,
  readingTimeMinutes: true,
} as const;

export async function GET(req: Request) {
  try {
    const prisma = getPrisma();
    const { searchParams } = new URL(req.url);

    const id = searchParams.get("id")?.trim() || null;
    const tag = searchParams.get("tag")?.trim() || null;
    const q = searchParams.get("q")?.trim() || null;
    const authorId = searchParams.get("authorId")?.trim() || null;
    const published = toBool(searchParams.get("published"));
    const featured = toBool(searchParams.get("featured"));
    const order = (searchParams.get("order") || "createdAt").trim();
    const direction = (searchParams.get("direction") || "desc").trim();
    const sortOrder: Prisma.SortOrder = direction === "asc" ? "asc" : "desc";
    const take = Math.min(50, Math.max(1, toPositiveInt(searchParams.get("take"), 20)));
    const skip = toPositiveInt(searchParams.get("skip"), 0);
    const locale = getLocale(searchParams.get("locale"));
    if (!locale) return jsonError("Invalid locale", 400);

    if (id) {
      const news = await prisma.news.findUnique({
        where: { id },
        include: {
          author: { select: { id: true, username: true, role: true } },
          translations: { where: { locale }, take: 1, select: TRANSLATION_SELECT },
        },
      });
      if (!news) return jsonError("News not found", 404);

      if (news.translations.length === 0) {
        const fallback = await prisma.newsTranslation.findFirst({
          where: { newsId: id },
          orderBy: { createdAt: "asc" },
          select: TRANSLATION_SELECT,
        });
        return NextResponse.json(shapeNews({ ...news, translations: fallback ? [fallback] : [] }, locale));
      }

      return NextResponse.json(shapeNews(news, locale));
    }

    const where: Prisma.NewsWhereInput = {};
    if (tag) where.tag = tag;
    if (authorId) where.authorId = authorId;
    if (published !== null) where.published = published;
    if (featured !== null) where.featured = featured;
    if (q) {
      where.translations = {
        some: {
          locale,
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { content: { contains: q, mode: "insensitive" } },
          ],
        },
      };
    }

    const orderBy: Prisma.NewsOrderByWithRelationInput =
      order === "views" ? { views: sortOrder } : { createdAt: sortOrder };

    const newsList = await prisma.news.findMany({
      where,
      orderBy,
      take,
      skip,
      include: {
        author: { select: { id: true, username: true, role: true } },
        translations: { where: { locale }, take: 1, select: TRANSLATION_SELECT },
      },
    });

    const total = await prisma.news.count({ where });

    return NextResponse.json({ items: newsList.map((n) => shapeNews(n, locale)), total });
  } catch (error) {
    console.error(error);
    return jsonError("Erro ao buscar news", 500);
  }
}

export async function POST(req: Request) {
  try {
    const prisma = getPrisma();
    const currentUser = await getCurrentUser();
    if (!currentUser) return jsonError("Unauthorized", 401);
    const canWrite = currentUser.role === "ADMIN" || currentUser.role === "CONTRIBUTOR";
    if (!canWrite) return jsonError("Forbidden", 403);

    let body: unknown;
    try { body = await req.json(); } catch { return jsonError("Invalid JSON body", 400); }
    if (!isRecord(body)) return jsonError("Invalid body", 400);

    const title = getString(body, "title");
    const content = getString(body, "content");
    const tag = getString(body, "tag");
    const cover = getString(body, "cover");
    const published = getBoolean(body, "published");
    const locale = getLocale(typeof body["locale"] === "string" ? body["locale"] : null);
    if (!locale) return jsonError("Invalid locale", 400);

    if (!title) return jsonError("title is required", 400);
    if (!content) return jsonError("content is required", 400);
    if (!tag) return jsonError("tag is required", 400);
    if (!cover) return jsonError("cover is required", 400);

    const { wordCount, readingTimeMinutes } = computeWordMetrics(content);

    const news = await prisma.news.create({
      data: {
        tag, cover,
        published: published ?? false,
        views: 0, featured: false,
        authorId: currentUser.id,
        defaultLocale: locale,
        translations: { create: { locale, title, content, wordCount, readingTimeMinutes } },
      },
      include: {
        author: { select: { id: true, username: true, role: true } },
        translations: { where: { locale }, take: 1, select: TRANSLATION_SELECT },
      },
    });

    return NextResponse.json(shapeNews(news, locale), { status: 201 });
  } catch (error) {
    console.error(error);
    return jsonError("Erro ao criar news", 500);
  }
}

export async function PATCH(req: Request) {
  try {
    const prisma = getPrisma();
    const currentUser = await getCurrentUser();
    if (!currentUser) return jsonError("Unauthorized", 401);
    const canWrite = currentUser.role === "ADMIN" || currentUser.role === "CONTRIBUTOR";
    if (!canWrite) return jsonError("Forbidden", 403);

    let body: unknown;
    try { body = await req.json(); } catch { return jsonError("Invalid JSON body", 400); }
    if (!isRecord(body)) return jsonError("Invalid body", 400);

    const id = getString(body, "id");
    if (!id) return jsonError("id is required", 400);

    const existing = await prisma.news.findUnique({ where: { id }, select: { authorId: true } });
    if (!existing) return jsonError("Not found", 404);
    if (currentUser.role !== "ADMIN" && existing.authorId !== currentUser.id) return jsonError("Forbidden", 403);

    const locale = getLocale(typeof body["locale"] === "string" ? body["locale"] : null) ?? "pt";
    const title = getString(body, "title");
    const content = getString(body, "content");
    const tag = getString(body, "tag");
    const cover = getString(body, "cover");
    const published = getBoolean(body, "published");
    const featured = getBoolean(body, "featured");

    const newsData: Prisma.NewsUpdateInput = {};
    if (tag !== null) newsData.tag = tag;
    if (cover !== null) newsData.cover = cover;
    if (published !== null) newsData.published = published;
    if (featured !== null) newsData.featured = featured;

    if (title || content) {
      const metrics = content ? computeWordMetrics(content) : null;
      newsData.translations = {
        upsert: {
          where: { newsId_locale: { newsId: id, locale } },
          create: { locale, title: title ?? "", content: content ?? "", ...(metrics ?? {}) },
          update: { ...(title ? { title } : {}), ...(content ? { content, ...computeWordMetrics(content) } : {}) },
        },
      };
    }

    const updated = await prisma.news.update({
      where: { id },
      data: newsData,
      include: {
        author: { select: { id: true, username: true, role: true } },
        translations: { where: { locale }, take: 1, select: TRANSLATION_SELECT },
      },
    });

    return NextResponse.json(shapeNews(updated, locale));
  } catch (error) {
    console.error(error);
    return jsonError("Erro ao atualizar news", 500);
  }
}

export async function DELETE(req: Request) {
  try {
    const prisma = getPrisma();
    const currentUser = await getCurrentUser();
    if (!currentUser) return jsonError("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id")?.trim();
    if (!id) return jsonError("id is required", 400);

    const existing = await prisma.news.findUnique({ where: { id }, select: { authorId: true } });
    if (!existing) return jsonError("Not found", 404);
    if (currentUser.role !== "ADMIN" && existing.authorId !== currentUser.id) return jsonError("Forbidden", 403);

    await prisma.news.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return jsonError("Erro ao deletar news", 500);
  }
}
