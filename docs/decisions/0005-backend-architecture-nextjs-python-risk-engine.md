# ADR 0005: Backend architecture — Next.js + Python FastAPI risk engine

**Date:** 2026-06-11
**Status:** Accepted

## Context

The initial architecture was a Next.js monolith. ADR 0004 confirmed that Cofano Portfolio Risk requires a DeBank integration and quantitative risk models. Quantitative models (VaR, Monte Carlo simulations, stress testing with statistical distributions, correlation analysis between assets) require libraries and a runtime that TypeScript cannot match — Python has a mature, battle-tested ecosystem for this (numpy, pandas, scipy).

Since Portfolio Risk does not exist in the codebase yet, there is no migration cost. The service can be built in Python from the start.

## Decision

Split into two services:

| Service | Technology | Responsibility |
|---|---|---|
| `cofano` (this repo) | Next.js 16 | Frontend, auth, Research, Markets, UI, session management, quota gate |
| `cofano-risk` (new repo) | Python 3.12 + FastAPI | DeBank integration, position processing, quantitative risk models, report generation |

Both services share a single PostgreSQL database. The Next.js app owns the schema and migrations (Prisma). The Python service reads and writes via SQLAlchemy using the same connection string.

## Architecture

```
Browser
    │
    ▼
Next.js (port 3000)
    ├─ Prisma ──────────────────────────────► PostgreSQL
    │    (users, content, quotas, scan status)
    │
    └─ HTTP (internal) ──► Python Risk Engine (port 8000)
                                │
                                ├─ DeBank API (external)
                                ├─ Quantitative models (numpy / scipy)
                                ├─ Report generator
                                └─ SQLAlchemy ──► PostgreSQL
                                     (writes WalletScan, WalletPosition, RiskReport)
```

## Request flow — portfolio scan

```
1. User triggers scan in the browser
2. Next.js Route Handler:
   a. Authenticates user (getCurrentUser)
   b. Checks quota (UserQuota — enough credits?)
   c. Creates a WalletScan row with status "pending"
   d. Calls POST http://risk-engine/api/v1/scan (internal, with API key)
   e. Returns { scanId } to the browser immediately
3. Python Risk Engine:
   a. Validates request (API key, wallet address format)
   b. Calls DeBank API — fetches positions
   c. Processes positions — exposure decomposition
   d. Runs quantitative models — Risk Score, stress tests, concentration analysis
   e. Generates RiskReport JSON
   f. Writes WalletPosition rows and RiskReport to PostgreSQL
   g. Updates WalletScan status to "complete"
4. Browser polls GET /api/portfolio/scan/:id (Next.js reads from DB)
5. When status = "complete", Next.js decrements user quota and returns report
```

Note: for MVP, the scan can be synchronous (step 2d awaits the result before returning). Async processing with polling is the production-ready path but not required to launch.

## Service authentication

Next.js authenticates calls to the Python service with a shared internal API key (`RISK_ENGINE_API_KEY` env var on both sides). The Python service is never exposed to the public internet — it sits behind Next.js.

## Quantitative models (Python risk engine)

The risk engine's `risk/` module will contain:

| Module | What it computes |
|---|---|
| `exposure.py` | Exposure breakdown by asset, protocol, chain, stablecoin |
| `concentration.py` | Herfindahl-Hirschman Index or similar concentration metric |
| `liquidation.py` | Liquidation distance, health factor analysis per lending position |
| `stress.py` | Scenario stress tests — simulate price drops and estimate portfolio impact |
| `correlation.py` | Asset correlation analysis (when historical price data is available) |
| `score.py` | Aggregate Risk Score from individual signals |

## Python service structure

```
cofano-risk/
├── app/
│   ├── main.py                 # FastAPI app, lifespan, router registration
│   ├── config.py               # Settings via pydantic-settings (env vars)
│   ├── db/
│   │   ├── session.py          # Async SQLAlchemy engine + session factory
│   │   └── models.py           # SQLAlchemy models mirroring Prisma schema
│   ├── api/
│   │   └── v1/
│   │       ├── router.py       # v1 router
│   │       └── scan.py         # POST /scan, GET /scan/{id}
│   ├── services/
│   │   ├── debank.py           # DeBank API client (httpx async)
│   │   ├── scan.py             # Orchestration: fetch → process → store
│   │   └── report.py           # Report assembly and serialization
│   ├── risk/
│   │   ├── exposure.py
│   │   ├── liquidation.py
│   │   ├── stress.py
│   │   ├── concentration.py
│   │   └── score.py
│   └── schemas/
│       ├── scan.py             # Pydantic request/response schemas
│       └── report.py
├── tests/
│   ├── unit/                   # Pure function tests (risk models)
│   └── integration/            # Tests against a real DB + mocked DeBank
├── pyproject.toml              # uv/poetry, dependencies, pytest config
├── Dockerfile
└── .env.example
```

## Why FastAPI

- Async native — important for concurrent DeBank API calls
- Pydantic v2 for typed request/response validation
- Automatic OpenAPI docs at `/docs` — useful for future B2B API product
- Lightweight, fast to start, minimal boilerplate

## What stays in Next.js

Nothing moves. The existing Next.js codebase (auth, Research, News, admin, account) is unchanged. The Python service is a greenfield addition.

## Deployment

- Next.js: Vercel (unchanged)
- Python: any container host — Railway, Render, Fly.io, or a VPS. Must be reachable from Vercel via HTTPS.
- Database: shared PostgreSQL instance (both services use `DATABASE_URL`)

## What this ADR does NOT decide

- Sync vs. async scan execution (polling vs. background job) — defer to implementation
- Historical price data source for correlation models — future ADR
- Specific quantitative model implementations — documented in the risk engine itself
- Container orchestration if scale requires it
