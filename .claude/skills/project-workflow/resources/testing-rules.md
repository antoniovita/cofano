# Testing rules

## Mandatory before shipping any auth or session change

Manually verify:
1. Login sets the `session` cookie (check DevTools → Application → Cookies)
2. `GET /api/me` returns the user after login
3. `GET /api/me` returns 401 after logout
4. `GET /api/me` returns 401 after the token TTL (or after modifying `SESSION_SECRET`)

## Mandatory before shipping any API route change

1. Hit the route unauthenticated → expect 401
2. Hit the route with wrong role → expect 403
3. Hit the route with invalid body → expect 400
4. Hit the route with valid body → expect 2xx and correct DB state

## Mandatory before shipping any DB migration

1. `npx prisma migrate status` — no pending migrations
2. Run seed on a clean DB: `npm run db:seed`
3. Verify no existing queries break (check all `prisma.model.findMany/findUnique/create/update/delete` calls in the codebase)

## Do not mock the database

Integration tests must use a real PostgreSQL instance. Mocking Prisma hides schema drift and query errors.

## Test file placement

- Unit tests: alongside the file, e.g., `lib/session.test.ts`
- Integration tests: `tests/api/<route-name>.test.ts`
- E2E tests: `tests/e2e/<flow-name>.spec.ts`

## No skipped tests

Do not commit `.skip` or `xit` without a comment explaining the blocking condition and a linked issue.
