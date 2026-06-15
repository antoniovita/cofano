"use client";

import React from "react";
import { useParams } from "next/navigation";
import { ShieldCheck, ArrowLeft, Download, RefreshCw, TrendingDown, TrendingUp, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Btn } from "@/components/ui/Btn";
import { RiskRow } from "@/components/ui/RiskRow";
import { RiskGauge } from "@/components/RiskGauge";
import { AnimatedTileValue } from "@/components/AnimatedTileValue";
import { cn } from "@/lib/utils";

type RiskLevel = "ok" | "warn" | "danger";

const MOCK_SCORE = 68;

const MOCK_RISK_ITEMS = [
  { label: "Health factor",         value: "1.42",    level: "warn"   as RiskLevel },
  { label: "Liquidation distance",  value: "−28.4%",  level: "warn"   as RiskLevel },
  { label: "Protocol risk",         value: "Low",     level: "ok"     as RiskLevel },
  { label: "Stablecoin exposure",   value: "63%",     level: "ok"     as RiskLevel },
  { label: "Concentration (top 1)", value: "71%",     level: "warn"   as RiskLevel },
  { label: "Uncollected yield",     value: "$214.30", level: "ok"     as RiskLevel },
];

const MOCK_POSITIONS = [
  { protocol: "Aave v3", type: "Collateral", asset: "ETH",   value: "$8,420", risk: "warn" as RiskLevel },
  { protocol: "Aave v3", type: "Debt",       asset: "USDC",  value: "$3,100", apy: "5.8%", risk: "warn" as RiskLevel },
  { protocol: "Lido",    type: "Staking",    asset: "stETH", value: "$4,210", apy: "3.8%", risk: "ok"   as RiskLevel },
];

const MOCK_ALERTS = [
  {
    level: "warn" as RiskLevel,
    title: "Health factor below safe threshold",
    description: "Your health factor of 1.42 is below the recommended 1.5. A 20% drop in ETH price could trigger liquidation.",
  },
  {
    level: "warn" as RiskLevel,
    title: "High concentration in single asset",
    description: "71% of your collateral is in ETH. Consider diversifying to reduce correlated liquidation risk.",
  },
];

const MOCK_RECOMMENDATIONS = [
  {
    alert: "Health factor below safe threshold",
    action: "Repay $800 of USDC debt on Aave v3",
    impact: "Raises health factor from 1.42 → 1.81",
    detail: "This single action moves you out of the warning zone and gives you a 44% buffer before liquidation.",
    level: "warn" as RiskLevel,
  },
  {
    alert: "High concentration in single asset",
    action: "Rotate $2,000 of ETH collateral into stETH or USDC",
    impact: "Reduces ETH concentration from 71% → 45%",
    detail: "Diversifying collateral across uncorrelated assets lowers the chance that a single price move triggers liquidation.",
    level: "warn" as RiskLevel,
  },
  {
    alert: "Uncollected yield accumulating",
    action: "Claim $262.50 in pending rewards",
    impact: "Compounds yield or reduces debt exposure",
    detail: "Unclaimed rewards sitting idle don't compound. Claiming and redeploying improves your net APY.",
    level: "ok" as RiskLevel,
  },
];

const MOCK_TOKENS = [
  { symbol: "ETH",   value: "$5,840", change: 2.41,  balance: "1.798 ETH"   },
  { symbol: "USDC",  value: "$2,100", change: 0.01,  balance: "2,100 USDC"  },
  { symbol: "stETH", value: "$1,210", change: 2.38,  balance: "0.372 stETH" },
  { symbol: "ARB",   value: "$320",   change: -3.12, balance: "412 ARB"      },
];

const MOCK_REWARDS = [
  { protocol: "Aave v3", asset: "USDC",  value: "$214.30", apy: "5.8%" },
  { protocol: "Lido",    asset: "stETH", value: "$48.20",  apy: "3.8%" },
];

const MOCK_PROTOCOLS = [
  { name: "Aave v3", pct: 71, value: "$11,520", color: "bg-amber-400"   },
  { name: "Lido",    pct: 27, value: "$4,210",  color: "bg-emerald-400" },
  { name: "Other",   pct: 2,  value: "$420",    color: "bg-neutral-600" },
];

const MOCK_CHAINS = [
  { name: "Ethereum", value: "$13,840", pct: 89, color: "bg-neutral-300" },
  { name: "Arbitrum", value: "$1,210",  pct: 8,  color: "bg-blue-400"   },
  { name: "Optimism", value: "$420",    pct: 3,  color: "bg-red-400"    },
];

const MOCK_PERFORMANCE = [
  { label: "7d change",     value: "+$842",   positive: true  },
  { label: "30d change",    value: "+$2,140", positive: true  },
  { label: "Fees earned",   value: "$312.50", positive: true  },
  { label: "Interest paid", value: "$89.20",  positive: false },
];

const riskLevelColor: Record<RiskLevel, string> = {
  ok:     "text-emerald-400",
  warn:   "text-amber-400",
  danger: "text-red-400",
};

const MOCK_SCORE_HISTORY = [58, 61, 65, 70, 66, 72, 68];

function scoreToHex(score: number): string {
  const LOW  = [52,  211, 153] as const;
  const MID  = [251, 191,  36] as const;
  const HIGH = [248, 113, 113] as const;
  const t = score / 100;
  const [from, to, u] = t < 0.5
    ? [LOW, MID, t / 0.5]
    : [MID, HIGH, (t - 0.5) / 0.5];
  const r = Math.round(from[0] + (to[0] - from[0]) * u);
  const g = Math.round(from[1] + (to[1] - from[1]) * u);
  const b = Math.round(from[2] + (to[2] - from[2]) * u);
  return `rgb(${r},${g},${b})`;
}

function shortAddress(addr: string) {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] uppercase tracking-[0.22em] text-neutral-600">{children}</p>
  );
}

export default function ReportPage() {
  const params   = useParams();
  const address  = params.address as string;
  const scanDate = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const scoreColor = scoreToHex(MOCK_SCORE);

  const histMin = Math.min(...MOCK_SCORE_HISTORY);
  const histMax = Math.max(...MOCK_SCORE_HISTORY);
  const toY = (s: number, h: number) =>
    h - ((s - histMin) / (histMax - histMin || 1)) * (h - 8) - 4;

  return (
    <main className="flex-1 bg-[#0f0f0f] text-white">
      <section className="mx-auto max-w-6xl px-6 pt-10 pb-24">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Btn href="/portfolio" variant="ghost">
              <ArrowLeft size={14} /> Back
            </Btn>
            <div className="h-4 w-px bg-white/8" />
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-neutral-500">
              <ShieldCheck size={13} className="text-neutral-600" />
              Risk Report
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[12px] text-neutral-600">{shortAddress(address)}</span>
            <span className="text-neutral-800">·</span>
            <span className="text-[11px] text-neutral-700">{scanDate}</span>
            <Btn variant="ghost"><RefreshCw size={13} /> Refresh</Btn>
            <Btn variant="secondary"><Download size={13} /> Export</Btn>
          </div>
        </div>

        {/* Summary banner — only card on the page */}
        <div className="mt-6 flex flex-wrap items-center gap-8 rounded-2xl border border-white/6 bg-white/2 px-6 py-5">
          <div>
            <SectionLabel>Total value</SectionLabel>
            <p className="mt-1.5 font-mono text-[2rem] font-semibold leading-none text-white">
              <AnimatedTileValue raw="$15,470" />
            </p>
          </div>
          <div className="h-8 w-px bg-white/8" />
          <div>
            <SectionLabel>Net APY</SectionLabel>
            <p className="mt-1.5 font-mono text-[1.3rem] font-semibold leading-none text-emerald-400">
              <AnimatedTileValue raw="2.1%" />
            </p>
          </div>
          <div className="h-8 w-px bg-white/8" />
          <div>
            <SectionLabel>Claimable yield</SectionLabel>
            <p className="mt-1.5 font-mono text-[1.3rem] font-semibold leading-none text-white">
              <AnimatedTileValue raw="$262.50" />
            </p>
          </div>
          <div className="h-8 w-px bg-white/8" />
          <div>
            <SectionLabel>30d P&amp;L</SectionLabel>
            <p className="mt-1.5 font-mono text-[1.3rem] font-semibold leading-none text-emerald-400">
              +<AnimatedTileValue raw="$2,140" />
            </p>
          </div>
          <div className="ml-auto">
            <Badge variant="risk" level="warn">Medium risk</Badge>
          </div>
        </div>

        {/* Main grid */}
        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_340px]">

          {/* Left — content sections, no card wrappers */}
          <div className="space-y-10">

            {/* Risk score */}
            <div>
              <SectionLabel>Risk score</SectionLabel>
              <div className="mt-5">
                <RiskGauge score={MOCK_SCORE} />
              </div>
            </div>

            {/* Alerts */}
            {MOCK_ALERTS.length > 0 && (
              <div className="border-t border-white/5 pt-10">
                <SectionLabel>Alerts · {MOCK_ALERTS.length}</SectionLabel>
                <div className="mt-4 space-y-3">
                  {MOCK_ALERTS.map((alert) => (
                    <div key={alert.title} className="flex items-start gap-3">
                      <div className={cn(
                        "mt-1 h-1.5 w-1.5 shrink-0 rounded-full",
                        alert.level === "warn" ? "bg-amber-400" : alert.level === "danger" ? "bg-red-400" : "bg-emerald-400"
                      )} />
                      <div>
                        <p className={cn("text-[13px] font-medium", riskLevelColor[alert.level])}>
                          {alert.title}
                        </p>
                        <p className="mt-0.5 text-[12px] leading-5 text-neutral-500">
                          {alert.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {MOCK_RECOMMENDATIONS.length > 0 && (
              <div className="border-t border-white/5 pt-10">
                <SectionLabel>Recommended actions · {MOCK_RECOMMENDATIONS.length}</SectionLabel>
                <div className="mt-4 space-y-3">
                  {MOCK_RECOMMENDATIONS.map((rec) => (
                    <div key={rec.action} className="rounded-xl border border-white/6 bg-white/2 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <div className={cn(
                            "mt-1 h-1.5 w-1.5 shrink-0 rounded-full",
                            rec.level === "warn" ? "bg-amber-400" : "bg-emerald-400"
                          )} />
                          <div>
                            <p className="text-[13px] font-medium text-neutral-200">{rec.action}</p>
                            <p className={cn(
                              "mt-0.5 text-[11px] font-mono",
                              rec.level === "warn" ? "text-amber-400" : "text-emerald-400"
                            )}>{rec.impact}</p>
                          </div>
                        </div>
                        <ArrowRight size={13} className="mt-0.5 shrink-0 text-neutral-700" />
                      </div>
                      <p className="mt-2 pl-5 text-[12px] leading-5 text-neutral-600">{rec.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Positions */}
            <div className="border-t border-white/5 pt-10">
              <SectionLabel>Positions</SectionLabel>
              <div className="mt-4 space-y-1.5">
                {MOCK_POSITIONS.map((pos, i) => (
                  <div
                    key={`${pos.protocol}-${pos.asset}`}
                    className="flex items-center justify-between py-2.5 border-b border-white/4 last:border-0"
                  >
                    <div>
                      <div className="text-[13px] font-medium text-neutral-200">{pos.asset}</div>
                      <div className="text-[11px] text-neutral-600">{pos.protocol} · {pos.type}</div>
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
            </div>

            {/* Token balances */}
            <div className="border-t border-white/5 pt-10">
              <SectionLabel>Token balances</SectionLabel>
              <div className="mt-4 space-y-1.5">
                {MOCK_TOKENS.map((token, i) => (
                  <div
                    key={token.symbol}
                    className="flex items-center justify-between py-2.5 border-b border-white/4 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 font-mono text-[10px] text-neutral-500">
                        {token.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-[13px] font-medium text-neutral-200">{token.symbol}</div>
                        <div className="text-[11px] text-neutral-600">{token.balance}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-[13px] text-white">
                        <AnimatedTileValue raw={token.value} delay={i * 60} />
                      </div>
                      <div className={cn("flex items-center justify-end gap-0.5 text-[11px]", token.change > 0 ? "text-emerald-400" : "text-red-400")}>
                        {token.change > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        {token.change > 0 ? "+" : ""}{token.change}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Claimable rewards */}
            <div className="border-t border-white/5 pt-10">
              <div className="flex items-center justify-between">
                <SectionLabel>Claimable rewards</SectionLabel>
                <span className="font-mono text-[13px] text-emerald-400">
                  <AnimatedTileValue raw="$262.50" />
                </span>
              </div>
              <div className="mt-4 space-y-1.5">
                {MOCK_REWARDS.map((r, i) => (
                  <div key={r.protocol} className="flex items-center justify-between py-2.5 border-b border-white/4 last:border-0">
                    <div>
                      <div className="text-[13px] text-neutral-300">{r.protocol}</div>
                      <div className="text-[11px] text-neutral-600">{r.asset} · {r.apy} APY</div>
                    </div>
                    <div className="font-mono text-[13px] text-emerald-400">
                      <AnimatedTileValue raw={r.value} delay={i * 80} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — single bordered panel */}
          <div className="rounded-2xl border border-white/6 divide-y divide-white/5">

            {/* Risk breakdown */}
            <div className="p-5">
              <SectionLabel>Risk breakdown</SectionLabel>
              <div className="mt-4 space-y-2.5">
                {MOCK_RISK_ITEMS.map((item, i) => (
                  <RiskRow
                    key={item.label}
                    label={item.label}
                    level={item.level}
                    value={<AnimatedTileValue raw={item.value} delay={i * 60} />}
                  />
                ))}
              </div>
            </div>

            {/* Protocol exposure */}
            <div className="p-5">
              <SectionLabel>Protocol exposure</SectionLabel>
              <div className="mt-4 space-y-3">
                {MOCK_PROTOCOLS.map((p, i) => (
                  <div key={p.name}>
                    <div className="mb-1.5 flex items-center justify-between text-[12px]">
                      <div className="flex items-center gap-2">
                        <div className={cn("h-1.5 w-1.5 rounded-full", p.color)} />
                        <span className="text-neutral-400">{p.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-neutral-600">{p.value}</span>
                        <span className="font-mono text-neutral-300">{p.pct}%</span>
                      </div>
                    </div>
                    <div className="h-0.5 w-full overflow-hidden rounded-full bg-white/6">
                      <div
                        className={cn("h-full rounded-full opacity-60 transition-all duration-700", p.color)}
                        style={{ width: `${p.pct}%`, transitionDelay: `${i * 100}ms` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chain breakdown */}
            <div className="p-5">
              <SectionLabel>Chain breakdown</SectionLabel>
              <div className="mt-4 space-y-3">
                {MOCK_CHAINS.map((c, i) => (
                  <div key={c.name}>
                    <div className="mb-1.5 flex items-center justify-between text-[12px]">
                      <div className="flex items-center gap-2">
                        <div className={cn("h-1.5 w-1.5 rounded-full", c.color)} />
                        <span className="text-neutral-400">{c.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-neutral-600">{c.value}</span>
                        <span className="font-mono text-neutral-300">{c.pct}%</span>
                      </div>
                    </div>
                    <div className="h-0.5 w-full overflow-hidden rounded-full bg-white/6">
                      <div
                        className={cn("h-full rounded-full opacity-50 transition-all duration-700", c.color)}
                        style={{ width: `${c.pct}%`, transitionDelay: `${i * 100}ms` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance */}
            <div className="p-5">
              <SectionLabel>Performance</SectionLabel>
              <div className="mt-4 space-y-2.5">
                {MOCK_PERFORMANCE.map((h, i) => (
                  <div key={h.label} className="flex items-center justify-between text-[13px]">
                    <span className="text-neutral-500">{h.label}</span>
                    <span className={cn("font-mono", h.positive ? "text-emerald-400" : "text-red-400")}>
                      <AnimatedTileValue raw={h.value} delay={i * 60} />
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Score history */}
            <div className="p-5">
              <div className="flex items-center justify-between">
                <SectionLabel>Risk history · 7d</SectionLabel>
                <span className="font-mono text-[11px]" style={{ color: scoreColor }}>
                  {MOCK_SCORE_HISTORY[0]} → {MOCK_SCORE_HISTORY[MOCK_SCORE_HISTORY.length - 1]}
                </span>
              </div>
              <svg
                viewBox={`0 0 ${(MOCK_SCORE_HISTORY.length - 1) * 40} 48`}
                className="mt-4 w-full overflow-visible"
                preserveAspectRatio="none"
              >
                {/* Area fill */}
                <defs>
                  <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={scoreColor} stopOpacity="0.15" />
                    <stop offset="100%" stopColor={scoreColor} stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d={[
                    `M 0 ${toY(MOCK_SCORE_HISTORY[0], 48)}`,
                    ...MOCK_SCORE_HISTORY.slice(1).map((s, i) => `L ${(i + 1) * 40} ${toY(s, 48)}`),
                    `L ${(MOCK_SCORE_HISTORY.length - 1) * 40} 48`,
                    `L 0 48 Z`,
                  ].join(" ")}
                  fill="url(#sparkGrad)"
                />
                {/* Line */}
                <polyline
                  points={MOCK_SCORE_HISTORY.map((s, i) => `${i * 40},${toY(s, 48)}`).join(" ")}
                  fill="none"
                  stroke={scoreColor}
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {/* Dots */}
                {MOCK_SCORE_HISTORY.map((s, i) => (
                  <circle
                    key={i}
                    cx={i * 40}
                    cy={toY(s, 48)}
                    r="2.5"
                    fill={scoreColor}
                    opacity={i === MOCK_SCORE_HISTORY.length - 1 ? 1 : 0.4}
                  />
                ))}
              </svg>
              <div className="mt-1.5 flex justify-between text-[10px] text-neutral-700">
                {["7d ago", "6d", "5d", "4d", "3d", "2d", "Today"].map((l) => (
                  <span key={l}>{l}</span>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="p-5">
              <p className="text-[11px] leading-5 text-neutral-700">
                Risk scores are algorithmic estimates based on public on-chain data. This is not financial advice.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
