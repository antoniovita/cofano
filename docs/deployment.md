# Deployment — Cofano

## Recommended target: Vercel

The project was bootstrapped with `create-next-app` and is optimised for Vercel deployment. The `app/` directory uses the App Router which Vercel supports natively with edge and serverless functions.

```bash
# One-time setup
npm i -g vercel
vercel link

# Deploy preview
vercel

# Deploy production
vercel --prod
```

## Environment variables required in production

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (use connection pooling, e.g. PgBouncer or Neon) |
| `SESSION_SECRET` | Long random string — rotating invalidates all sessions |
| `SESSION_COOKIE_NAME` | Cookie name (default `session`) |
| `SESSION_TTL_SECONDS` | Token TTL in seconds (default 604800) |
| `BCRYPT_ROUNDS` | bcrypt cost factor (12 recommended) |

Never commit `.env` to git. Use `.env.example` as the reference.

## Database

Production database must be a PostgreSQL-compatible service. Options:
- **Neon** — serverless Postgres, good Vercel integration
- **Supabase** — managed Postgres with extras
- **Railway** — simple managed Postgres

After provisioning:
```bash
DATABASE_URL=<prod-url> npx prisma migrate deploy
DATABASE_URL=<prod-url> npm run db:seed   # only on first deploy
```

## Build checks before deploy

1. `npm run build` must succeed with no errors.
2. `npm run lint` must pass.
3. All `prisma/migrations/` must be applied (`npx prisma migrate status`).

## Image domains

`images.unsplash.com` is whitelisted in `next.config.ts`. Add additional domains there before deploying content that references other CDNs.

## Zero-downtime migrations

Prisma migrations run `ALTER TABLE` synchronously. For tables with millions of rows, plan additive migrations (add nullable columns, backfill, then add constraints) rather than destructive ones during a deploy.
