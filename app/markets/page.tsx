"use client";

import { useState } from "react";
import {
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

import Marquee from "react-fast-marquee";

import { Badge } from "@/components/ui/Badge";
import { Btn } from "@/components/ui/Btn";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

// ─── Mock data ────────────────────────────────────────────────────────────────

const PRICE_TICKER = [
  { label: "BTC",       value: "$67,420",  pct:  1.09 },
  { label: "ETH",       value: "$3,247",   pct:  2.41 },
  { label: "SOL",       value: "$178.40",  pct:  3.22 },
  { label: "BNB",       value: "$594.20",  pct:  0.87 },
  { label: "DeFi TVL",  value: "$94.2B",   pct: -0.83 },
  { label: "F&G",       value: "72",       pct:  0,    label2: "Greed"  as string | undefined },
  { label: "USDC",      value: "$1.000",   pct:  0.00 },
  { label: "USDT",      value: "$1.001",   pct:  0.01 },
  { label: "ETH Gas",   value: "12 gwei",  pct:  0,    neutral: true },
  { label: "stETH",     value: "3.8%",     pct:  0,    label2: "APY"   as string | undefined, neutral: true },
  { label: "AAVE USDC", value: "5.2%",     pct:  0,    label2: "APY"   as string | undefined, neutral: true },
];

type RiskLevel = "ok" | "warn" | "danger";

const RISK_COLOR: Record<RiskLevel, string> = {
  ok: "#34d399", warn: "#fbbf24", danger: "#f87171",
};

// Fear & Greed
const FEAR_GREED_HISTORY = [
  { day: "Mar 13", score: 44 },
  { day: "Mar 16", score: 51 },
  { day: "Mar 19", score: 48 },
  { day: "Mar 22", score: 57 },
  { day: "Mar 25", score: 63 },
  { day: "Mar 28", score: 68 },
  { day: "Apr 1",  score: 61 },
  { day: "Apr 4",  score: 70 },
  { day: "Apr 7",  score: 66 },
  { day: "Apr 10", score: 74 },
  { day: "Apr 12", score: 72 },
];

// Stablecoins
type Stablecoin = {
  symbol: string;
  peg: number;
  supply: string;
  supplyPct: number;
  liquidity: string;
  liquidityPct: number;
  risk: RiskLevel;
  pegHistory: { t: string; v: number }[];
};

const STABLECOINS: Stablecoin[] = [
  {
    symbol: "USDC", peg: 1.000, supply: "$43.2B", supplyPct: 0.4,
    liquidity: "$3.1B", liquidityPct: 1.2, risk: "ok",
    pegHistory: [{ t:"1",v:1.000},{t:"2",v:1.001},{t:"3",v:0.999},{t:"4",v:1.000},{t:"5",v:1.000},{t:"6",v:1.001},{t:"7",v:1.000}],
  },
  {
    symbol: "USDT", peg: 1.001, supply: "$110.4B", supplyPct: 2.1,
    liquidity: "$5.8B", liquidityPct: -0.3, risk: "ok",
    pegHistory: [{ t:"1",v:1.001},{t:"2",v:1.000},{t:"3",v:1.001},{t:"4",v:1.002},{t:"5",v:1.001},{t:"6",v:1.000},{t:"7",v:1.001}],
  },
  {
    symbol: "DAI", peg: 0.999, supply: "$4.9B", supplyPct: -1.8,
    liquidity: "$0.8B", liquidityPct: -5.1, risk: "warn",
    pegHistory: [{ t:"1",v:1.000},{t:"2",v:0.999},{t:"3",v:0.998},{t:"4",v:0.999},{t:"5",v:0.997},{t:"6",v:0.999},{t:"7",v:0.999}],
  },
  {
    symbol: "USDe", peg: 0.997, supply: "$2.6B", supplyPct: -4.3,
    liquidity: "$0.4B", liquidityPct: -9.8, risk: "danger",
    pegHistory: [{ t:"1",v:1.000},{t:"2",v:0.999},{t:"3",v:0.995},{t:"4",v:0.991},{t:"5",v:0.994},{t:"6",v:0.996},{t:"7",v:0.997}],
  },
  {
    symbol: "FRAX", peg: 0.998, supply: "$0.7B", supplyPct: -1.2,
    liquidity: "$0.1B", liquidityPct: -2.4, risk: "warn",
    pegHistory: [{ t:"1",v:0.999},{t:"2",v:0.998},{t:"3",v:0.997},{t:"4",v:0.998},{t:"5",v:0.999},{t:"6",v:0.998},{t:"7",v:0.998}],
  },
];

// Lending Markets
type LendingMarket = {
  protocol: string;
  asset: string;
  utilization: number;
  supplyApy: string;
  borrowApy: string;
  risk: RiskLevel;
  utilHistory: { t: string; v: number }[];
};

const LENDING_MARKETS: LendingMarket[] = [
  {
    protocol: "Aave v3", asset: "USDC", utilization: 84,
    supplyApy: "5.2%", borrowApy: "7.8%", risk: "warn",
    utilHistory: [{ t:"1",v:71},{t:"2",v:74},{t:"3",v:76},{t:"4",v:79},{t:"5",v:81},{t:"6",v:83},{t:"7",v:84}],
  },
  {
    protocol: "Aave v3", asset: "ETH", utilization: 61,
    supplyApy: "1.9%", borrowApy: "2.9%", risk: "ok",
    utilHistory: [{ t:"1",v:58},{t:"2",v:60},{t:"3",v:57},{t:"4",v:59},{t:"5",v:62},{t:"6",v:60},{t:"7",v:61}],
  },
  {
    protocol: "Morpho", asset: "USDC", utilization: 91,
    supplyApy: "5.9%", borrowApy: "8.6%", risk: "danger",
    utilHistory: [{ t:"1",v:78},{t:"2",v:82},{t:"3",v:85},{t:"4",v:87},{t:"5",v:89},{t:"6",v:90},{t:"7",v:91}],
  },
  {
    protocol: "Spark", asset: "DAI", utilization: 73,
    supplyApy: "4.5%", borrowApy: "6.2%", risk: "ok",
    utilHistory: [{ t:"1",v:68},{t:"2",v:70},{t:"3",v:71},{t:"4",v:73},{t:"5",v:72},{t:"6",v:74},{t:"7",v:73}],
  },
  {
    protocol: "Compound", asset: "USDT", utilization: 77,
    supplyApy: "4.8%", borrowApy: "7.1%", risk: "warn",
    utilHistory: [{ t:"1",v:69},{t:"2",v:71},{t:"3",v:74},{t:"4",v:75},{t:"5",v:76},{t:"6",v:77},{t:"7",v:77}],
  },
];

// TVL by Protocol
const TVL_PROTOCOLS = [
  { name: "Lido",      tvl: 32.4 },
  { name: "Aave",      tvl: 14.8 },
  { name: "EigenLayer",tvl: 12.1 },
  { name: "Curve",     tvl:  8.6 },
  { name: "Uniswap",   tvl:  6.2 },
  { name: "Morpho",    tvl:  3.9 },
  { name: "Spark",     tvl:  3.1 },
  { name: "Pendle",    tvl:  2.8 },
  { name: "Maker",     tvl:  2.4 },
  { name: "Compound",  tvl:  1.9 },
];

// Top 20
type CoinCategory = "All" | "DeFi" | "Stablecoins" | "L1" | "L2";

type TopCoin = {
  rank: number;
  symbol: string;
  name: string;
  category: CoinCategory[];
  price: string;
  pct24h: number;
  pct7d: number;
  marketCap: string;
  volume24h: string;
  circulatingSupply: string;
  dominance: number;
  ath: string;
  athDistancePct: number;
  sparkline: { v: number }[];
};

const TOP_COINS: TopCoin[] = [
  { rank: 1,  symbol: "BTC",   name: "Bitcoin",        category: ["L1"],         price: "$67,420",    pct24h:  1.09, pct7d:  4.21, marketCap: "$1.33T",  volume24h: "$38.2B", circulatingSupply: "19.7M BTC",   dominance: 52.8, ath: "$73,737",      athDistancePct:  -8.6, sparkline: [{v:61000},{v:63000},{v:62000},{v:65000},{v:64000},{v:66000},{v:67420}] },
  { rank: 2,  symbol: "ETH",   name: "Ethereum",       category: ["L1","DeFi"],  price: "$3,247",     pct24h:  2.41, pct7d:  6.80, marketCap: "$390.1B", volume24h: "$19.4B", circulatingSupply: "120.2M ETH",  dominance: 15.5, ath: "$4,878",       athDistancePct: -33.4, sparkline: [{v:2900},{v:3000},{v:2950},{v:3100},{v:3050},{v:3180},{v:3247}] },
  { rank: 3,  symbol: "USDT",  name: "Tether",         category: ["Stablecoins"],price: "$1.001",     pct24h:  0.01, pct7d:  0.02, marketCap: "$110.4B", volume24h: "$92.1B", circulatingSupply: "110.3B USDT", dominance:  4.38, ath: "$1.321",       athDistancePct: -24.3, sparkline: [{v:1.000},{v:1.001},{v:1.000},{v:1.002},{v:1.001},{v:1.000},{v:1.001}] },
  { rank: 4,  symbol: "BNB",   name: "BNB",            category: ["L1"],         price: "$594.20",    pct24h:  0.87, pct7d:  2.14, marketCap: "$86.5B",  volume24h: "$2.1B",  circulatingSupply: "145.6M BNB",  dominance:  3.43, ath: "$686.31",      athDistancePct: -13.4, sparkline: [{v:565},{v:572},{v:568},{v:580},{v:578},{v:589},{v:594}] },
  { rank: 5,  symbol: "SOL",   name: "Solana",         category: ["L1"],         price: "$178.40",    pct24h:  3.22, pct7d:  9.54, marketCap: "$84.3B",  volume24h: "$5.8B",  circulatingSupply: "462.5M SOL",  dominance:  3.34, ath: "$259.96",      athDistancePct: -31.4, sparkline: [{v:145},{v:152},{v:148},{v:162},{v:170},{v:173},{v:178}] },
  { rank: 6,  symbol: "USDC",  name: "USD Coin",       category: ["Stablecoins"],price: "$1.000",     pct24h:  0.00, pct7d:  0.01, marketCap: "$43.2B",  volume24h: "$8.9B",  circulatingSupply: "43.2B USDC",  dominance:  1.71, ath: "$1.17",        athDistancePct: -14.5, sparkline: [{v:1.000},{v:1.001},{v:0.999},{v:1.000},{v:1.000},{v:1.001},{v:1.000}] },
  { rank: 7,  symbol: "XRP",   name: "XRP",            category: ["L1"],         price: "$0.612",     pct24h: -0.44, pct7d:  1.22, marketCap: "$35.1B",  volume24h: "$1.4B",  circulatingSupply: "57.3B XRP",   dominance:  1.39, ath: "$3.84",        athDistancePct: -84.1, sparkline: [{v:0.590},{v:0.601},{v:0.595},{v:0.608},{v:0.603},{v:0.610},{v:0.612}] },
  { rank: 8,  symbol: "DOGE",  name: "Dogecoin",       category: ["L1"],         price: "$0.1843",    pct24h:  1.77, pct7d: -2.31, marketCap: "$26.9B",  volume24h: "$1.8B",  circulatingSupply: "145.9B DOGE", dominance:  1.07, ath: "$0.7376",      athDistancePct: -75.0, sparkline: [{v:0.195},{v:0.190},{v:0.188},{v:0.185},{v:0.182},{v:0.183},{v:0.184}] },
  { rank: 9,  symbol: "TON",   name: "Toncoin",        category: ["L1"],         price: "$5.84",      pct24h:  0.63, pct7d:  3.40, marketCap: "$20.3B",  volume24h: "$0.4B",  circulatingSupply: "3.47B TON",   dominance:  0.81, ath: "$8.25",        athDistancePct: -29.2, sparkline: [{v:5.30},{v:5.45},{v:5.40},{v:5.60},{v:5.70},{v:5.80},{v:5.84}] },
  { rank: 10, symbol: "ADA",   name: "Cardano",        category: ["L1"],         price: "$0.492",     pct24h: -0.91, pct7d: -3.10, marketCap: "$17.5B",  volume24h: "$0.6B",  circulatingSupply: "35.6B ADA",   dominance:  0.69, ath: "$3.09",        athDistancePct: -84.1, sparkline: [{v:0.530},{v:0.518},{v:0.510},{v:0.505},{v:0.498},{v:0.495},{v:0.492}] },
  { rank: 11, symbol: "AVAX",  name: "Avalanche",      category: ["L1"],         price: "$38.20",     pct24h:  1.54, pct7d:  5.60, marketCap: "$15.8B",  volume24h: "$0.9B",  circulatingSupply: "414.1M AVAX", dominance:  0.63, ath: "$146.22",      athDistancePct: -73.9, sparkline: [{v:33},{v:34},{v:35},{v:36},{v:37},{v:38},{v:38.2}] },
  { rank: 12, symbol: "SHIB",  name: "Shiba Inu",      category: ["L1"],         price: "$0.0000248", pct24h: -1.20, pct7d: -4.50, marketCap: "$14.6B",  volume24h: "$0.5B",  circulatingSupply: "589.3T SHIB", dominance:  0.58, ath: "$0.00008616",  athDistancePct: -71.2, sparkline: [{v:0.0000270},{v:0.0000265},{v:0.0000258},{v:0.0000252},{v:0.0000248},{v:0.0000249},{v:0.0000248}] },
  { rank: 13, symbol: "DOT",   name: "Polkadot",       category: ["L1"],         price: "$8.74",      pct24h:  0.32, pct7d:  1.88, marketCap: "$12.1B",  volume24h: "$0.3B",  circulatingSupply: "1.39B DOT",   dominance:  0.48, ath: "$54.98",       athDistancePct: -84.1, sparkline: [{v:8.20},{v:8.35},{v:8.28},{v:8.50},{v:8.60},{v:8.70},{v:8.74}] },
  { rank: 14, symbol: "LINK",  name: "Chainlink",      category: ["DeFi"],       price: "$14.92",     pct24h:  2.10, pct7d:  7.30, marketCap: "$9.3B",   volume24h: "$0.7B",  circulatingSupply: "623.1M LINK", dominance:  0.37, ath: "$52.70",       athDistancePct: -71.7, sparkline: [{v:12.8},{v:13.2},{v:13.0},{v:13.8},{v:14.2},{v:14.7},{v:14.9}] },
  { rank: 15, symbol: "MATIC", name: "Polygon",        category: ["L2"],         price: "$0.731",     pct24h: -0.66, pct7d: -1.44, marketCap: "$7.2B",   volume24h: "$0.4B",  circulatingSupply: "9.9B MATIC",  dominance:  0.29, ath: "$2.92",        athDistancePct: -74.9, sparkline: [{v:0.760},{v:0.752},{v:0.748},{v:0.742},{v:0.738},{v:0.733},{v:0.731}] },
  { rank: 16, symbol: "UNI",   name: "Uniswap",        category: ["DeFi"],       price: "$10.14",     pct24h:  1.88, pct7d:  8.22, marketCap: "$6.1B",   volume24h: "$0.3B",  circulatingSupply: "600.2M UNI",  dominance:  0.24, ath: "$44.97",       athDistancePct: -77.4, sparkline: [{v:8.8},{v:9.1},{v:9.0},{v:9.5},{v:9.8},{v:10.0},{v:10.14}] },
  { rank: 17, symbol: "NEAR",  name: "NEAR Protocol",  category: ["L1"],         price: "$6.32",      pct24h:  0.45, pct7d:  2.90, marketCap: "$6.9B",   volume24h: "$0.3B",  circulatingSupply: "1.09B NEAR",  dominance:  0.27, ath: "$20.44",       athDistancePct: -69.1, sparkline: [{v:5.90},{v:6.00},{v:5.95},{v:6.10},{v:6.20},{v:6.28},{v:6.32}] },
  { rank: 18, symbol: "LTC",   name: "Litecoin",       category: ["L1"],         price: "$83.40",     pct24h: -0.28, pct7d:  0.72, marketCap: "$6.2B",   volume24h: "$0.4B",  circulatingSupply: "74.4M LTC",   dominance:  0.25, ath: "$410.26",      athDistancePct: -79.7, sparkline: [{v:81},{v:82},{v:81.5},{v:83},{v:83.2},{v:83.5},{v:83.4}] },
  { rank: 19, symbol: "ICP",   name: "Internet Comp.", category: ["L1"],         price: "$12.60",     pct24h:  2.74, pct7d:  6.10, marketCap: "$5.9B",   volume24h: "$0.2B",  circulatingSupply: "468.2M ICP",  dominance:  0.23, ath: "$700.65",      athDistancePct: -98.2, sparkline: [{v:10.8},{v:11.2},{v:11.0},{v:11.8},{v:12.1},{v:12.4},{v:12.6}] },
  { rank: 20, symbol: "APT",   name: "Aptos",          category: ["L1"],         price: "$9.84",      pct24h:  3.41, pct7d: 11.20, marketCap: "$4.3B",   volume24h: "$0.5B",  circulatingSupply: "437.0M APT",  dominance:  0.17, ath: "$19.92",       athDistancePct: -50.6, sparkline: [{v:7.8},{v:8.2},{v:8.0},{v:8.8},{v:9.2},{v:9.6},{v:9.84}] },
];

// Stress Events
type StressEvent = {
  id: string;
  date: string;
  type: "exploit" | "depeg" | "liquidation" | "liquidity";
  title: string;
  severity: RiskLevel;
  detail: string;
};
const STRESS_EVENTS: StressEvent[] = [
  { id: "e-1", date: "Apr 12, 2026", type: "liquidation", title: "ETH cascade — $142M liquidated in 4h",         severity: "danger", detail: "ETH dropped 11% in under 2h, triggering cascading liquidations on Aave and Morpho." },
  { id: "e-2", date: "Apr 8, 2026",  type: "depeg",       title: "USDe depegged to $0.991 during sell pressure", severity: "warn",   detail: "Sell pressure on secondary markets pushed USDe below peg briefly before restoring." },
  { id: "e-3", date: "Apr 3, 2026",  type: "liquidity",   title: "Curve 3pool: $200M TVL withdrawn in 48h",      severity: "warn",   detail: "Large LP exits ahead of rate rebalancing reduced pool depth and increased slippage." },
  { id: "e-4", date: "Mar 28, 2026", type: "exploit",     title: "Minor protocol — $1.2M oracle manipulation",   severity: "danger", detail: "A low-TVL protocol suffered a price oracle manipulation; drained within a single block." },
];

const EVENT_TYPE_LABEL: Record<StressEvent["type"], string> = {
  exploit: "Exploit", depeg: "Depeg", liquidation: "Liquidation", liquidity: "Liquidity",
};

const COIN_CATEGORIES: CoinCategory[] = ["All", "DeFi", "Stablecoins", "L1", "L2"];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="mb-4 text-[11px] uppercase tracking-[0.2em] text-neutral-500">
      {label}
    </div>
  );
}

function Delta({ pct }: { pct: number }) {
  const up = pct >= 0;
  return (
    <span className={cn("inline-flex items-center gap-0.5 font-mono text-[11px]", up ? "text-emerald-400" : "text-red-400")}>
      {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
      {up ? "+" : ""}{pct.toFixed(1)}%
    </span>
  );
}

function PegSpark({ data, risk }: { data: { t: string; v: number }[]; risk: RiskLevel }) {
  const color = RISK_COLOR[risk];
  const min = Math.min(...data.map((d) => d.v));
  const max = Math.max(...data.map((d) => d.v));
  const domain: [number, number] = [Math.min(min - 0.001, 0.995), Math.max(max + 0.001, 1.003)];
  return (
    <ResponsiveContainer width="100%" height={44}>
      <LineChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <ReferenceLine y={1} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
        <YAxis domain={domain} hide />
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function UtilSpark({ data, risk }: { data: { t: string; v: number }[]; risk: RiskLevel }) {
  const color = RISK_COLOR[risk];
  return (
    <ResponsiveContainer width="100%" height={44}>
      <AreaChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <YAxis domain={[50, 100]} hide />
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={color} fillOpacity={0.08} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}


// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MarketsPage() {
  const [coinTab, setCoinTab] = useState<CoinCategory>("All");

  const filteredCoins = coinTab === "All"
    ? TOP_COINS
    : TOP_COINS.filter((c) => c.category.includes(coinTab));

  return (
    <main className="flex-1 bg-[#0f0f0f] text-white">

      <div className="mx-auto max-w-6xl px-6 pt-14 pb-20 space-y-12">

        {/* ── Fear & Greed ────────────────────────────────────────────────── */}
        <section>
          <SectionLabel label="Fear & Greed — 30d" />
          <Card className="p-5">
            <div className="mb-2 flex items-end justify-between">
              <div>
                <div className="font-mono text-[2.8rem] font-semibold leading-none text-white">72</div>
                <div className="mt-1 text-[11px] text-neutral-500">Greed Rate</div>
              </div>
              <div className="mb-12">
                <Badge variant="risk" level="warn">Medium Greed</Badge>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={FEAR_GREED_HISTORY} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="fgGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#fbbf24" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fill: "#525252", fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis domain={[0, 100]} hide />
                <Tooltip
                  contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "#737373" }}
                  itemStyle={{ color: "#fbbf24" }}
                  formatter={(v) => [v, "Fear & Greed"]}
                />
                <ReferenceLine y={50} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
                <Area type="monotone" dataKey="score" stroke="#fbbf24" strokeWidth={2} fill="url(#fgGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </section>

        {/* ── Stablecoin Monitor ──────────────────────────────────────────── */}
        <section>
          <SectionLabel label="Stablecoin Monitor — peg 7d" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {STABLECOINS.map((s) => (
              <Card key={s.symbol} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-[15px] font-semibold text-white">{s.symbol}</span>
                  <Badge variant="risk" level={s.risk} />
                </div>
                <div className="mt-3 font-mono text-[22px] font-semibold text-white leading-none">
                  ${s.peg.toFixed(3)}
                </div>
                <div className="mt-0.5 text-[10px] text-neutral-600 uppercase tracking-[0.15em]">peg</div>
                <div className="my-3">
                  <PegSpark data={s.pegHistory} risk={s.risk} />
                </div>
                <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-3">
                  <div>
                    <div className="text-[10px] text-neutral-600 uppercase tracking-[0.12em]">Supply</div>
                    <div className="mt-0.5 font-mono text-[12px] text-neutral-300">{s.supply}</div>
                    <Delta pct={s.supplyPct} />
                  </div>
                  <div>
                    <div className="text-[10px] text-neutral-600 uppercase tracking-[0.12em]">Liquidity</div>
                    <div className="mt-0.5 font-mono text-[12px] text-neutral-300">{s.liquidity}</div>
                    <Delta pct={s.liquidityPct} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* ── Lending Markets ─────────────────────────────────────────────── */}
        <section>
          <SectionLabel label="Lending Markets — utilization 7d" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {LENDING_MARKETS.map((m, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-medium text-[13px] text-white">{m.protocol}</div>
                    <div className="font-mono text-[11px] text-neutral-500">{m.asset}</div>
                  </div>
                  <Badge variant="risk" level={m.risk} />
                </div>
                <div className="mt-3 flex items-end gap-1.5">
                  <span className="font-mono text-[26px] font-semibold leading-none" style={{ color: RISK_COLOR[m.risk] }}>
                    {m.utilization}
                  </span>
                  <span className="mb-0.5 font-mono text-[13px] text-neutral-500">%</span>
                </div>
                <div className="mt-0.5 text-[10px] text-neutral-600 uppercase tracking-[0.12em]">utilization</div>
                <div className="my-3">
                  <UtilSpark data={m.utilHistory} risk={m.risk} />
                </div>
                <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-3">
                  <div>
                    <div className="text-[10px] text-neutral-600 uppercase tracking-[0.12em]">Supply APY</div>
                    <div className="mt-0.5 font-mono text-[13px] text-emerald-400">{m.supplyApy}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-neutral-600 uppercase tracking-[0.12em]">Borrow APY</div>
                    <div className="mt-0.5 font-mono text-[13px] text-neutral-400">{m.borrowApy}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>


        {/* ── Top 20 by Market Cap ────────────────────────────────────────── */}
        <section>
          <div className="mb-4 flex items-center justify-between gap-4">
            <SectionLabel label="Top 20 — Market Cap" />
            <div className="flex items-center gap-1 rounded-full border border-white/[0.07] bg-white/2 p-1">
              {COIN_CATEGORIES.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setCoinTab(tab)}
                  className={cn(
                    "rounded-full px-3 py-1 text-[11px] transition-colors",
                    coinTab === tab ? "bg-white/10 text-white" : "text-neutral-500 hover:text-neutral-300"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-white/6 text-[10px] uppercase tracking-[0.18em] text-neutral-600">
                    <th className="py-3 pl-5 pr-3 text-left font-normal w-8">#</th>
                    <th className="py-3 px-3 text-left font-normal">Asset</th>
                    <th className="py-3 px-3 text-right font-normal">Price</th>
                    <th className="py-3 px-3 text-right font-normal">24h</th>
                    <th className="py-3 px-3 text-right font-normal hidden sm:table-cell">7d</th>
                    <th className="py-3 px-3 text-right font-normal hidden md:table-cell">Market Cap</th>
                    <th className="py-3 px-3 text-right font-normal hidden lg:table-cell">Dom.</th>
                    <th className="py-3 px-3 text-right font-normal hidden lg:table-cell">Volume 24h</th>
                    <th className="py-3 px-3 text-right font-normal hidden xl:table-cell">Circ. Supply</th>
                    <th className="py-3 px-3 text-right font-normal hidden xl:table-cell">ATH</th>
                    <th className="py-3 px-3 pr-5 text-right font-normal hidden sm:table-cell w-24">7d chart</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCoins.map((c, idx) => (
                    <tr
                      key={c.symbol}
                      style={idx < filteredCoins.length - 1 ? { borderBottom: "1px solid #1c1c1c" } : undefined}
                      className="transition-colors hover:bg-white/2"
                    >
                      <td className="py-3 pl-5 pr-3 font-mono text-[11px] text-neutral-600">{c.rank}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/6 font-mono text-[10px] font-semibold text-neutral-300">
                            {c.symbol.slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-medium text-white">{c.symbol}</div>
                            <div className="text-[11px] text-neutral-600">{c.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-neutral-200">{c.price}</td>
                      <td className="py-3 px-3 text-right">
                        <span className={cn("font-mono text-[12px]", c.pct24h >= 0 ? "text-emerald-400" : "text-red-400")}>
                          {c.pct24h >= 0 ? "+" : ""}{c.pct24h.toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right hidden sm:table-cell">
                        <span className={cn("font-mono text-[12px]", c.pct7d >= 0 ? "text-emerald-400" : "text-red-400")}>
                          {c.pct7d >= 0 ? "+" : ""}{c.pct7d.toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-neutral-400 hidden md:table-cell">{c.marketCap}</td>
                      <td className="py-3 px-3 text-right font-mono text-neutral-400 hidden lg:table-cell">{c.dominance.toFixed(2)}%</td>
                      <td className="py-3 px-3 text-right font-mono text-neutral-400 hidden lg:table-cell">{c.volume24h}</td>
                      <td className="py-3 px-3 text-right font-mono text-neutral-500 text-[12px] hidden xl:table-cell">{c.circulatingSupply}</td>
                      <td className="py-3 px-3 text-right hidden xl:table-cell">
                        <div className="font-mono text-[12px] text-neutral-400">{c.ath}</div>
                        <span className="font-mono text-[11px] text-red-400">{c.athDistancePct.toFixed(1)}%</span>
                      </td>
                      <td className="py-3 px-3 pr-5 hidden sm:table-cell w-24">
                        <ResponsiveContainer width="100%" height={36}>
                          <LineChart data={c.sparkline} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
                            <YAxis domain={["auto", "auto"]} hide />
                            <Line type="monotone" dataKey="v" stroke={c.pct7d >= 0 ? "#34d399" : "#f87171"} strokeWidth={1.5} dot={false} isAnimationActive={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </section>

        {/* ── Market Stress Events ────────────────────────────────────────── */}
        <section>
          <SectionLabel label="Market Stress Events" />
          <div className="space-y-3">
            {STRESS_EVENTS.map((ev) => (
              <Card key={ev.id} className="p-5" hover>
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
                    ev.severity === "danger" ? "border-red-500/25 bg-red-500/10 text-red-400" : "border-amber-500/25 bg-amber-500/10 text-amber-400"
                  )}>
                    <AlertTriangle size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="tag">{EVENT_TYPE_LABEL[ev.type]}</Badge>
                      <span className="text-[11px] text-neutral-600">{ev.date}</span>
                    </div>
                    <h3 className="mt-1.5 text-[14px] font-medium text-white">{ev.title}</h3>
                    <p className="mt-1 text-[13px] leading-[1.55] text-neutral-500">{ev.detail}</p>
                  </div>
                  <Badge variant="risk" level={ev.severity} className="shrink-0 hidden sm:inline-flex" />
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* ── Portfolio Risk CTA ──────────────────────────────────────────── */}
        <Card className="p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                <Wallet size={13} className="text-neutral-600" />
                Cofano Portfolio Risk
              </div>
              <h2 className="mt-3 text-[20px] font-semibold leading-tight tracking-tight">
                See how these conditions affect your wallet.
              </h2>
              <p className="mt-2 text-[13px] leading-6 text-neutral-400 max-w-lg">
                USDe depegging? Morpho utilization at 91%? Connect your wallet and get a personalized
                risk breakdown against the current market state.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:items-end">
              <Btn href="/portfolio" variant="primary">
                <Wallet size={14} /> Analyze my wallet
              </Btn>
              <span className="text-[11px] text-neutral-700">Free tier · read-only</span>
            </div>
          </div>
        </Card>

      </div>
    </main>
  );
}
