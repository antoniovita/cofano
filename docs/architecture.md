# Architecture

## Overview

Cofano runs as two services sharing a single PostgreSQL database.

| Service | Tech | Responsibility |
|---|---|---|
| `cofano` | Next.js 16 (this repo) | Frontend, auth, Research, Markets, Portfolio Risk UI, quota management |
| `cofano-risk` | Python 3.12 + FastAPI | DeBank integration, position processing, quantitative risk models, report generation |

```
Browser
    │
    ▼
Next.js (port 3000)
    ├─ Prisma ──────────────────────────────► PostgreSQL
    │   (users, content, quotas, scan status)
    │
    └─ HTTP internal ────► Python Risk Engine (port 8000)
                                │
                                ├─ DeBank API
                                ├─ Risk models (numpy / scipy)
                                ├─ Report generator
                                └─ SQLAlchemy ──► PostgreSQL
                                    (WalletScan, WalletPosition, RiskReport)
```

Next.js is the only public-facing entry point. The Python service is internal — never exposed to the internet directly.

See [ADR 0005](decisions/0005-backend-architecture-nextjs-python-risk-engine.md) for the full rationale.

---

## Request flow — authenticated page

1. Browser sends request with `session` cookie.
2. Server Component calls `getCurrentUser()` (`lib/currentUser.ts`), which reads the cookie and calls `verifySessionToken()`.
3. If valid, user data is passed as props to child components.
4. Client Components that need user data receive it via props or Context — they do not call auth APIs directly.

## Request flow — API mutation

1. Client Component calls `fetch('/api/...')` with JSON body.
2. Route handler calls `getCurrentUser()` to authenticate.
3. Handler validates input, runs Prisma query, returns `Response.json(...)`.
4. On error, returns `Response.json({ error: '...' }, { status: 4xx })`.

## Request flow — portfolio scan

```
Browser triggers scan
    │
    ▼
Next.js Route Handler
    ├─ Auth check (getCurrentUser)
    ├─ Quota check (enough credits?)
    ├─ Creates WalletScan row (status: "pending")
    └─ POST http://risk-engine/api/v1/scan  ──► Python Risk Engine
                                                    │
                                                    ├─ DeBank API call
                                                    ├─ Position decomposition
                                                    ├─ Quantitative models
                                                    ├─ Report generation
                                                    └─ Writes to PostgreSQL
                                                         (WalletPosition, RiskReport)
                                                         Updates WalletScan → "complete"
    ▼
Browser polls GET /api/portfolio/scan/:id
    │
Next.js reads WalletScan from DB → returns report when complete
    │
Quota decremented on completion
```

## Auth subsystem

Custom HS256 JWT implementation in `lib/session.ts` — no external library.

```
createSessionToken(user)  →  header.payload.signature  (stored in HTTP-only cookie)
verifySessionToken(token) →  { ok: true, user } | { ok: false, reason }
```

Token TTL defaults to 7 days (`SESSION_TTL_SECONDS`). Rotating `SESSION_SECRET` invalidates all active sessions.

## Service-to-service authentication

Next.js authenticates calls to the Python service with a shared internal API key (`RISK_ENGINE_API_KEY`). The Python service rejects any request without a valid key.

## Internationalisation

Content (Research articles, news) is multilingual via `*Translation` tables. `defaultLocale` on each content record determines the fallback. `User.locale` (default `pt`) controls which translation is shown.

## Parallel routes / modals

`app/@modal/` implements an intercepting route for `/login` — renders as a modal overlay on client navigation, full page on direct load.

## Component hierarchy

```
app/layout.tsx          root layout — NavBar, WagmiConfig, RainbowKitProvider
  app/(pages)/layout    optional nested layouts
    page.tsx            Server Component (data fetching)
      *Client.tsx       Client Component (interactivity, wallet hooks)
        components/ui/  shadcn primitives
```

## Key libraries — Next.js

| Library | Purpose |
|---|---|
| Prisma 7 | ORM + migrations |
| wagmi + viem | EVM wallet state and reads (ADR 0003) |
| RainbowKit | Wallet connection UI (ADR 0003) |
| bcryptjs | Password hashing |
| Framer Motion | Animations |
| shadcn/ui | UI component system |
| lucide-react | Icons |

## Key libraries — Python risk engine

| Library | Purpose |
|---|---|
| FastAPI | Web framework |
| pydantic v2 | Data validation and schemas |
| SQLAlchemy (async) | Database access |
| httpx | Async HTTP client (DeBank API) |
| numpy | Numerical computation |
| pandas | Data processing |
| scipy | Statistical models |
