# Release checklist

Complete all items before deploying to production.

## Code quality
- [ ] `npm run build` passes with no errors
- [ ] `npm run lint` passes with no warnings
- [ ] No `console.log` or debug code in changed files
- [ ] No hardcoded secrets, credentials, or localhost URLs

## Database
- [ ] All migrations committed to `prisma/migrations/`
- [ ] `npx prisma migrate status` shows no pending migrations on the target DB
- [ ] If schema changed, verify seed still works on a clean DB
- [ ] Destructive migrations (DROP COLUMN, data loss) have been reviewed and are intentional

## Auth & security
- [ ] No new unauthenticated mutation endpoints
- [ ] Role checks present on all CONTRIBUTOR/ADMIN routes
- [ ] `SESSION_SECRET` is set in the deployment environment
- [ ] `.env` is not committed

## Environment
- [ ] All new `process.env.*` variables are added to `.env.example`
- [ ] New environment variables are set in the deployment platform (Vercel)
- [ ] `next.config.ts` `images.remotePatterns` updated if new image domains are used

## Functional smoke test (manual)
- [ ] Home page loads
- [ ] Login and logout work
- [ ] At least one article loads with correct translation
- [ ] ADMIN console loads (if ADMIN routes changed)

## After deploy
- [ ] `GET /api/admin/health` returns `{ status: 'ok', db: 'ok' }`
- [ ] No error spike in logs in the first 5 minutes
