@AGENTS.md

# Cofano — Claude Code Context

## Project overview
**Cofano** is a DeFi risk intelligence platform for on-chain investors. The product has three pillars:
- **Cofano Research** — articles and analyses about DeFi risk (evolved from the original defi.institute content operation)
- **Cofano Markets** — focused DeFi market context dashboard
- **Cofano Portfolio Risk** — primary product: wallet-level risk analysis via wallet connect

Core positioning: *Understand the market. Analyze your wallet. Monitor your risk.*

See `docs/product.md` for full positioning, business model, and user journeys.

## Stack
| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.1 (App Router) — **read `node_modules/next/dist/docs/` before any Next.js code** |
| Language | TypeScript 5, React 19 |
| Styling | TailwindCSS 4, shadcn/ui (radix-ui based) |
| ORM | Prisma 7.5 + PostgreSQL (via `@prisma/adapter-pg`) |
| Auth | Custom JWT (HMAC-SHA256) via `lib/session.ts`, stored in HTTP-only cookies |
| Animations | Framer Motion / Motion |

## Key commands
```bash
npm run dev          # start dev server (port 3000)
npm run build        # production build
npm run lint         # eslint
npm run db:seed      # seed database (node prisma/seed.mjs)
npx prisma migrate dev   # run migrations
npx prisma studio        # open Prisma Studio
```

## Environment variables (see `.env.example`)
- `DATABASE_URL` — PostgreSQL connection string
- `SESSION_SECRET` — HMAC secret for JWT signing
- `SESSION_COOKIE_NAME` — cookie name (default `session`)
- `SESSION_TTL_SECONDS` — token TTL (default 604800 = 7 days)
- `BCRYPT_ROUNDS` — bcrypt cost factor (default 12)
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` — seed defaults

## Repository layout
```
app/                  Next.js App Router pages and API routes
  @modal/             Parallel route for modal overlays (e.g. /login modal)
  api/                Route handlers
    articles/         Article CRUD
    admin/            Admin-only endpoints (health, users)
    check/            Session validity check
    login|logout|me|register/
  articles/           Article pages
  news/               News pages
  console/            Admin console
  dashboard/          User dashboard
  login/              Login page
  account/            Account settings
  learn/              Learning section
components/           Shared React components
  ui/                 shadcn primitives (button, input, sheet…)
  auth/               Auth-related components
lib/                  Server-side utilities
  session.ts          Custom JWT implementation
  auth.ts             Auth helpers
  currentUser.ts      getCurrentUser() server helper
  prisma.ts           Prisma client singleton
  password.ts         bcrypt helpers
  utils.ts            clsx/twMerge helpers
prisma/
  schema.prisma       Database schema
  seed.mjs            Seed script
docs/                 Architecture and product documentation
.claude/              Claude Code–specific configuration
tasks/                Task tracking (current / backlog / done)
```

## Auth model
- Custom JWT stored in HTTP-only cookie (`session`)
- Three roles: `USER`, `CONTRIBUTOR`, `ADMIN`
- `lib/currentUser.ts` exposes `getCurrentUser()` for server components
- No third-party auth library — all logic lives in `lib/session.ts`

## Data model highlights
- **Article** and **News** both support multilingual translations via `ArticleTranslation` / `NewsTranslation` (locale + content)
- Engagement tracked via `SavedArticle`, `ArticleLike`, `SavedNews`, `NewsLike` (composite PK)
- `defaultLocale` on Article/News controls fallback language

## Coding conventions
- No comments unless the WHY is non-obvious
- Server components by default; add `"use client"` only when needed
- API routes return `Response` (not `NextResponse`) when possible
- Prefer `lib/prisma.ts` singleton — never instantiate PrismaClient directly
- Images from `images.unsplash.com` are whitelisted in `next.config.ts`

## Further reading
- [docs/architecture.md](docs/architecture.md)
- [docs/product.md](docs/product.md)
- [docs/api.md](docs/api.md)
- [docs/database.md](docs/database.md)
- [docs/testing.md](docs/testing.md)
- [docs/deployment.md](docs/deployment.md)
- [docs/decisions/0001-project-structure.md](docs/decisions/0001-project-structure.md)
