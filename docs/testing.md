# Testing

## Current state

No automated test suite is configured yet. This document describes the intended strategy as the project matures.

## Testing strategy

### Unit tests — `lib/`
Pure functions in `lib/session.ts`, `lib/password.ts`, and `lib/utils.ts` are good candidates for unit tests. Use Node's built-in `assert` or a lightweight runner (Vitest recommended for compatibility with ESM and TypeScript).

Priority targets:
- `createSessionToken` / `verifySessionToken` — expiry, bad signature, malformed input
- `hashPassword` / `verifyPassword` — round-trip correctness

### Integration tests — API routes
Route handlers should be tested against a real database, not mocks. A separate test database (`DATABASE_URL_TEST`) should be used.

Test isolation: wrap each test in a transaction that is rolled back, or truncate tables in `afterEach`.

### End-to-end tests
Playwright is the recommended choice for E2E given the Next.js App Router. Critical flows to cover:
1. Register → login → view article → save → logout
2. CONTRIBUTOR creates and publishes article
3. ADMIN accesses console and changes user role

## Running tests (once configured)

```bash
npm test            # unit tests
npm run test:e2e    # playwright
```

## What NOT to do
- Do not mock `lib/prisma.ts` in integration tests — hit the real DB.
- Do not skip DB assertions to make tests faster; that defeats the point.

## Adding tests
Until a test runner is wired up, new utility functions should at minimum have a manual smoke test documented here or in a `*.test.ts` file committed alongside the implementation.
