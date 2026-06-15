# ADR 0001: Project structure and key technology decisions

**Date:** 2026-06-10
**Status:** Accepted

## Context

This is the initial architecture decision record, capturing decisions already made at project inception.

## Decisions

### 1. Next.js App Router (not Pages Router)
**Decision:** Use the App Router with Server Components as the default.
**Rationale:** Server Components reduce client bundle size and allow direct DB access without an additional API layer for read operations. The App Router is the current Next.js default.

### 2. Custom JWT auth (not NextAuth / Lucia)
**Decision:** Implement HMAC-SHA256 JWT from scratch in `lib/session.ts`.
**Rationale:** Keeps the dependency count low, avoids configuration complexity of third-party auth libraries for a simple username/password flow. Trade-off: more code to maintain, but the implementation is small and auditable.

### 3. Prisma + PostgreSQL
**Decision:** Use Prisma ORM with PostgreSQL.
**Rationale:** Strong TypeScript types, migration tooling, and a familiar DX. PostgreSQL is the most capable open-source relational database and handles the multilingual content model well.

### 4. Content internationalisation via translation tables
**Decision:** Store multilingual content in `ArticleTranslation` / `NewsTranslation` tables rather than using JSON columns or separate content tables.
**Rationale:** Normalised structure allows indexed locale queries and maintains referential integrity. Each translation record is a first-class row with its own `createdAt` / `updatedAt`.

### 5. TailwindCSS 4 + shadcn/ui
**Decision:** Use Tailwind 4 for utility-first styling and shadcn/ui (radix-ui) for accessible component primitives.
**Rationale:** Fast iteration, no runtime style injection, accessible defaults from radix-ui. shadcn components are copied into `components/ui/` and owned by the project.

### 6. No test suite at launch
**Decision:** Launch without automated tests.
**Rationale:** Speed of initial development. See `docs/testing.md` for the intended future strategy.

## Consequences

- Auth rotation (changing `SESSION_SECRET`) logs out all users — acceptable for a small platform.
- Adding a new locale requires creating new `*Translation` rows; no automatic fallback logic yet.
- shadcn components in `components/ui/` may diverge from upstream; re-sync manually when needed.
