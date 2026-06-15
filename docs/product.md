# Product — Cofano

## What is Cofano?

Cofano is a **DeFi risk intelligence platform for on-chain investors**.

> Understand the market. Analyze your wallet. Monitor your risk.

Cofano helps DeFi users understand the market, analyze their wallets, and monitor risks before they become losses.

Cofano is not a blog, not a dashboard, and not a portfolio tracker. It is a risk intelligence layer that sits above the complexity of on-chain finance and answers one question:

> What can break your DeFi portfolio — and how bad could it get?

---

## The three pillars

```
Research explains risk.
Markets contextualizes risk.
Portfolio Risk personalizes risk.
```

The three pillars are not independent products. They form a single intelligence loop: a user reads about a risk, sees it playing out in market data, then measures their own exposure to it.

### Hierarchy of importance

```
Primary product:   Cofano Portfolio Risk   →  monetization
Support product:   Cofano Research         →  acquisition, authority, trust
Context product:   Cofano Markets          →  retention, decision support
```

---

## Cofano Research

Cofano Research is the research and editorial layer of the platform. It replaced and evolved the former defi.institute content operation.

**Purpose:** explain DeFi risk in depth, build authority, drive organic traffic, convert readers into Portfolio Risk users.

**Core question it answers:**
> What risks exist in the DeFi market and why do they matter?

### Content types

- Protocol risk analyses (Aave, Morpho, Pendle, Ethena, Curve, Spark, etc.)
- Stablecoin risk analyses (depeg risk, liquidity, backing, governance)
- Lending market breakdowns (collateral ratios, liquidation cascades, oracle risk)
- Bridge and vault risk reports
- Liquidation event studies
- Exploit post-mortems
- Liquidity stress reports
- Oracle and governance risk analyses
- DeFi market news and developments

### Role in the product

Every Research article is a conversion surface. An article about USDe depeg risk should contain a CTA to check the user's own USDe exposure. An article about Aave liquidation mechanics should link to a liquidation risk scan. Research is not a standalone blog — it is the top of the Portfolio Risk funnel.

---

## Cofano Markets

Cofano Markets is a focused, opinionated DeFi market dashboard. It exists to give users context, not to compete with DefiLlama, Dune, or Token Terminal.

**Purpose:** show users the current state of DeFi risk conditions so they know when it is worth reviewing their portfolio.

**Core question it answers:**
> How is the DeFi market right now and where are the relevant risks?

### Design principle

Show fewer metrics, chosen for risk relevance. Not a general-purpose analytics platform.

### Potential modules

- **DeFi Risk Pulse** — aggregate risk-condition signal
- **Stablecoin monitor** — supply, depeg signals, liquidity changes
- **Lending markets** — utilization, borrow rates, liquidation activity
- **Liquidity conditions** — TVL shifts, large withdrawals, pool concentration
- **Protocol watchlist** — user-defined list of protocols to track
- **Top chains** — chain-level TVL and activity
- **Market stress events** — notable risk events, exploits, volatility spikes

### Role in the product

Markets creates a bridge between Research content and Portfolio Risk analysis. A user who sees a stablecoin stress signal in Markets should be prompted to run a stablecoin exposure scan on their own wallet.

---

## Cofano Portfolio Risk

Cofano Portfolio Risk is the primary product. Everything else exists to support it.

**Core promise:**
> Connect your wallet and get a personalized DeFi risk report.

**Core question it answers:**
> What can break this user's DeFi portfolio?

### How it works

1. User connects an EVM wallet.
2. Cofano reads on-chain positions across protocols and chains.
3. Positions are decomposed by asset, protocol, chain, and exposure type.
4. Risk is calculated and surfaced as a structured report.

### Features

- Connect EVM wallet (read-only)
- Detect assets, protocols, chains, and exposure types on-chain
- Calculate exposure by asset
- Calculate exposure by protocol
- Calculate exposure by chain
- Calculate exposure by stablecoin
- Identify lending / liquidation risk
- Identify LP, vault, and yield exposure
- Generate a Risk Score
- Surface top risks in plain language
- Run stress tests against price scenarios
- Estimate loss scenarios
- Generate a shareable risk report
- Monitor and alert (subscription tier)

### Example insights

- "A significant portion of this portfolio depends on the price of ETH."
- "A lending position may face liquidation if this asset falls by X%."
- "There is concentrated exposure to a single stablecoin."
- "80% of capital is deployed in a single protocol."
- "Exit liquidity may be limited under stress conditions."
- "Multiple positions share the same underlying risk assumption."

### What this product is NOT

Cofano Portfolio Risk does not:
- recommend what to buy or sell
- claim to predict the future
- guarantee any outcome
- optimize a portfolio automatically
- promise returns

Every report must include a clear disclaimer:

> This report is a risk analysis, not financial advice.

---

## What Cofano is NOT

Be explicit in all communications:

| Not this | Use this instead |
|---|---|
| Generic crypto news site | DeFi risk intelligence platform |
| Generic DeFi blog | Research-driven risk analysis |
| DefiLlama clone | Opinionated risk-context dashboard |
| DeBank / Zapper / Zerion clone | Wallet-level risk analysis tool |
| Financial advisor | Risk intelligence tool |
| Robo-advisor | Portfolio risk scanner |
| Investment management platform | On-chain risk monitoring |
| Yield recommendation engine | Exposure and liquidation analysis |

---

## Language guidelines

### Avoid

- "buy", "sell", "best portfolio", "optimal strategy"
- "guaranteed return", "safe yield", "expected return"
- "automatic portfolio optimization"
- "this is the best position for you"

### Prefer

- "your ETH exposure is X% of portfolio"
- "if ETH falls 30%, estimated impact is Y"
- "this position has liquidation risk at price Z"
- "this stablecoin showed liquidity decline"
- "this portfolio has concentrated exposure to a single protocol"
- "consider reviewing your exposure"
- "this report is risk analysis, not financial advice"

---

## Business model

```
Free          →  acquisition, value demonstration
Pay per use   →  on-demand reports and scans
Subscription  →  continuous monitoring and alerts
B2B / API     →  risk intelligence distribution (future)
```

### Free tier

Purpose: show value fast, build trust, convert to paid.

Includes:
- All Research articles (public)
- Newsletter
- Basic market dashboard
- 1 summary scan per month (limited detail, no full report)
- Risk Score (summary only)
- Top 3 risks (headline level)

### Pay per use

The core monetization layer. The user pays when they want to run a full scan or generate a complete risk report.

**When users buy:**
- Full wallet risk report
- Liquidation stress test
- Stablecoin exposure analysis
- Protocol exposure analysis
- Multi-wallet analysis
- Pre-entry review before deploying capital to a new protocol
- Post-event review after a market move, exploit, depeg, or sharp drop

### Subscription

Positioned as **a bundle of credits at a discount** — not continuous monitoring. The user gets X full scans per month for a fixed price, cheaper than buying the same number of reports à la carte.

This model was chosen deliberately: Cofano is a risk intelligence tool, not an automated monitor. Users come to Cofano proactively to understand their risk — the product does not watch wallets in the background. This keeps the product focused and the infrastructure simple.

Includes:
- X full scans per month (credits reset monthly)
- Access to full report history (past reports never expire)
- Priority support

The subscription is the natural upgrade for users who check their portfolio regularly — after a market move, after reading a Research article, or on a personal cadence.

> Real-time alerts and continuous monitoring are out of scope for the current model. See ADR 0004.

### B2B / API (future)

Potential customers:
- Wallets and custody platforms
- Crypto fintechs
- Portfolio trackers
- Tax platforms
- DeFi advisors and funds
- DAOs
- Crypto managers

Potential products:
- Wallet risk score API
- Protocol risk feed API
- Stablecoin risk monitoring API
- Liquidation monitoring API
- Wallet monitoring webhooks
- Exposure decomposition API
- Bulk wallet risk reports

---

## User journeys

### Journey 1: Research → Portfolio Risk

```
User reads a Cofano Research article
        ↓
Understands a relevant risk (e.g. stablecoin depeg, lending liquidation)
        ↓
Clicks CTA to check own wallet exposure
        ↓
Connects wallet
        ↓
Receives a free summary scan + Risk Score
        ↓
Generates a full report on demand (paid)
        ↓
Activates monitoring subscription for ongoing alerts
```

### Journey 2: Markets → Portfolio Risk

```
User sees a risk signal in Cofano Markets
(e.g. stablecoin liquidity drop, lending market stress, large TVL outflow)
        ↓
Recognizes potential impact on own portfolio
        ↓
Runs a targeted wallet scan
        ↓
Discovers relevant exposure
        ↓
Buys report or activates monitoring
```

---

## User roles

| Role | Capabilities |
|---|---|
| `USER` | Read Research, access Markets, run free wallet scan, buy reports, subscribe |
| `CONTRIBUTOR` | All of USER + create and publish Research articles and news |
| `ADMIN` | All of CONTRIBUTOR + admin console, user management, content moderation |

---

## Navigation

```
Cofano    Research    Portfolio    [Account / Login]
```

- **Research** and **Portfolio** are the only primary nav items besides auth.
- **Markets** does not appear in the nav yet — its data will be embedded in the Home page (Bloomberg-style snapshot). A dedicated `/markets` page comes later.
- **About** is footer-only, never in the nav.

## Pages

| Path | Nav | Description |
|---|---|---|
| `/` | — | Home — hero + DeFi market snapshot (mocked → DeFiLlama later) + latest Research + Portfolio CTA |
| `/research` | ✅ Primary | Research — article listing + news integrated |
| `/research/[id]` | — | Article detail |
| `/research/create` | — | Article creation (CONTRIBUTOR+) |
| `/portfolio` | ✅ Primary | Portfolio landing — value prop + waitlist CTA |
| `/portfolio/report/[id]` | — | Full risk report (future) |
| `/about` | Footer only | About Cofano — mission, pillars, legal disclaimer |
| `/login` | — | Login (also available as modal) |
| `/account` | — | Account (data, preferences, future: scan history) |
| `/console` | — | Admin console (ADMIN only, no nav entry) |

> Current routes use `/articles/` — migration to `/research/` is tracked in the backlog.

## Data approach

All new pages and components start with mocked/static data. Real data sources (DeFiLlama, DeBank, etc.) are integrated in a subsequent step after the UI is validated.

---

## Internationalisation

Content (Research articles, news) is authored in multiple locales via `*Translation` tables. `defaultLocale` on each content record determines the fallback. `User.locale` (default `pt`) controls which translation is shown. UI language support follows the same user-locale preference.
