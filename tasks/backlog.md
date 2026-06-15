# Backlog

Prioritised list of upcoming work. Move to `current.md` when starting.

**Current focus: Next.js frontend — Research, News, UI, and UX.**
Portfolio Risk (Python engine) is parked until the frontend is solid.

---

## NOW — Research (Cofano Research)

- [ ] Rename routes: `/articles/` → `/research/` with 301 redirects
- [ ] Research listing page — filter by tag, search
- [ ] News pagination
- [ ] `views` counter increment on article/news load
- [ ] `wordCount` and `readingTimeMinutes` auto-calculation on save
- [ ] Contributor dashboard — list own articles and drafts with publish status
- [ ] Admin: bulk publish/unpublish articles

## NOW — User experience

- [ ] User account page — update locale and theme preferences
- [ ] Dashboard — saved Research articles, saved news
- [ ] NavBar — reflect Cofano branding and three-pillar navigation (Research / Markets / Portfolio)

## NOW — Infra / DX

- [ ] Add `middleware.ts` for auth-gated routes (replace per-route `getCurrentUser()` checks on pages)
- [ ] Add Zod validation to all API route bodies

## NEXT — Markets (Cofano Markets)

- [ ] Decide which modules to build first (DeFi Risk Pulse, stablecoin monitor, lending markets)
- [ ] Markets dashboard layout and data sources

## LATER — Portfolio Risk (Next.js side only)

Architecture decisions settled — parked until Research and Markets are stable:
- Wallet connect: wagmi + viem + RainbowKit (ADR 0003)
- On-chain data: DeBank OpenAPI (ADR 0004)
- Business model: credits/quota per tier (ADR 0004)
- Backend: Python FastAPI risk engine in separate repo `cofano-risk` (ADR 0005)

When resumed:
- [ ] Install wagmi + viem + RainbowKit into `app/layout.tsx`
- [ ] `/portfolio` page — wallet connect CTA
- [ ] Risk summary UI (free tier)
- [ ] Full report UI (paid tier)
- [ ] `UserQuota` model + credit gate
- [ ] `POST /api/portfolio/scan` — Next.js side (calls Python engine)
- [ ] Past reports list in `/dashboard`
- [ ] Decide payment provider (ADR)

## LATER — Infra

- [ ] Configure Vitest for unit tests
- [ ] Configure Playwright for E2E
- [ ] Set up CI pipeline (GitHub Actions)
