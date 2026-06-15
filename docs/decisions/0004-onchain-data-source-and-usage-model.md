# ADR 0004: On-chain data source — DeBank — and usage-based subscription model

**Date:** 2026-06-11
**Status:** Accepted

## Decisions

1. Use **DeBank OpenAPI** as the sole on-chain data source for Cofano Portfolio Risk.
2. Adopt a **credit/quota model** for all tiers — no real-time monitoring or webhook infrastructure.

---

## Decision 1: DeBank OpenAPI

### What DeBank provides

- Wallet positions across 1500+ DeFi protocols and 150+ chains
- Positions already decomposed: lending, LP, vaults, staking, yields
- Protocol identified, asset decomposed, USD value calculated
- Liquidation health factor for lending positions
- Token balances and net worth

### Why DeBank

For a product whose core value is DeFi position analysis, DeBank solves the hardest engineering problem out of the box: interpreting what a wallet holds *inside* protocols. The alternative — reading raw on-chain data and building protocol-specific interpreters for Aave, Uniswap, Pendle, Morpho, Curve, etc. — is months of engineering work before the first user can run a scan.

### Alternatives considered

| Provider | Why not chosen |
|---|---|
| Alchemy | Excellent for raw EVM data, but no DeFi position interpretation — would require building protocol parsers |
| Moralis | Limited protocol coverage (~30), won't scale to the protocols most relevant to DeFi risk |
| Covalent | Weaker on DeFi positions, better suited for historical data |
| Self-index (The Graph) | Maximum control but months of dev work; deferred to a future phase |

### Known limitations

- **Vendor lock-in:** if DeBank changes pricing or deprecates the API, we are exposed. Mitigation: store scan results in our own database so historical reports remain available regardless.
- **No webhooks:** DeBank is a pull API — it responds when called, does not push events. This is acceptable given the credit model (Decision 2).
- **Pricing opacity:** volume pricing requires commercial contact. Monitor costs as scan volume grows and evaluate self-indexing for high-volume protocols at scale.

### Future path

If at scale we need to reduce DeBank dependency, the migration path is to add The Graph subgraphs for the highest-volume protocols (Aave, Uniswap) and keep DeBank as fallback for long-tail protocols.

---

## Decision 2: Credit/quota model — no real-time monitoring

### Model

```
Free         →  1 summary scan per month (limited detail)
Pay per use  →  pay per full scan/report (à la carte)
Subscription →  X full scans per month at a discount vs. pay-per-use
```

### Why credits instead of continuous monitoring

Cofano is positioned as a **risk intelligence** tool, not an automated monitor. The user comes to Cofano proactively to understand their risk — the product does not watch wallets in the background.

This framing is both a product decision and an engineering decision:

- **Product:** a credit model fits the "DeFi intelligence" positioning. The user decides when to run a scan, which is consistent with how sophisticated on-chain users already behave (they check manually after market moves, news, or before entering a new position).
- **Engineering:** continuous monitoring requires webhooks, polling infrastructure, alerting pipelines, and on-call reliability. A credit model eliminates all of this — the entire product runs on a single pull-based API call per scan.
- **Business:** credits are predictable for both the user (fixed monthly spend) and the platform (revenue per scan is stable). Real-time monitoring subscriptions require complex churn and usage analysis.

### What this explicitly does NOT include (for now)

- Push alerts (liquidation warnings, depeg notifications)
- Continuous wallet observation
- Automated re-scans triggered by price or on-chain events

These features remain in the long-term roadmap but are not part of the initial subscription model.

### Implementation notes

- Add `credits` or `scansRemaining` field to the `User` model (or a separate `UserQuota` model)
- Decrement on each full scan
- Reset monthly via a scheduled job (or handle lazily on first scan after billing period)
- Free tier: enforce 1 summary scan/month at the API layer before calling DeBank
- Store every scan result in `WalletScan` + `RiskReport` tables so the user can re-read past reports without consuming a new credit
