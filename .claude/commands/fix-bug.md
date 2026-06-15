# /fix-bug

Diagnose and fix a bug.

## Process

1. **Reproduce** — describe the exact steps to trigger the bug. State what was expected vs. what happened.
2. **Locate** — find the file and line where the bug originates. Do not guess; read the code.
3. **Understand** — explain in one sentence why the bug happens.
4. **Fix** — make the smallest change that corrects the behaviour. Do not refactor surrounding code.
5. **Verify** — run `npm run build` and `npm run lint`. If it's an auth/session bug, trace the token through `lib/session.ts`.

## Common bug locations

| Symptom | Where to look |
|---|---|
| 401 on authenticated route | `lib/currentUser.ts`, cookie name in `.env` |
| 500 on DB query | Prisma query in route handler, check `prisma/schema.prisma` for field names |
| Client Component crash | Missing `"use client"`, or server-only import used in client |
| Translation not shown | `defaultLocale` mismatch, or translation row missing for the requested locale |
| Session not persisting | `SESSION_SECRET` mismatch, cookie `httpOnly`/`secure` flags |

## After the fix

State:
- Root cause (one sentence)
- File and line changed
- Whether a migration is needed
