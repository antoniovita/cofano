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

function computeWordMetrics(content: string) {
  const words = content
    .trim()
    .split(/\s+/g)
    .filter(Boolean);
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

function getLocale(value: string | null) {
  const locale = (value || "").trim().toLowerCase();
  if (!locale) return "pt";
  if (!/^[a-z]{2}([-_][a-z]{2})?$/.test(locale)) return null;
  return locale.replace("_", "-");
}

type ApiArticleShape = {
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

function shapeArticle(
  article: {
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
): ApiArticleShape {
  const t = article.translations[0];
  return {
    id: article.id,
    title: t?.title || "",
    content: t?.content || "",
    wordCount: t?.wordCount || 0,
    readingTimeMinutes: t?.readingTimeMinutes || 0,
    tag: article.tag,
    cover: article.cover,
    published: article.published,
    featured: article.featured,
    views: article.views,
    locale: t?.locale || locale,
    defaultLocale: article.defaultLocale,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
    author: article.author,
  };
}

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
      const article = await prisma.article.findUnique({
        where: { id },
        include: {
          author: { select: { id: true, username: true, role: true } },
          translations: {
            where: { locale },
            take: 1,
            select: {
              locale: true,
              title: true,
              content: true,
              wordCount: true,
              readingTimeMinutes: true,
            },
          },
        },
      });
      if (!article) return jsonError("Article not found", 404);

      if (article.translations.length === 0) {
        const fallback = await prisma.articleTranslation.findFirst({
          where: { articleId: id },
          orderBy: { createdAt: "asc" },
          select: {
            locale: true,
            title: true,
            content: true,
            wordCount: true,
            readingTimeMinutes: true,
          },
        });
        return NextResponse.json(
          shapeArticle(
            {
              ...article,
              translations: fallback ? [fallback] : [],
            },
            locale
          )
        );
      }

      return NextResponse.json(shapeArticle(article, locale));
    }

    const where: Prisma.ArticleWhereInput = {};
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

    const orderBy: Prisma.ArticleOrderByWithRelationInput =
      order === "views" ? { views: sortOrder } : { createdAt: sortOrder };

    const articles = await prisma.article.findMany({
      where,
      orderBy,
      take,
      skip,
      include: {
        author: { select: { id: true, username: true, role: true } },
        translations: {
          where: { locale },
          take: 1,
          select: {
            locale: true,
            title: true,
            content: true,
            wordCount: true,
            readingTimeMinutes: true,
          },
        },
      },
    });

    return NextResponse.json(articles.map((a) => shapeArticle(a, locale)));
  } catch (error) {
    console.error(error);
    return jsonError("Erro ao buscar artigos", 500);
  }
}

export async function POST(req: Request) {
  try {
    const prisma = getPrisma();
    const currentUser = await getCurrentUser();
    if (!currentUser) return jsonError("Unauthorized", 401);

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return jsonError("Invalid JSON body", 400);
    }

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

    const article = await prisma.article.create({
      data: {
        tag,
        cover,
        published: published ?? false,
        views: 0,
        featured: false,
        authorId: currentUser.id,
        defaultLocale: locale,
        translations: {
          create: {
            locale,
            title,
            content,
            wordCount,
            readingTimeMinutes,
          },
        },
      },
      include: {
        author: { select: { id: true, username: true, role: true } },
        translations: {
          where: { locale },
          take: 1,
          select: {
            locale: true,
            title: true,
            content: true,
            wordCount: true,
            readingTimeMinutes: true,
          },
        },
      },
    });

    return NextResponse.json(shapeArticle(article, locale), { status: 201 });
  } catch (error) {
    console.error(error);
    return jsonError("Erro ao criar artigo", 500);
  }
}

export async function PATCH(req: Request) {
  try {
    const prisma = getPrisma();
    const currentUser = await getCurrentUser();
    if (!currentUser) return jsonError("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id")?.trim() || null;
    if (!id) return jsonError("id is required", 400);
    const locale = getLocale(searchParams.get("locale"));
    if (!locale) return jsonError("Invalid locale", 400);

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return jsonError("Invalid JSON body", 400);
    }
    if (!isRecord(body)) return jsonError("Invalid body", 400);

    const existing = await prisma.article.findUnique({
      where: { id },
      select: { id: true, authorId: true },
    });
    if (!existing) return jsonError("Article not found", 404);

    const isAdmin = currentUser.role === "ADMIN";
    if (!isAdmin && existing.authorId !== currentUser.id) return jsonError("Forbidden", 403);

    const data: Prisma.ArticleUpdateInput = {};
    const title = getString(body, "title");
    const tag = getString(body, "tag");
    const cover = getString(body, "cover");
    const published = getBoolean(body, "published");
    const featured = getBoolean(body, "featured");
    const content = getString(body, "content");
    const incrementViews = body["incrementViews"] === true;

    if (tag !== null) data.tag = tag;
    if (cover !== null) data.cover = cover;
    if (published !== null) data.published = published;
    if (featured !== null) data.featured = featured;

    if (incrementViews) data.views = { increment: 1 };

    const wantsTranslationUpdate = title !== null || content !== null;
    if (Object.keys(data).length === 0 && !wantsTranslationUpdate)
      return jsonError("No fields to update", 400);

    if (wantsTranslationUpdate) {
      const existingTranslation = await prisma.articleTranslation.findUnique({
        where: { articleId_locale: { articleId: id, locale } },
        select: { id: true },
      });

      const translationUpdate: Prisma.ArticleTranslationUpdateWithoutArticleInput = {};
      if (title !== null) translationUpdate.title = title;
      if (content !== null) {
        translationUpdate.content = content;
        const { wordCount, readingTimeMinutes } = computeWordMetrics(content);
        translationUpdate.wordCount = wordCount;
        translationUpdate.readingTimeMinutes = readingTimeMinutes;
      }

      const canCreate = !existingTranslation;
      if (canCreate) {
        if (!title || !content) {
          return jsonError("title and content are required to create a new translation", 400);
        }
        const { wordCount, readingTimeMinutes } = computeWordMetrics(content);
        data.translations = {
          create: {
            locale,
            title,
            content,
            wordCount,
            readingTimeMinutes,
          },
        };
      } else {
        data.translations = {
          update: {
            where: { articleId_locale: { articleId: id, locale } },
            data: translationUpdate,
          },
        };
      }
    }

    const article = await prisma.article.update({
      where: { id },
      data,
      include: {
        author: { select: { id: true, username: true, role: true } },
        translations: {
          where: { locale },
          take: 1,
          select: {
            locale: true,
            title: true,
            content: true,
            wordCount: true,
            readingTimeMinutes: true,
          },
        },
      },
    });

    return NextResponse.json(shapeArticle(article, locale));
  } catch (error) {
    console.error(error);
    return jsonError("Erro ao atualizar artigo", 500);
  }
}

export async function DELETE(req: Request) {
  try {
    const prisma = getPrisma();
    const currentUser = await getCurrentUser();
    if (!currentUser) return jsonError("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id")?.trim() || null;
    if (!id) return jsonError("id is required", 400);

    const existing = await prisma.article.findUnique({
      where: { id },
      select: { id: true, authorId: true },
    });
    if (!existing) return jsonError("Article not found", 404);

    const isAdmin = currentUser.role === "ADMIN";
    if (!isAdmin && existing.authorId !== currentUser.id) return jsonError("Forbidden", 403);

    await prisma.article.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return jsonError("Erro ao deletar artigo", 500);
  }
}
