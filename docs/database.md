# Database

## Connection

PostgreSQL via `@prisma/adapter-pg`. Connection string from `DATABASE_URL` env var.

Prisma client singleton: `lib/prisma.ts` — always import from here, never instantiate directly.

## Schema overview

```
User
  ├─ Article[]         (authored)
  ├─ News[]            (authored)
  ├─ SavedArticle[]    (bookmarks)
  ├─ ArticleLike[]     (likes)
  ├─ SavedNews[]
  └─ NewsLike[]

Article
  ├─ ArticleTranslation[]   (one per locale)
  ├─ SavedArticle[]
  └─ ArticleLike[]

News
  ├─ NewsTranslation[]
  ├─ SavedNews[]
  └─ NewsLike[]
```

## Models

### User
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| username | String | unique |
| email | String? | unique, optional |
| passwordHash | String | bcrypt |
| role | Role | USER / CONTRIBUTOR / ADMIN |
| locale | String | default `pt` |
| theme | Theme | DARK / LIGHT |
| createdAt | DateTime | |
| updatedAt | DateTime | auto |

### Article / News (identical shape)
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| tag | String | category tag |
| cover | String | image URL |
| published | Boolean | default false |
| views | Int | default 0 |
| defaultLocale | String | default `pt` |
| featured | Boolean | default false |
| authorId | UUID | FK → User |

### ArticleTranslation / NewsTranslation
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| locale | String | e.g. `pt`, `en` |
| title | String | |
| content | String | full body |
| wordCount | Int | default 0 |
| readingTimeMinutes | Int | default 0 |
| articleId / newsId | UUID | FK (cascade delete) |

Unique constraint: `(articleId, locale)` / `(newsId, locale)`.

### Engagement tables (SavedArticle, ArticleLike, SavedNews, NewsLike)
Composite PK `(userId, entityId)`. All cascade-delete on user or content deletion.

## Migrations

```bash
npx prisma migrate dev --name <description>   # create + apply migration
npx prisma migrate deploy                     # apply in production
npx prisma migrate status                     # check pending
```

Migration files live in `prisma/migrations/`. Never edit applied migration SQL.

## Seeding

```bash
npm run db:seed
```

Seeds admin user (`ADMIN_USERNAME` / `ADMIN_PASSWORD` from env) and sample articles/news.

## Indices

- `Article.authorId`, `News.authorId`
- `ArticleTranslation.locale`, `NewsTranslation.locale`
- Engagement join table FK columns
