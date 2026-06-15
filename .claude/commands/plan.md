# /plan

Produce an implementation plan before writing code. Use this for non-trivial tasks.

## Output format

```
## Goal
One sentence describing what will be built or changed.

## Affected areas
- app/api/...
- components/...
- prisma/schema.prisma
- lib/...

## Steps
1. [DB] Add `xyz` column to `Model` — migration required
2. [API] New route `POST /api/xyz` — auth: CONTRIBUTOR+
3. [UI] Add `XyzForm` client component in `components/`
4. [Page] Wire form into `app/xyz/page.tsx`
5. [Lint/Build] Verify

## Risks / decisions
- Will this require a Prisma migration? (yes/no + why)
- Does any new page need a role check?
- Any breaking change to existing API shape?

## Out of scope
What this plan explicitly does NOT cover.
```

## Before finalising the plan

- Read `docs/architecture.md` — confirm the approach fits the existing patterns.
- Read `node_modules/next/dist/docs/` for any Next.js feature you plan to use.
- Identify if any existing code can be reused instead of written from scratch.
- Do not start implementation until the plan is confirmed by the user.
