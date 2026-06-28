"use client";

import Image from "next/image";
import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BookMarked,
  Clock,
  Eye,
  LayoutDashboard,
  Newspaper,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Wallet,
  X,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

// ─── Context ──────────────────────────────────────────────────────────────────

type DashboardContextValue = { open: () => void; close: () => void };
const DashboardContext = createContext<DashboardContextValue>({ open: () => {}, close: () => {} });
export function useDashboard() { return useContext(DashboardContext); }

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "portfolio" | "markets" | "research" | "news";

type SavedArticle = {
  savedAt: string; id: string; title: string; tag: string; cover: string;
  views: number; wordCount: number; readingTimeMinutes: number; createdAt: string;
};

type SavedNews = {
  savedAt: string; id: string; title: string; tag: string; cover: string;
  views: number; createdAt: string;
};

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_PORTFOLIO = {
  wallet: "0x71C7...F3d2",
  netWorth: "$24,810",
  riskScore: 62,
  riskLabel: "Moderate",
  positions: [
    { protocol: "Aave V3",     type: "Lending",   asset: "ETH",   value: "$12,400", health: 1.82, risk: "low"    },
    { protocol: "Uniswap V3",  type: "LP",        asset: "ETH/USDC", value: "$6,200",  health: null, risk: "medium" },
    { protocol: "Morpho Blue", type: "Lending",   asset: "wstETH", value: "$4,100",  health: 2.41, risk: "low"    },
    { protocol: "GMX V2",      type: "Perp",      asset: "BTC",   value: "$2,110",  health: null, risk: "high"   },
  ],
};

const MOCK_MARKETS = [
  { label: "ETH",             value: "$3,412",  change: "+2.4%",  up: true  },
  { label: "BTC",             value: "$67,240", change: "+1.1%",  up: true  },
  { label: "DeFi TVL",        value: "$94.2B",  change: "-0.8%",  up: false },
  { label: "Stablecoin cap",  value: "$162B",   change: "+0.3%",  up: true  },
  { label: "Fear & Greed",    value: "68 — Greed", change: "",    up: true  },
  { label: "Aave utilization",value: "78%",     change: "+3pp",   up: false },
];

const MOCK_LATEST_NEWS = [
  { id: "n-1", source: "Market",   title: "Stablecoin flows rise as traders de-risk ahead of volatility",    date: "Jun 23" },
  { id: "n-2", source: "Protocols",title: "Lending rates compress while onchain leverage rotates to perps",  date: "Jun 21" },
  { id: "n-3", source: "Security", title: "Checklist: what to verify before approving a new contract",       date: "Jun 19" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCompact(n: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}
function readTime(a: SavedArticle) {
  if (a.readingTimeMinutes > 0) return `${a.readingTimeMinutes} min`;
  return `${Math.max(1, Math.round(a.wordCount / 200))} min`;
}
function riskColor(r: string) {
  if (r === "high")   return "text-red-400";
  if (r === "medium") return "text-amber-400";
  return "text-emerald-400";
}
function riskBg(r: string) {
  if (r === "high")   return "bg-red-500/10 border-red-500/20";
  if (r === "medium") return "bg-amber-500/10 border-amber-500/20";
  return "bg-emerald-500/10 border-emerald-500/20";
}

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 pb-2 pt-1 text-[10px] uppercase tracking-[0.2em] text-neutral-600">
      {children}
    </div>
  );
}

// ─── Portfolio section ────────────────────────────────────────────────────────

function PortfolioSection({ onClose }: { onClose: () => void }) {
  const score = MOCK_PORTFOLIO.riskScore;
  const scoreColor = score >= 70 ? "text-red-400" : score >= 45 ? "text-amber-400" : "text-emerald-400";
  const scoreBg   = score >= 70 ? "bg-red-500"   : score >= 45 ? "bg-amber-500"   : "bg-emerald-500";

  return (
    <div className="space-y-3 px-4">
      {/* Wallet card */}
      <div className="rounded-xl border border-white/[0.07] bg-white/2 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-neutral-500">
            <Wallet size={13} />
            <span className="font-mono">{MOCK_PORTFOLIO.wallet}</span>
          </div>
          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-400">Connected</span>
        </div>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <div className="text-[11px] text-neutral-600">Net worth</div>
            <div className="mt-0.5 text-[22px] font-semibold tracking-tight text-white">{MOCK_PORTFOLIO.netWorth}</div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-neutral-600">Risk score</div>
            <div className={cn("mt-0.5 text-[22px] font-semibold tracking-tight", scoreColor)}>{score}</div>
          </div>
        </div>
        {/* Score bar */}
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/6">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className={cn("h-full rounded-full", scoreBg)}
          />
        </div>
        <div className="mt-1.5 flex justify-between text-[10px] text-neutral-700">
          <span>Low risk</span>
          <span className={scoreColor}>{MOCK_PORTFOLIO.riskLabel}</span>
          <span>High risk</span>
        </div>
      </div>

      {/* Positions */}
      <SectionLabel>Positions</SectionLabel>
      {MOCK_PORTFOLIO.positions.map((pos) => (
        <div
          key={pos.protocol + pos.asset}
          className="flex items-center justify-between rounded-xl border border-white/6 bg-white/2 px-3 py-2.5"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] font-medium text-white">{pos.protocol}</span>
              <span className="rounded-full border px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-neutral-500 border-white/8">
                {pos.type}
              </span>
            </div>
            <div className="mt-0.5 text-[11px] text-neutral-600">{pos.asset}</div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-[13px] font-medium text-white">{pos.value}</div>
            {pos.health !== null ? (
              <div className="mt-0.5 text-[10px] text-neutral-600">
                HF <span className={pos.health < 1.5 ? "text-red-400" : pos.health < 2 ? "text-amber-400" : "text-emerald-400"}>{pos.health}</span>
              </div>
            ) : (
              <div className={cn("mt-0.5 rounded-full border px-1.5 py-0.5 text-[9px] uppercase tracking-wider", riskBg(pos.risk))}>
                <span className={riskColor(pos.risk)}>{pos.risk}</span>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* CTA */}
      <Link
        href="/portfolio"
        onClick={onClose}
        className="flex w-full items-center justify-between rounded-xl border border-white/[0.07] bg-white/2 px-4 py-3 text-[13px] text-neutral-300 transition-colors hover:bg-white/4 hover:text-white"
      >
        <span className="flex items-center gap-2"><ShieldCheck size={14} className="text-neutral-500" />Full risk report</span>
        <ArrowRight size={13} className="text-neutral-600" />
      </Link>
    </div>
  );
}

// ─── Markets section ──────────────────────────────────────────────────────────

function MarketsSection({ onClose }: { onClose: () => void }) {
  return (
    <div className="space-y-3 px-4">
      <div className="grid grid-cols-2 gap-2">
        {MOCK_MARKETS.map((m) => (
          <div key={m.label} className="rounded-xl border border-white/6 bg-white/2 px-3 py-2.5">
            <div className="text-[10px] text-neutral-600">{m.label}</div>
            <div className="mt-1 text-[14px] font-semibold text-white">{m.value}</div>
            {m.change && (
              <div className={cn("mt-0.5 flex items-center gap-0.5 text-[11px]", m.up ? "text-emerald-400" : "text-red-400")}>
                {m.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {m.change}
              </div>
            )}
          </div>
        ))}
      </div>

      <SectionLabel>Risk alerts</SectionLabel>
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/8 px-3 py-2.5">
        <div className="flex items-start gap-2">
          <AlertTriangle size={13} className="mt-0.5 shrink-0 text-amber-400" />
          <div>
            <div className="text-[12px] font-medium text-amber-200">Aave V3 — high utilization</div>
            <p className="mt-0.5 text-[11px] leading-normal text-amber-200/60">
              ETH supply utilization at 78%. Borrow rates may spike if demand increases.
            </p>
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-white/6 bg-white/2 px-3 py-2.5">
        <div className="flex items-start gap-2">
          <Zap size={13} className="mt-0.5 shrink-0 text-neutral-500" />
          <div>
            <div className="text-[12px] font-medium text-neutral-300">Stablecoin de-peg monitor</div>
            <p className="mt-0.5 text-[11px] leading-normal text-neutral-600">All major stablecoins within 0.1% of peg.</p>
          </div>
        </div>
      </div>

      <Link
        href="/markets"
        onClick={onClose}
        className="flex w-full items-center justify-between rounded-xl border border-white/[0.07] bg-white/2 px-4 py-3 text-[13px] text-neutral-300 transition-colors hover:bg-white/4 hover:text-white"
      >
        <span className="flex items-center gap-2"><TrendingUp size={14} className="text-neutral-500" />Markets dashboard</span>
        <ArrowRight size={13} className="text-neutral-600" />
      </Link>
    </div>
  );
}

// ─── Research section ─────────────────────────────────────────────────────────

function ResearchSection({ articles, loading, onUnsave, onClose }: {
  articles: SavedArticle[];
  loading: boolean;
  onUnsave: (id: string) => void;
  onClose: () => void;
}) {
  const [lastRead, setLastRead] = useState<{ id: string; title: string; progress: number } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("last_read_article");
      if (raw) setLastRead(JSON.parse(raw) as { id: string; title: string; progress: number });
    } catch {}
  }, []);

  if (loading) return <SkeletonList />;

  return (
    <div className="space-y-3 px-4">
      {lastRead && (
        <>
          <SectionLabel>Continue reading</SectionLabel>
          <Link
            href={`/research/${lastRead.id}`}
            onClick={onClose}
            className="group flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/2 px-3 py-3 transition-all hover:border-white/12 hover:bg-white/4"
          >
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-medium text-white line-clamp-1 group-hover:text-neutral-200">
                {lastRead.title}
              </p>
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/8">
                <div className="h-full rounded-full bg-white/40" style={{ width: `${lastRead.progress}%` }} />
              </div>
              <div className="mt-1 text-[10px] text-neutral-600">{lastRead.progress}% read</div>
            </div>
            <ArrowUpRight size={13} className="ml-3 shrink-0 text-neutral-600 group-hover:text-neutral-400" />
          </Link>
        </>
      )}

      <SectionLabel>Saved{articles.length > 0 ? ` · ${articles.length}` : ""}</SectionLabel>

      {articles.length === 0 ? (
        <div className="rounded-xl border border-white/6 bg-white/2 px-4 py-8 text-center">
          <BookMarked size={16} className="mx-auto mb-2 text-neutral-600" />
          <p className="text-[12px] text-neutral-600">No saved articles.</p>
          <Link href="/research" onClick={onClose} className="mt-2 inline-flex items-center gap-1 text-[11px] text-neutral-500 hover:text-white transition-colors">
            Browse Research <ArrowRight size={10} />
          </Link>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          {articles.map((a) => <ArticleItem key={a.id} item={a} onClose={onClose} onUnsave={onUnsave} />)}
        </AnimatePresence>
      )}

      <Link
        href="/research"
        onClick={onClose}
        className="flex w-full items-center justify-between rounded-xl border border-white/[0.07] bg-white/2 px-4 py-3 text-[13px] text-neutral-300 transition-colors hover:bg-white/4 hover:text-white"
      >
        <span className="flex items-center gap-2"><BookMarked size={14} className="text-neutral-500" />All articles</span>
        <ArrowRight size={13} className="text-neutral-600" />
      </Link>
    </div>
  );
}

// ─── News section ─────────────────────────────────────────────────────────────

function NewsSection({ saved, loading, onUnsave, onClose }: {
  saved: SavedNews[];
  loading: boolean;
  onUnsave: (id: string) => void;
  onClose: () => void;
}) {
  if (loading) return <SkeletonList />;

  return (
    <div className="space-y-3 px-4">
      <SectionLabel>Latest</SectionLabel>
      <div className="rounded-xl border border-white/6 bg-white/2 divide-y divide-white/6 overflow-hidden">
        {MOCK_LATEST_NEWS.map((n) => (
          <Link
            key={n.id}
            href={`/news/${n.id}`}
            onClick={onClose}
            className="group flex items-start justify-between gap-3 px-3 py-2.5 transition-colors hover:bg-white/4"
          >
            <div className="min-w-0">
              <span className="text-[9px] uppercase tracking-[0.18em] text-neutral-600">{n.source} · {n.date}</span>
              <p className="mt-0.5 text-[12px] leading-snug text-neutral-300 line-clamp-2 group-hover:text-white transition-colors">{n.title}</p>
            </div>
            <ArrowUpRight size={11} className="mt-1 shrink-0 text-neutral-700 group-hover:text-neutral-400" />
          </Link>
        ))}
      </div>

      <SectionLabel>Saved{saved.length > 0 ? ` · ${saved.length}` : ""}</SectionLabel>

      {saved.length === 0 ? (
        <div className="rounded-xl border border-white/6 bg-white/2 px-4 py-8 text-center">
          <Newspaper size={16} className="mx-auto mb-2 text-neutral-600" />
          <p className="text-[12px] text-neutral-600">No saved news.</p>
          <Link href="/news" onClick={onClose} className="mt-2 inline-flex items-center gap-1 text-[11px] text-neutral-500 hover:text-white transition-colors">
            Browse News <ArrowRight size={10} />
          </Link>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          {saved.map((n) => <NewsItem key={n.id} item={n} onClose={onClose} onUnsave={onUnsave} />)}
        </AnimatePresence>
      )}

      <Link
        href="/news"
        onClick={onClose}
        className="flex w-full items-center justify-between rounded-xl border border-white/[0.07] bg-white/2 px-4 py-3 text-[13px] text-neutral-300 transition-colors hover:bg-white/4 hover:text-white"
      >
        <span className="flex items-center gap-2"><Newspaper size={14} className="text-neutral-500" />All news</span>
        <ArrowRight size={13} className="text-neutral-600" />
      </Link>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonList() {
  return (
    <div className="space-y-2 px-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse flex gap-3 rounded-xl border border-white/6 bg-white/2 p-3">
          <div className="h-14 w-20 shrink-0 rounded-lg bg-white/6" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-2.5 w-12 rounded-full bg-white/6" />
            <div className="h-3.5 w-4/5 rounded-full bg-white/5" />
            <div className="h-3 w-3/5 rounded-full bg-white/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Article item ─────────────────────────────────────────────────────────────

function ArticleItem({ item, onUnsave, onClose }: { item: SavedArticle; onUnsave: (id: string) => void; onClose: () => void }) {
  const [removing, setRemoving] = useState(false);
  const unsave = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (removing) return;
    setRemoving(true);
    try {
      await fetch(`/api/articles/saved?id=${encodeURIComponent(item.id)}`, { method: "DELETE", credentials: "include" });
      onUnsave(item.id);
    } finally { setRemoving(false); }
  };
  return (
    <motion.div layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.22 }}>
      <Link href={`/research/${item.id}`} onClick={onClose} className="group flex gap-3 rounded-xl border border-white/6 bg-white/2 p-3 transition-all hover:border-white/12 hover:bg-white/4">
        <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg">
          <Image src={item.cover} alt={item.title} fill sizes="80px" className="object-cover transition-transform duration-300 group-hover:scale-[1.04]" />
          <div className="absolute inset-0 bg-black/15" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <div>
            <Badge variant="tag">{item.tag}</Badge>
            <p className="mt-1 text-[12px] font-medium leading-snug text-white line-clamp-2 group-hover:text-neutral-100">{item.title}</p>
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] text-neutral-600">
              <span className="flex items-center gap-0.5"><Clock size={9} />{readTime(item)}</span>
              <span className="flex items-center gap-0.5"><Eye size={9} />{formatCompact(item.views)}</span>
            </div>
            <button type="button" onClick={unsave} disabled={removing} className="text-[10px] text-neutral-600 hover:text-neutral-300 transition-colors disabled:opacity-40">
              {removing ? "…" : "unsave"}
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── News item ────────────────────────────────────────────────────────────────

function NewsItem({ item, onUnsave, onClose }: { item: SavedNews; onUnsave: (id: string) => void; onClose: () => void }) {
  const [removing, setRemoving] = useState(false);
  const unsave = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (removing) return;
    setRemoving(true);
    try {
      await fetch(`/api/news/saved?id=${encodeURIComponent(item.id)}`, { method: "DELETE", credentials: "include" });
      onUnsave(item.id);
    } finally { setRemoving(false); }
  };
  return (
    <motion.div layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.22 }}>
      <Link href={`/news/${item.id}`} onClick={onClose} className="group flex gap-3 rounded-xl border border-white/6 bg-white/2 p-3 transition-all hover:border-white/12 hover:bg-white/4">
        <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg">
          <Image src={item.cover} alt={item.title} fill sizes="80px" className="object-cover transition-transform duration-300 group-hover:scale-[1.04]" />
          <div className="absolute inset-0 bg-black/15" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <div>
            <Badge variant="tag">{item.tag}</Badge>
            <p className="mt-1 text-[12px] font-medium leading-snug text-white line-clamp-2 group-hover:text-neutral-100">{item.title}</p>
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="flex items-center gap-0.5 text-[10px] text-neutral-600"><Eye size={9} />{formatCompact(item.views)}</span>
            <button type="button" onClick={unsave} disabled={removing} className="text-[10px] text-neutral-600 hover:text-neutral-300 transition-colors disabled:opacity-40">
              {removing ? "…" : "unsave"}
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Drawer ───────────────────────────────────────────────────────────────────

const TABS: { key: Tab; label: string }[] = [
  { key: "portfolio", label: "Portfolio" },
  { key: "markets",   label: "Markets"   },
  { key: "research",  label: "Research"  },
  { key: "news",      label: "News"      },
];

function Drawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>("portfolio");
  const [articles, setArticles] = useState<SavedArticle[]>([]);
  const [news, setNews] = useState<SavedNews[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [loadingNews, setLoadingNews] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!isOpen || fetchedRef.current) return;
    fetchedRef.current = true;
    let active = true;
    queueMicrotask(() => { if (active) { setLoadingArticles(true); setLoadingNews(true); } });
    fetch("/api/articles/saved", { credentials: "include" })
      .then(async (r) => { if (!active || !r.ok) return; setArticles((await r.json()) as SavedArticle[]); })
      .catch(() => {}).finally(() => { if (active) setLoadingArticles(false); });
    fetch("/api/news/saved", { credentials: "include" })
      .then(async (r) => { if (!active || !r.ok) return; setNews((await r.json()) as SavedNews[]); })
      .catch(() => {}).finally(() => { if (active) setLoadingNews(false); });
    return () => { active = false; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-100 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            key="drawer"
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            className="fixed right-0 top-0 z-101 flex h-full w-full max-w-sm flex-col bg-[#0f0f0f] border-l border-white/[0.07]"
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-white/6 px-5 py-4">
              <div className="flex items-center gap-2">
                <LayoutDashboard size={14} className="text-neutral-500" />
                <span className="text-[13px] font-medium text-white">Dashboard</span>
              </div>
              <button type="button" onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.07] text-neutral-500 transition-colors hover:text-white">
                <X size={13} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex shrink-0 items-center gap-0 border-b border-white/6 px-5">
              {TABS.map((t) => {
                const active = t.key === tab;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTab(t.key)}
                    className={cn(
                      "relative shrink-0 py-3 pr-5 text-[12px] transition-colors",
                      active ? "text-white" : "text-neutral-500 hover:text-neutral-300"
                    )}
                  >
                    {t.label}
                    <span className={cn("absolute left-0 -bottom-px h-px w-[calc(100%-20px)] bg-white transition-opacity", active ? "opacity-100" : "opacity-0")} />
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto py-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                >
                  {tab === "portfolio" && <PortfolioSection onClose={onClose} />}
                  {tab === "markets"   && <MarketsSection onClose={onClose} />}
                  {tab === "research"  && <ResearchSection articles={articles} loading={loadingArticles} onUnsave={(id) => setArticles((p) => p.filter((x) => x.id !== id))} onClose={onClose} />}
                  {tab === "news"      && <NewsSection saved={news} loading={loadingNews} onUnsave={(id) => setNews((p) => p.filter((x) => x.id !== id))} onClose={onClose} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open  = useCallback(() => setIsOpen(true),  []);
  const close = useCallback(() => setIsOpen(false), []);
  return (
    <DashboardContext.Provider value={{ open, close }}>
      {children}
      <Drawer isOpen={isOpen} onClose={close} />
    </DashboardContext.Provider>
  );
}

// ─── Trigger ──────────────────────────────────────────────────────────────────

export function DashboardTrigger({ className }: { className?: string }) {
  const { open } = useDashboard();
  return (
    <button
      type="button"
      onClick={open}
      aria-label="Dashboard"
      className={cn(
        "inline-flex items-center justify-center h-9 w-9 rounded-full border border-white/[0.07] bg-white/2 text-neutral-400 transition-colors hover:text-white hover:bg-white/6",
        className
      )}
    >
      <LayoutDashboard size={15} />
    </button>
  );
}
