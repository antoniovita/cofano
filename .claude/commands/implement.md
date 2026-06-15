# /implement

Implement a feature or change in this project.

## Before writing any code

1. Read `CLAUDE.md` for project conventions.
2. Read `node_modules/next/dist/docs/` for any Next.js APIs you will use — this version has breaking changes.
3. Check `docs/architecture.md` to understand where the change fits.
4. If touching the DB, read `docs/database.md` and check `prisma/schema.prisma`.

## Steps

1. **Understand the request** — restate in one sentence what will change and where.
2. **Identify affected files** — list them before touching anything.
3. **Check for existing patterns** — find a similar feature in the codebase and follow the same conventions.
4. **Implement** — smallest change that satisfies the requirement. No extra abstractions, no speculative generality.
5. **Verify** — run `npm run build` and `npm run lint`. Fix any errors.
6. **Report** — list the files changed and the key decision made.

## Guards

- Server Components are the default. Add `"use client"` only when needed.
- Never instantiate `PrismaClient` directly — use `lib/prisma.ts`.
- Never read or set the session cookie manually — use `lib/session.ts` and `lib/currentUser.ts`.
- New API routes must authenticate via `getCurrentUser()` before any DB write.
- Do not add comments explaining what the code does. Only add a comment if the WHY is non-obvious.
