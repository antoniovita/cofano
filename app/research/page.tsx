"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, Eye, PenLine, Share, SlidersHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

type TabKey = "Articles" | "Featured";

type ApiAuthor = {
  id: string;
  username: string;
  role: "ADMIN" | "USER" | "CONTRIBUTOR";
};

type ViewerRole = ApiAuthor["role"] | null;

type ApiArticle = {
  id: string;
  title: string;
  content: string;
  tag: string;
  cover: string;
  published: boolean;
  featured: boolean;
  wordCount: number;
  readingTimeMinutes: number;
  views: number;
  createdAt: string;
  updatedAt: string;
  author: ApiAuthor;
};

type ArticleCard = {
  id: string;
  featured: boolean;
  author: string;
  title: string;
  excerpt: string;
  date: string;
  tag: string;
  readTime: string;
  views: string;
  image: string;
};

type NewsCard = {
  id: string;
  source: string;
  title: string;
  date: string;
};

const MOCK_NEWS: NewsCard[] = [
  {
    id: "n-1",
    source: "Market",
    title: "Stablecoin flows rise as traders de-risk ahead of volatility",
    date: "Apr 12, 2026",
  },
  {
    id: "n-2",
    source: "Protocols",
    title: "Lending rates compress while onchain leverage rotates to perps",
    date: "Apr 10, 2026",
  },
  {
    id: "n-3",
    source: "Security",
    title: "Checklist: what to verify before approving a new contract",
    date: "Apr 8, 2026",
  },
  {
    id: "n-4",
    source: "Ecosystem",
    title: "DEX liquidity migrates to new incentives — what it changes for LPs",
    date: "Apr 5, 2026",
  },
];

const MOCK_ARTICLES: ArticleCard[] = [
  {
    id: "a-1",
    featured: false,
    author: "Equipe Editorial",
    title: "Por que entender DeFi muda sua forma de operar",
    excerpt: "DEXs, lending, stablecoins e os riscos que você precisa mapear antes de colocar capital em jogo.",
    date: "Mar 20, 2026",
    tag: "Fundamentos",
    readTime: "6 min",
    views: "10.7K",
    image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=900&q=80",
  },
  {
    id: "a-2",
    featured: false,
    author: "Time de Pesquisa",
    title: "AMMs: preço, slippage e o custo real do swap",
    excerpt: "Produto constante, impacto no preço, taxas e como avaliar quando uma rota é realmente eficiente.",
    date: "Mar 16, 2026",
    tag: "Mecânicas",
    readTime: "8 min",
    views: "5K",
    image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=900&q=80",
  },
  {
    id: "a-3",
    featured: false,
    author: "Equipe Editorial",
    title: "Checklist de segurança antes de interagir com um protocolo",
    excerpt: "Permissões, approvals, chaves administrativas, oráculos e sinais de alerta em 5 minutos.",
    date: "Mar 10, 2026",
    tag: "Segurança",
    readTime: "7 min",
    views: "5.9K",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=900&q=80",
  },
  {
    id: "a-4",
    featured: true,
    author: "Equipe Editorial",
    title: "Stablecoins: o que observar em momentos de estresse",
    excerpt: "Colateral, mecanismos de resgate, riscos de contraparte e onde o peg costuma falhar primeiro.",
    date: "Mar 05, 2026",
    tag: "Mercado",
    readTime: "9 min",
    views: "12.4K",
    image: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=900&q=80",
  },
  {
    id: "a-5",
    featured: true,
    author: "Time de Pesquisa",
    title: "Lending sem sustos: health factor e liquidações",
    excerpt: "Buffers, taxas variáveis, colateralização e como evitar cascatas de liquidação em volatilidade.",
    date: "Feb 28, 2026",
    tag: "Mecânicas",
    readTime: "10 min",
    views: "8.1K",
    image: "https://images.unsplash.com/photo-1559526324-593bc073d938?w=900&q=80",
  },
  {
    id: "a-6",
    featured: true,
    author: "Equipe Editorial",
    title: "Auditoria rápida: um framework para avaliar protocolos",
    excerpt: "Superfícies de ataque, pausas, upgrades e pontos de centralização para checar antes de confiar.",
    date: "Feb 18, 2026",
    tag: "Segurança",
    readTime: "8 min",
    views: "6.6K",
    image: "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=900&q=80",
  },
];

function formatDateShort(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", year: "numeric" }).format(date);
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact", compactDisplay: "short", maximumFractionDigits: 1 }).format(value);
}

function stripMarkdown(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ").replace(/`([^`]+)`/g, "$1")
    .replace(/^#{1,6}\s+/gm, "").replace(/^>\s+/gm, "")
    .replace(/^[-*]\s+/gm, "").replace(/^\d+\.\s+/gm, "")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1").replace(/\s+/g, " ").trim();
}

function makeExcerpt(content: string, maxLen = 160) {
  const plain = stripMarkdown(content);
  if (plain.length <= maxLen) return plain;
  return `${plain.slice(0, maxLen).replace(/\s+\S*$/, "").trim()}…`;
}

export default function ResearchPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("Articles");
  const [activeTag, setActiveTag] = useState<string>("All");
  const [filterOpen, setFilterOpen] = useState(false);
  const [apiArticles, setApiArticles] = useState<ApiArticle[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewerRole, setViewerRole] = useState<ViewerRole>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  const apiUrl = useMemo(() => {
    const params = new URLSearchParams({
      published: "true",
      order: activeTab === "Featured" ? "views" : "createdAt",
      direction: "desc",
      take: "50",
      skip: "0",
    });
    if (activeTab === "Featured") params.set("featured", "true");
    return `/api/articles?${params.toString()}`;
  }, [activeTab]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    queueMicrotask(() => { if (!active) return; setLoading(true); });

    fetch(apiUrl, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as unknown;
        return Array.isArray(data) ? (data as ApiArticle[]) : [];
      })
      .then((data) => setApiArticles(data))
      .catch((err) => {
        if ((err as { name?: string }).name === "AbortError") return;
        setApiArticles([]);
      })
      .finally(() => { queueMicrotask(() => { if (!active) return; setLoading(false); }); });

    return () => { active = false; controller.abort(); };
  }, [apiUrl]);

  const allArticles = useMemo<ArticleCard[]>(() => {
    if (!apiArticles || apiArticles.length === 0) return MOCK_ARTICLES;
    return apiArticles.map((a) => ({
      id: a.id,
      featured: Boolean(a.featured),
      author: a.author?.username || "Equipe Editorial",
      title: a.title,
      excerpt: makeExcerpt(a.content),
      date: formatDateShort(a.createdAt),
      tag: a.tag,
      readTime: `${Math.max(1, Math.round((a.wordCount || 0) / 200))} min`,
      views: formatCompactNumber(a.views || 0),
      image: a.cover,
    }));
  }, [apiArticles]);

  const articlesForTab = useMemo(() =>
    activeTab === "Featured" ? allArticles.filter((a) => a.featured) : allArticles,
    [activeTab, allArticles]
  );

  const tabTagStats = useMemo(() => {
    const counts = new Map<string, number>();
    for (const a of articlesForTab) counts.set(a.tag, (counts.get(a.tag) || 0) + 1);
    return Array.from(counts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
  }, [articlesForTab]);

  const visibleArticles = useMemo(() =>
    articlesForTab.filter((a) => activeTag === "All" || a.tag === activeTag),
    [activeTag, articlesForTab]
  );

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (!filterOpen) return;
      if ((e.target as Node | null) && filterRef.current?.contains(e.target as Node)) return;
      setFilterOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [filterOpen]);

  useEffect(() => {
    let active = true;
    const check = async () => {
      try {
        const res = await fetch("/api/check", { method: "GET", credentials: "include", cache: "no-store" });
        if (!active || !res.ok) return;
        const body = (await res.json().catch(() => null)) as { allowed?: boolean; user?: { role?: ApiAuthor["role"] } } | null;
        if (active && body?.allowed && body.user?.role) setViewerRole(body.user.role);
      } catch { /* ignore */ }
    };
    void check();
    window.addEventListener("focus", check);
    window.addEventListener("auth-changed", check);
    return () => { active = false; window.removeEventListener("focus", check); window.removeEventListener("auth-changed", check); };
  }, []);

  const tabs: TabKey[] = ["Articles", "Featured"];

  return (
    <main className="flex-1 bg-[#0f0f0f] text-white">
      <section className="mx-auto max-w-6xl px-6 pt-10 pb-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_300px] lg:items-start">
          <div>
            <div className="flex items-end justify-between gap-6 border-b border-white/6">
              <div className="flex items-center gap-6 text-[13px] text-neutral-500">
                {tabs.map((tab) => {
                  const active = tab === activeTab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => { setActiveTab(tab); setActiveTag("All"); setFilterOpen(false); }}
                      className={cn("relative py-4 transition-colors", active ? "text-white" : "hover:text-neutral-200")}
                    >
                      {tab}
                      <span className={cn("absolute left-0 -bottom-px h-[2px] w-full bg-white transition-opacity", active ? "opacity-100" : "opacity-0")} />
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3 pb-3">
                {(viewerRole === "CONTRIBUTOR" || viewerRole === "ADMIN") ? (
                  <Link
                    href="/research/create"
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-3 py-1.5 text-[12px] text-neutral-300 transition-colors hover:bg-white/8 hover:text-white"
                  >
                    <PenLine size={14} className="text-neutral-400" />
                    Create
                  </Link>
                ) : null}

                <div ref={filterRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setFilterOpen((v) => !v)}
                    className={cn("inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-3 py-1.5 text-[12px] text-neutral-300 transition-colors hover:bg-white/8", filterOpen && "bg-white/8")}
                  >
                    <SlidersHorizontal size={14} className="text-neutral-400" />
                    Filter
                  </button>

                  {filterOpen ? (
                    <div className="absolute right-0 top-full z-20 mt-2 w-64 rounded-2xl border border-white/[0.07] bg-[#0f0f0f] p-2 shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
                      <div className="px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-neutral-500">Topics</div>
                      {[{ tag: "All", count: articlesForTab.length }, ...tabTagStats].map(({ tag, count }) => {
                        const isActive = tag === activeTag;
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => { setActiveTag(tag); setFilterOpen(false); }}
                            className={cn("flex w-full items-center justify-between rounded-xl px-3 py-2 mt-2 text-[13px] transition-colors", isActive ? "bg-white/8 text-white" : "text-neutral-300 hover:bg-white/6")}
                          >
                            <span className="truncate">{tag}</span>
                            <span className="flex items-center gap-2 text-neutral-500">
                              <span className="text-[12px]">{count}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="divide-y divide-white/6">
              {visibleArticles.length === 0 ? (
                <div className="py-16">
                  <div className="rounded-2xl border border-white/[0.07] bg-white/2 p-8">
                    <div className="text-[12px] uppercase tracking-[0.2em] text-neutral-500">
                      {loading ? "Loading" : "No results"}
                    </div>
                    <p className="mt-3 text-[14px] leading-7 text-neutral-400">
                      {loading ? "Fetching articles…" : "No articles found with this filter."}
                    </p>
                  </div>
                </div>
              ) : (
                visibleArticles.map((article) => (
                  <article key={article.id} className="py-9">
                    <div className="flex items-start justify-between gap-8">
                      <div className="min-w-0">
                        <Link href={`/research/${article.id}`} className="block">
                          <h2 className="mt-3 text-[26px] font-semibold leading-[1.12] tracking-tight text-white">
                            {article.title}
                          </h2>
                          <p className="mt-2 text-[15px] leading-7 text-neutral-400 line-clamp-2">
                            {article.excerpt}
                          </p>
                        </Link>
                        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-neutral-500">
                          <div className="inline-flex items-center gap-2">
                            <span>{article.date}</span>
                            <span className="text-neutral-700">·</span>
                            <span>{article.readTime} read</span>
                            <span className="text-neutral-700">·</span>
                            <Badge variant="tag">{article.tag}</Badge>
                          </div>
                          <div className="ml-auto flex items-center gap-4">
                            <div className="flex items-center gap-1"><Eye size={16} />{article.views}</div>
                            <button type="button" className="rounded-md p-1 hover:bg-white/8 transition-colors" aria-label="Share">
                              <Share size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="relative hidden h-24 w-40 shrink-0 overflow-hidden sm:block">
                        <Image src={article.image} alt={article.title} fill sizes="160px" className="object-cover" />
                        <div className="absolute inset-0 bg-black/10" />
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-2xl border border-white/[0.07] bg-white/2 p-6">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                  <PenLine size={14} className="text-neutral-600" />
                  Contribute
                </div>
                <h3 className="mt-3 text-[17px] font-semibold leading-tight tracking-tight text-white">
                  Write for Cofano Research
                </h3>
                <p className="mt-2 text-[13px] leading-6 text-neutral-400">
                  Publish risk analyses, protocol breakdowns and DeFi frameworks. We help with editing and distribution.
                </p>
                <ul className="mt-4 space-y-2 text-[13px] text-neutral-400">
                  <li className="flex gap-2"><span className="mt-2 size-1.5 rounded-full bg-white/25" /><span>Topics: risk, protocols, stablecoins, security</span></li>
                  <li className="flex gap-2"><span className="mt-2 size-1.5 rounded-full bg-white/25" /><span>Format: direct, example-driven</span></li>
                  <li className="flex gap-2"><span className="mt-2 size-1.5 rounded-full bg-white/25" /><span>Authorship preserved</span></li>
                </ul>
                <Link
                  href="/login"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-black hover:bg-neutral-100 transition-colors"
                >
                  Start writing <ArrowRight size={14} />
                </Link>
              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-white/2 p-5">
                <div className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                  Latest news
                </div>
                <ul className="mt-3 divide-y divide-white/6">
                  {MOCK_NEWS.map((item) => (
                    <li key={item.id} className="py-3 first:pt-0 last:pb-0">
                      <Link href={`/news/${item.id}`} className="group block">
                        <span className="text-[10px] uppercase tracking-[0.16em] text-neutral-600">
                          {item.source} · {item.date}
                        </span>
                        <p className="mt-1 text-[13px] leading-[1.45] text-neutral-300 group-hover:text-white transition-colors line-clamp-2">
                          {item.title}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
