# ADR 0002: Cofano — rebranding and product strategy pivot

**Date:** 2026-06-10
**Status:** Accepted

## Context

The project was originally built as **defi.institute**, a DeFi educational platform focused on publishing articles and news. The initial scope was:
- Long-form articles about DeFi
- Short news items
- Basic engagement (save, like)
- CONTRIBUTOR/ADMIN publishing workflow

This served as a foundation. The decision was made to evolve the platform into a product with a clear monetizable core and reposition it under the name **Cofano**.

## Decision

Rebrand as **Cofano** and restructure the product around three pillars:

| Pillar | Former concept | New concept |
|---|---|---|
| Cofano Research | defi.institute (the whole product) | Research and editorial layer — acquisition and authority |
| Cofano Markets | (did not exist) | DeFi risk context dashboard |
| Cofano Portfolio Risk | (did not exist) | Primary product — wallet-level risk analysis |

## Rationale

### Why the pivot

A content platform alone does not have a strong monetization path. Ads and sponsorships require large audiences. The DeFi market has an underserved need for accessible, wallet-level risk analysis — most tools either require technical expertise (Dune), are general-purpose trackers (Zerion, DeBank), or are institutional-grade (not consumer-facing).

The combination of Research (authority) + Markets (context) + Portfolio Risk (personalization) creates a funnel where content drives users to a monetizable product. Each layer feeds the next.

### Why "risk intelligence"

DeFi users do not lack information — they lack structured risk analysis. The positioning as a risk intelligence platform:
- Differentiates from generic news sites and dashboards
- Justifies charging for reports (value is in the analysis, not the data)
- Avoids regulatory gray areas (not investment advice, not portfolio management)
- Aligns with what sophisticated DeFi users actually need

### Why pay-per-use as initial monetization

DeFi users are accustomed to paying per transaction and per action. A subscription requires trust built over time. Pay-per-use lowers the conversion barrier significantly — a user experiencing a market stress event will pay for one report immediately, and that experience converts them to a subscription.

## Consequences

### What changes

- All documentation, marketing copy, and UI copy must use "Cofano" — not "defi.institute"
- The three-pillar structure must be reflected in routing, navigation, and architecture
- New features are evaluated against the Portfolio Risk roadmap first, then Research, then Markets
- The backlog must be reordered to prioritize wallet connect + on-chain data reading

### What stays the same

- The Article/News content model and multilingual translation architecture remains valid for Research
- The auth model (USER / CONTRIBUTOR / ADMIN) remains valid
- The tech stack (Next.js, Prisma, PostgreSQL) remains valid

### URL migration required

Current: `/articles/[id]` → Future: `/research/[id]`
Current: `/articles/create` → Future: `/research/create`

This migration must be done with redirects to preserve any existing SEO.

### What this ADR does NOT decide

- Wallet connect implementation (which library: wagmi, web3modal, rainbow kit)
- On-chain data source (self-indexed, third-party API, or a combination)
- Pricing for reports and subscription
- Supported chains at launch
- Risk Score algorithm design

These decisions will be captured in future ADRs.

## Legal note

Cofano must never position itself as a financial advisor, investment manager, or entity that promises returns. Every risk report must include a clear disclaimer. See language guidelines in `docs/product.md`.
