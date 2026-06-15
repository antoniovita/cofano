"use client";

import { ArrowRight, ShieldCheck, TrendingDown, TrendingUp, Wallet } from "lucide-react";

import { HeroLine } from "@/components/HeroLine";
import { AnimatedTileValue } from "@/components/AnimatedTileValue";
import { ArticleCard } from "@/components/ArticleCard";
import { Badge } from "@/components/ui/Badge";
import { Btn } from "@/components/ui/Btn";
import { Card } from "@/components/ui/Card";
import { RiskRow } from "@/components/ui/RiskRow";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { cn } from "@/lib/utils";

type MarketTile = {
  label: string;
  value: string;
  change?: number;
  sub?: string;
  neutral?: boolean;
};

const MARKET_TILES: MarketTile[] = [
  { label: "ETH/USD",      value: "$3,247.80",  change: 2.41 },
  { label: "BTC/USD",      value: "$67,420.00", change: 1.09 },
  { label: "DeFi TVL",     value: "$94.2B",     change: -0.83 },
  { label: "USDC · Aave",  value: "5.2%",  sub: "supply APY", neutral: true },
  { label: "stETH yield",  value: "3.8%",  sub: "7d avg",     neutral: true },
  { label: "ETH dominance", value: "17.2%", change: 0.31 },
];

const MOCK_ARTICLES = [
  {
    id: "a-4",
    title: "Stablecoins: o que observar em momentos de estresse",
    excerpt: "Colateral, mecanismos de resgate, riscos de contraparte e onde o peg costuma falhar primeiro.",
    date: "Mar 5, 2026",
    tag: "Mercado",
    readTime: "9 min",
    image: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=900&q=80",
  },
  {
    id: "a-5",
    title: "Lending sem sustos: health factor e liquidações",
    excerpt: "Buffers, taxas variáveis, colateralização e como evitar cascatas de liquidação em volatilidade.",
    date: "Feb 28, 2026",
    tag: "Mecânicas",
    readTime: "10 min",
    image: "https://images.unsplash.com/photo-1559526324-593bc073d938?w=900&q=80",
  },
  {
    id: "a-6",
    title: "Auditoria rápida: um framework para avaliar protocolos",
    excerpt: "Superfícies de ataque, pausas, upgrades e pontos de centralização para checar antes de confiar.",
    date: "Feb 18, 2026",
    tag: "Segurança",
    readTime: "8 min",
    image: "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=900&q=80",
  },
];

const RISK_ITEMS = [
  { label: "Health factor",        value: "1.42",    level: "warn"   as const },
  { label: "Liquidation distance", value: "−28.4%",  level: "warn"   as const },
  { label: "Protocol risk",        value: "Low",     level: "ok"     as const },
  { label: "Stablecoin exposure",  value: "63%",     level: "ok"     as const },
  { label: "Uncollected yield",    value: "$214.30", level: "ok"     as const },
];

export default function Home() {
  return (
    <main className="flex-1 bg-[#0f0f0f] text-white">

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-14 pb-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div className="max-w-xl">
            <SectionHeader
              eyebrow="DeFi Risk Intelligence"
              size="lg"
              title={
                <>
                  Understand the market.
                  <br />
                  <span className="text-neutral-400">Analyze your wallet.</span>
                </>
              }
              description="Cofano is a DeFi risk intelligence platform. We publish in-depth research on protocols, markets and security — and give you the tools to assess your own on-chain exposure."
            />
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Btn href="/research" variant="primary">
                Explore Research <ArrowRight size={14} />
              </Btn>
              <Btn href="/portfolio" variant="secondary">
                <Wallet size={14} className="text-neutral-400" />
                Analyze my wallet
              </Btn>
            </div>
          </div>

          {/* Desktop: full HeroLine */}
          <div className="hidden lg:flex lg:items-center lg:justify-center">
            <HeroLine />
          </div>

          {/* Mobile: compact HeroLine below copy */}
          <div className="sm:hidden -mx-2 opacity-60">
            <HeroLine compact />
          </div>
        </div>
      </section>

      {/* Market snapshot */}
      <section className="mx-auto max-w-6xl px-6 py-6">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-neutral-500">
              Market Snapshot
            </div>
            <span className="text-[11px] text-neutral-700">Apr 12 2026, 14:32</span>
          </div>

          <div className="grid grid-cols-2 gap-px bg-white/5 sm:grid-cols-3 lg:grid-cols-6">
            {MARKET_TILES.map((tile) => (
              <div key={tile.label} className="bg-[#0f0f0f] p-4">
                <div className="text-[10px] uppercase tracking-[0.18em] text-neutral-600">
                  {tile.label}
                </div>
                <div className="mt-1.5 font-mono text-[17px] font-semibold tracking-tight text-white">
                  <AnimatedTileValue raw={tile.value} delay={MARKET_TILES.indexOf(tile) * 80} />
                </div>
                {tile.neutral && tile.sub ? (
                  <div className="mt-0.5 text-[11px] text-neutral-600">{tile.sub}</div>
                ) : tile.change !== undefined ? (
                  <div className={cn(
                    "mt-0.5 inline-flex items-center gap-1 font-mono text-[11px]",
                    tile.change > 0 ? "text-emerald-400" : "text-red-400"
                  )}>
                    {tile.change > 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                    {tile.change > 0 ? "+" : ""}{tile.change.toFixed(2)}%
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Latest research */}
      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-7 flex items-end justify-between gap-4">
          <SectionHeader
            title="Latest Research"
            description="In-depth analysis on DeFi risk, protocols and market mechanics."
          />
          <Btn href="/research" variant="ghost" className="hidden sm:inline-flex">
            View all <ArrowRight size={13} />
          </Btn>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_ARTICLES.map((article) => (
            <ArticleCard key={article.id} {...article} />
          ))}
        </div>
      </section>

      {/* Portfolio risk CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/2.5">
          <div className="grid gap-0 lg:grid-cols-[1fr_420px]">
            <div className="flex flex-col justify-center p-8 lg:p-12">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                <ShieldCheck size={14} className="text-neutral-600" />
                Cofano Portfolio Risk
              </div>
              <h2 className="mt-4 text-[2rem] font-semibold leading-[1.1] tracking-tight sm:text-[2.4rem]">
                Know the risk
                <br />
                behind your wallet.
              </h2>
              <p className="mt-4 max-w-md text-[15px] leading-7 text-neutral-400">
                Connect your wallet and get a complete risk breakdown — health factor,
                liquidation distance, protocol exposure, and concentration risk — in seconds.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Btn href="/portfolio" variant="primary">
                  <Wallet size={14} /> Analyze my wallet
                </Btn>
                <Btn href="/portfolio" variant="ghost">
                  See plans & pricing →
                </Btn>
              </div>
              <p className="mt-5 text-[12px] text-neutral-700">
                Free tier available · No private key required · Read-only on-chain data
              </p>
            </div>

            <div className="flex items-center justify-center border-t border-white/6 bg-white/2 p-6 lg:border-l lg:border-t-0 lg:p-8">
              <Card variant="sm" className="w-full max-w-sm bg-[#0f0f0f] p-5">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] uppercase tracking-[0.18em] text-neutral-500">
                    Risk Report
                  </span>
                  <Badge variant="risk" level="warn">Medium risk</Badge>
                </div>

                <div className="mt-4 flex items-end gap-3">
                  <span className="font-mono text-[3rem] font-semibold leading-none text-white">68</span>
                  <div className="mb-1 flex-1">
                    <div className="text-[11px] text-neutral-500">Risk score</div>
                    <div className="mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                      <div className="h-full w-[68%] rounded-full bg-amber-400" />
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-2.5">
                  {RISK_ITEMS.map((item) => (
                    <RiskRow key={item.label} {...item} />
                  ))}
                </div>

                <div className="mt-5 rounded-lg border border-white/6 bg-white/3 p-3 text-[12px] text-neutral-500">
                  Sample report · Connect wallet to see your actual data
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
