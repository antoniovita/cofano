"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronRight,
  HandCoins,
  ShieldCheck,
  Wallet,
  Zap,
} from "lucide-react";
import { ConnectWalletModal } from "@/components/ConnectWalletModal";

import { Badge } from "@/components/ui/Badge";
import { Btn } from "@/components/ui/Btn";
import { Card } from "@/components/ui/Card";
import { RiskRow } from "@/components/ui/RiskRow";
import { RiskGauge } from "@/components/RiskGauge";
import { AnimatedTileValue } from "@/components/AnimatedTileValue";
import { cn } from "@/lib/utils";

type RiskLevel = "ok" | "warn" | "danger";

type Position = {
  protocol: string;
  type: string;
  asset: string;
  value: string;
  apy?: string;
  risk: RiskLevel;
};

type PricingPlan = {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlight: boolean;
  cta: string;
};

const MOCK_SCORE = 68;

const MOCK_RISK_ITEMS = [
  { label: "Health factor",         value: "1.42",    level: "warn"   as RiskLevel },
  { label: "Liquidation distance",  value: "−28.4%",  level: "warn"   as RiskLevel },
  { label: "Protocol risk",         value: "Low",     level: "ok"     as RiskLevel },
  { label: "Stablecoin exposure",   value: "63%",     level: "ok"     as RiskLevel },
  { label: "Concentration (top 1)", value: "71%",     level: "warn"   as RiskLevel },
  { label: "Uncollected yield",     value: "$214.30", level: "ok"     as RiskLevel },
];

const MOCK_POSITIONS: Position[] = [
  { protocol: "Aave v3",    type: "Collateral", asset: "ETH",      value: "$8,420", risk: "warn" },
  { protocol: "Aave v3",    type: "Debt",       asset: "USDC",     value: "$3,100", apy: "5.8%", risk: "warn" },
  { protocol: "Lido",       type: "Staking",    asset: "stETH",    value: "$4,210", apy: "3.8%", risk: "ok" },
];

const PRICING: PricingPlan[] = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Snapshot analysis for any public wallet.",
    features: [
      "3 wallet scans per month",
      "Full risk report",
      "Protocol exposure breakdown",
      "Read-only, no key required",
    ],
    highlight: false,
    cta: "Get started",
  },
  {
    name: "Pro",
    price: "$29",
    period: "/ month",
    description: "For active DeFi investors who need regular tracking.",
    features: [
      "Unlimited wallet scans",
      "Multi-wallet dashboard",
      "Historical risk tracking",
      "Priority support",
    ],
    highlight: true,
    cta: "Start free trial",
  },
  {
    name: "Pay-per-use",
    price: "$4",
    period: "/ scan",
    description: "No subscription. Pay only when you need a scan.",
    features: [
      "Full risk report",
      "No monthly commitment",
      "Credits never expire",
      "Bulk discounts available",
    ],
    highlight: false,
    cta: "Buy credits",
  },
];

const HOW_STEPS = [
  {
    step: "01",
    title: "Connect or paste your wallet",
    description: "Use wallet connect or paste any public address. We only request read access — your private key is never needed.",
  },
  {
    step: "02",
    title: "We fetch your on-chain positions",
    description: "Cofano reads your current positions across lending, LP, staking and borrowing protocols in real time.",
  },
  {
    step: "03",
    title: "Get your risk report",
    description: "In seconds, you see your health factor, liquidation exposure, protocol concentration and yield summary.",
  },
];

const riskLevelColor: Record<RiskLevel, string> = {
  ok:     "text-emerald-400",
  warn:   "text-amber-400",
  danger: "text-red-400",
};

export default function PortfolioPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
    <main className="flex-1 bg-[#0f0f0f] text-white">

      {/* Hero — Risk Score */}
      <section className="mx-auto max-w-6xl px-6 pt-14 pb-12">
        <div className="grid gap-12 lg:grid-cols-[1fr_480px] lg:items-start">

          {/* Left: copy + gauge */}
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-neutral-500">
              <ShieldCheck size={13} className="text-neutral-600" />
              Cofano Portfolio Risk
            </div>

            <h1 className="mt-4 text-[2.6rem] font-semibold leading-[1.08] tracking-tight sm:text-[3.2rem]">
              Know exactly what
              <br />
              <span className="text-neutral-400">you&apos;re exposed to.</span>
            </h1>

            <p className="mt-5 max-w-md text-[15px] leading-7 text-neutral-400">
              Connect your wallet and get a complete risk breakdown in seconds — health factor, liquidation distance, protocol concentration and uncollected yield.
            </p>

            {/* Gauge — bare, no card */}
            <div className="mt-10 w-full max-w-md">
              <RiskGauge score={MOCK_SCORE} />
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-8">
              <Btn variant="primary" onClick={() => setModalOpen(true)}>
                <Wallet size={14} /> Connect wallet
              </Btn>
              <a
                href="#how"
                className="inline-flex items-center gap-1.5 text-[13px] text-neutral-500 transition-colors hover:text-white"
              >
                How it works <ChevronRight size={14} />
              </a>
            </div>

          </div>

          {/* Right: full mock report */}
          <div className="space-y-3">
            <Card className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                  Risk breakdown
                </span>
                <Badge variant="risk" level="warn">Medium risk</Badge>
              </div>
              <div className="space-y-2.5">
                {MOCK_RISK_ITEMS.map((item, i) => (
                  <RiskRow
                    key={item.label}
                    label={item.label}
                    level={item.level}
                    value={<AnimatedTileValue raw={item.value} delay={i * 60} />}
                  />
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <div className="mb-3 text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                Positions
              </div>
              <div className="space-y-2">
                {MOCK_POSITIONS.map((pos, i) => (
                  <div
                    key={`${pos.protocol}-${pos.asset}`}
                    className="flex items-center justify-between rounded-lg border border-white/5 bg-white/2 px-3 py-2.5"
                  >
                    <div>
                      <div className="text-[13px] font-medium text-neutral-200">{pos.asset}</div>
                      <div className="text-[11px] text-neutral-600">
                        {pos.protocol} · {pos.type}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-[13px] text-white">
                        <AnimatedTileValue raw={pos.value} delay={i * 60} />
                      </div>
                      {pos.apy ? (
                        <div className="text-[11px] text-emerald-400">
                          <AnimatedTileValue raw={pos.apy} delay={i * 60} /> APY
                        </div>
                      ) : (
                        <div className={cn("text-[11px]", riskLevelColor[pos.risk])}>
                          {pos.risk === "warn" ? "Review" : "OK"}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Manual positions */}
      <section className="mx-auto max-w-6xl px-6 py-14 border-t border-white/5">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">No wallet?</p>
            <h2 className="mt-3 text-[1.8rem] font-semibold leading-tight tracking-tight">
              Use a CEX or exchange?
              <br />
              <span className="text-neutral-400">Enter your positions manually.</span>
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-7 text-neutral-400">
              You don&apos;t need an on-chain wallet to use Cofano. Add your assets manually — exchange, asset, and exposure type — and get the same complete risk report.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Btn variant="secondary" onClick={() => setModalOpen(true)}>
                <HandCoins size={14} /> Enter positions manually <ChevronRight size={14} />
              </Btn>
              <Btn variant="ghost">
                Learn more <ChevronRight size={14} />
              </Btn>
            </div>
            <p className="mt-4 text-[12px] text-neutral-700">
              Works with Binance, Coinbase, Kraken and any CEX · Data stays in your browser
            </p>
          </div>

          <Card className="p-6">
            <div className="mb-4 text-[11px] uppercase tracking-[0.18em] text-neutral-500">
              Manual entry example
            </div>
            <div className="space-y-2">
              {[
                { asset: "BTC",  exchange: "Binance",  type: "Spot",    value: "$12,400" },
                { asset: "ETH",  exchange: "Coinbase", type: "Spot",    value: "$5,200"  },
                { asset: "USDC", exchange: "Kraken",   type: "Staking", value: "$3,800"  },
              ].map((row) => (
                <div
                  key={row.asset + row.exchange}
                  className="flex items-center justify-between rounded-lg border border-white/5 bg-white/2 px-3 py-2.5"
                >
                  <div>
                    <div className="text-[13px] font-medium text-neutral-200">{row.asset}</div>
                    <div className="text-[11px] text-neutral-600">{row.exchange} · {row.type}</div>
                  </div>
                  <div className="font-mono text-[13px] text-white">{row.value}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-dashed border-white/10 px-3 py-2.5 text-[12px] text-neutral-600">
              <span className="text-base leading-none">+</span> Add position
            </div>
          </Card>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-6 py-14 border-t border-white/5">
        <div className="mb-10">
          <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">How it works</p>
          <h2 className="mt-3 text-[1.8rem] font-semibold tracking-tight">
            Three steps. No setup. No private key.
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {HOW_STEPS.map((s) => (
            <Card key={s.step} className="p-6">
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-600">
                {s.step}
              </div>
              <h3 className="mt-3 text-[15px] font-semibold leading-tight tracking-tight text-white">
                {s.title}
              </h3>
              <p className="mt-2 text-[13px] leading-6 text-neutral-400">{s.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto max-w-6xl px-6 py-14 border-t border-white/5">
        <div className="mb-10">
          <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">Plans & pricing</p>
          <h2 className="mt-3 text-[1.8rem] font-semibold tracking-tight">
            Start free. Pay only for what you use.
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {PRICING.map((plan) => (
            <Card
              key={plan.name}
              variant={plan.highlight ? "highlight" : "default"}
              className="flex flex-col p-6"
            >
              {plan.highlight && (
                <div className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full border border-white/15 bg-white/8 px-2.5 py-0.5 text-[11px] text-neutral-200">
                  <Zap size={11} /> Most popular
                </div>
              )}
              <div className="text-[12px] uppercase tracking-[0.15em] text-neutral-500">{plan.name}</div>
              <div className="mt-2 flex items-end gap-1.5">
                <span className="font-mono text-[2rem] font-semibold leading-none text-white">{plan.price}</span>
                <span className="mb-0.5 text-[13px] text-neutral-500">{plan.period}</span>
              </div>
              <p className="mt-2 text-[13px] leading-6 text-neutral-400">{plan.description}</p>
              <ul className="mt-5 flex-1 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[13px] text-neutral-300">
                    <Check size={13} className="mt-0.5 shrink-0 text-emerald-400" /> {f}
                  </li>
                ))}
              </ul>
              <Btn
                variant={plan.highlight ? "primary" : "secondary"}
                className="mt-7 w-full justify-center"
              >
                {plan.cta}
              </Btn>
            </Card>
          ))}
        </div>
      </section>


    </main>
    <AnimatePresence>
      {modalOpen && <ConnectWalletModal onClose={() => setModalOpen(false)} />}
    </AnimatePresence>
    </>
  );
}
