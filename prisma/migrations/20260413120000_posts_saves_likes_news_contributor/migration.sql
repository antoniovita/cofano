-- Add CONTRIBUTOR role
ALTER TYPE "Role" ADD VALUE 'CONTRIBUTOR';

-- Users: optional email for login/identity
ALTER TABLE "users" ADD COLUMN "email" TEXT;
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- Articles: defaults aligned with Prisma schema
ALTER TABLE "articles" ALTER COLUMN "views" SET DEFAULT 0;
ALTER TABLE "articles" ALTER COLUMN "featured" SET DEFAULT false;

-- News (separate from articles)
CREATE TABLE "news" (
    "id" UUID NOT NULL,
    "tag" TEXT NOT NULL,
    "cover" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "views" INTEGER NOT NULL DEFAULT 0,
    "defaultLocale" TEXT NOT NULL DEFAULT 'pt',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "authorId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "news_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "news_translations" (
    "id" UUID NOT NULL,
    "locale" TEXT NOT NULL,

    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "readingTimeMinutes" INTEGER NOT NULL DEFAULT 0,

    "newsId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "news_translations_pkey" PRIMARY KEY ("id")
);

-- Saved + likes for articles
CREATE TABLE "saved_articles" (
    "userId" UUID NOT NULL,
    "articleId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_articles_pkey" PRIMARY KEY ("userId", "articleId")
);

CREATE TABLE "article_likes" (
    "userId" UUID NOT NULL,
    "articleId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_likes_pkey" PRIMARY KEY ("userId", "articleId")
);

-- Saved + likes for news
CREATE TABLE "saved_news" (
    "userId" UUID NOT NULL,
    "newsId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_news_pkey" PRIMARY KEY ("userId", "newsId")
);

CREATE TABLE "news_likes" (
    "userId" UUID NOT NULL,
    "newsId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "news_likes_pkey" PRIMARY KEY ("userId", "newsId")
);

-- Indexes
CREATE INDEX "news_authorId_idx" ON "news"("authorId");
CREATE INDEX "news_translations_locale_idx" ON "news_translations"("locale");
CREATE UNIQUE INDEX "news_translations_newsId_locale_key" ON "news_translations"("newsId", "locale");

CREATE INDEX "saved_articles_articleId_idx" ON "saved_articles"("articleId");
CREATE INDEX "article_likes_articleId_idx" ON "article_likes"("articleId");
CREATE INDEX "saved_news_newsId_idx" ON "saved_news"("newsId");
CREATE INDEX "news_likes_newsId_idx" ON "news_likes"("newsId");

-- Foreign keys
ALTER TABLE "news" ADD CONSTRAINT "news_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "news_translations" ADD CONSTRAINT "news_translations_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "news"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "saved_articles" ADD CONSTRAINT "saved_articles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "saved_articles" ADD CONSTRAINT "saved_articles_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "article_likes" ADD CONSTRAINT "article_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "article_likes" ADD CONSTRAINT "article_likes_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "saved_news" ADD CONSTRAINT "saved_news_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "saved_news" ADD CONSTRAINT "saved_news_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "news"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "news_likes" ADD CONSTRAINT "news_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "news_likes" ADD CONSTRAINT "news_likes_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "news"("id") ON DELETE CASCADE ON UPDATE CASCADE;
