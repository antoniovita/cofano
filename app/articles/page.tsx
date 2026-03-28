"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, Eye, PenLine, Share, SlidersHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";

type TabKey = "For you" | "Featured";

type ApiAuthor = {
  id: string;
  username: string;
  role: "ADMIN" | "USER";
};

type ApiArticle = {
  id: string;
  title: string;
  content: string;
  tag: string;
  cover: string;
  published: boolean;
  wordCount: number;
  readingTimeMinutes: number;
  views: number;
  createdAt: string;
  updatedAt: string;
  author: ApiAuthor;
};

type ArticleCard = {
  id: string;
  section: TabKey;
  publication: string;
  author: string;
  title: string;
  excerpt: string;
  date: string;
  tag: string;
  readTime: string;
  views: string;
  comments: string;
  image: string;
  avatar?: string;
};

const MOCK_ARTICLES: ArticleCard[] = [
  {
    id: "a-1",
    section: "For you",
    publication: "DeFi Institute",
    author: "Equipe Editorial",
    title: "Por que entender DeFi muda sua forma de operar",
    excerpt:
      "DEXs, lending, stablecoins e os riscos que você precisa mapear antes de colocar capital em jogo.",
    date: "Mar 20, 2026",
    tag: "Fundamentos",
    readTime: "6 min",
    views: "10.7K",
    comments: "429",
    image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=900&q=80",
    avatar:
      "https://images.unsplash.com/photo-1550525811-e5869dd03032?w=64&q=80&fit=crop",
  },
  {
    id: "a-2",
    section: "For you",
    publication: "Mecânicas DeFi",
    author: "Time de Pesquisa",
    title: "AMMs: preço, slippage e o custo real do swap",
    excerpt:
      "Produto constante, impacto no preço, taxas e como avaliar quando uma rota é realmente eficiente.",
    date: "Mar 16, 2026",
    tag: "Mecânicas",
    readTime: "8 min",
    views: "5K",
    comments: "187",
    image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=900&q=80",
    avatar:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=64&q=80&fit=crop",
  },
  {
    id: "a-3",
    section: "For you",
    publication: "Segurança",
    author: "Equipe Editorial",
    title: "Checklist de segurança antes de interagir com um protocolo",
    excerpt:
      "Permissões, approvals, chaves administrativas, oráculos e sinais de alerta em 5 minutos.",
    date: "Mar 10, 2026",
    tag: "Segurança",
    readTime: "7 min",
    views: "5.9K",
    comments: "221",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=900&q=80",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&q=80&fit=crop",
  },
  {
    id: "a-4",
    section: "Featured",
    publication: "Mercado",
    author: "Equipe Editorial",
    title: "Stablecoins: o que observar em momentos de estresse",
    excerpt:
      "Colateral, mecanismos de resgate, riscos de contraparte e onde o peg costuma falhar primeiro.",
    date: "Mar 05, 2026",
    tag: "Mercado",
    readTime: "9 min",
    views: "12.4K",
    comments: "312",
    image: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=900&q=80",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=64&q=80&fit=crop",
  },
  {
    id: "a-5",
    section: "Featured",
    publication: "Mecânicas DeFi",
    author: "Time de Pesquisa",
    title: "Lending sem sustos: health factor e liquidações",
    excerpt:
      "Buffers, taxas variáveis, colateralização e como evitar cascatas de liquidação em volatilidade.",
    date: "Feb 28, 2026",
    tag: "Mecânicas",
    readTime: "10 min",
    views: "8.1K",
    comments: "98",
    image: "https://images.unsplash.com/photo-1559526324-593bc073d938?w=900&q=80",
    avatar:
      "https://images.unsplash.com/photo-1520975916090-3105956dac38?w=64&q=80&fit=crop",
  },
  {
    id: "a-6",
    section: "Featured",
    publication: "Segurança",
    author: "Equipe Editorial",
    title: "Auditoria rápida: um framework para avaliar protocolos",
    excerpt:
      "Superfícies de ataque, pausas, upgrades e pontos de centralização para checar antes de confiar.",
    date: "Feb 18, 2026",
    tag: "Segurança",
    readTime: "8 min",
    views: "6.6K",
    comments: "64",
    image: "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=900&q=80",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=64&q=80&fit=crop",
  },
];

function formatDateShort(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  }).format(value);
}

function stripMarkdown(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s+/gm, "")
    .replace(/^[-*]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function makeExcerpt(content: string, maxLen = 160) {
  const plain = stripMarkdown(content);
  if (plain.length <= maxLen) return plain;
  const cut = plain.slice(0, maxLen).replace(/\s+\S*$/, "").trim();
  return `${cut}…`;
}

export default function ArticlesPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("For you");
  const [activeTag, setActiveTag] = useState<string>("All");
  const [filterOpen, setFilterOpen] = useState(false);
  const [apiArticles, setApiArticles] = useState<ApiArticle[] | null>(null);
  const [loading, setLoading] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const apiUrl = useMemo(() => {
    const order = activeTab === "Featured" ? "views" : "createdAt";
    const params = new URLSearchParams({
      published: "true",
      order,
      direction: "desc",
      take: "50",
      skip: "0",
    });
    return `/api/articles?${params.toString()}`;
  }, [activeTab]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setLoading(true);
    });

    fetch(apiUrl, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as unknown;
        if (!Array.isArray(data)) return [];
        return data as ApiArticle[];
      })
      .then((data) => setApiArticles(data))
      .catch((err) => {
        if ((err as { name?: string }).name === "AbortError") return;
        console.error(err);
        setApiArticles([]);
      })
      .finally(() => {
        queueMicrotask(() => {
          if (!active) return;
          setLoading(false);
        });
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [apiUrl]);

  const allArticles = useMemo<ArticleCard[]>(() => {
    if (!apiArticles || apiArticles.length === 0) return MOCK_ARTICLES;

    return apiArticles.map((article) => {
      const readMinutes =
        article.readingTimeMinutes && article.readingTimeMinutes > 0
          ? article.readingTimeMinutes
          : Math.max(1, Math.round((article.wordCount || 0) / 200));

      return {
        id: article.id,
        section: activeTab,
        publication: "DeFi Institute",
        author: article.author?.username || "Equipe Editorial",
        title: article.title,
        excerpt: makeExcerpt(article.content),
        date: formatDateShort(article.createdAt),
        tag: article.tag,
        readTime: `${readMinutes} min`,
        views: formatCompactNumber(article.views || 0),
        comments: "",
        image: article.cover,
        avatar: `https://api.dicebear.com/9.x/identicon/svg?seed=${encodeURIComponent(
          article.author?.id || article.id
        )}`,
      };
    });
  }, [activeTab, apiArticles]);

  const articlesForTab = useMemo(
    () => allArticles.filter((article) => article.section === activeTab),
    [activeTab, allArticles]
  );

  const tabTagStats = useMemo(() => {
    const counts = new Map<string, number>();
    for (const article of articlesForTab) {
      counts.set(article.tag, (counts.get(article.tag) || 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
  }, [articlesForTab]);

  const visibleArticles = useMemo(() => {
    return articlesForTab.filter((a) => {
      if (activeTag === "All") return true;
      return a.tag === activeTag;
    });
  }, [activeTag, articlesForTab]);

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (!filterOpen) return;
      const target = e.target as Node | null;
      if (target && filterRef.current?.contains(target)) return;
      setFilterOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [filterOpen]);

  return (
    <main className="flex-1 bg-[#0f0f0f] text-white">
      <section className="mx-auto max-w-6xl px-6 pt-10 pb-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_320px] lg:items-start">
          <div>
            <div className="flex items-end justify-between gap-6 border-b border-white/6">
              <div className="flex items-center gap-6 text-[13px] text-neutral-500">
                {(["For you", "Featured"] as TabKey[]).map((tab) => {
                  const active = tab === activeTab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => {
                        setActiveTab(tab);
                        setActiveTag("All");
                        setFilterOpen(false);
                      }}
                      className={cn(
                        "relative py-4 transition-colors",
                        active ? "text-white" : "hover:text-neutral-200"
                      )}
                    >
                      {tab}
                      <span
                        className={cn(
                          "absolute left-0 -bottom-px h-[2px] w-full bg-white transition-opacity",
                          active ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </button>
                  );
                })}
              </div>

              <div ref={filterRef} className="relative pb-3">
                <button
                  type="button"
                  onClick={() => setFilterOpen((v) => !v)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-3 py-1.5 text-[12px] text-neutral-300 transition-colors hover:bg-white/8",
                    filterOpen && "bg-white/8"
                  )}
                  aria-haspopup="menu"
                  aria-expanded={filterOpen}
                >
                  <SlidersHorizontal size={14} className="text-neutral-400" />
                  Filtrar
                </button>

                {filterOpen ? (
                  <div
                    role="menu"
                    className="absolute right-0 top-full z-20 mt-2 w-64 rounded-2xl border border-white/[0.07] bg-[#0f0f0f] p-2 shadow-[0_20px_60px_rgba(0,0,0,0.55)]"
                  >
                    <div className="px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                      Tópicos
                    </div>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setActiveTag("All");
                        setFilterOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl px-3 py-2 text-[13px] transition-colors",
                        activeTag === "All"
                          ? "bg-white/8 text-white"
                          : "text-neutral-300 hover:bg-white/6"
                      )}
                    >
                      <span>All</span>
                      {activeTag === "All" ? (
                        <Check size={14} className="text-neutral-300" />
                      ) : null}
                    </button>

                    {tabTagStats.map(({ tag, count }) => {
                      const active = tag === activeTag;
                      return (
                        <button
                          key={tag}
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setActiveTag(tag);
                            setFilterOpen(false);
                          }}
                          className={cn(
                            "flex w-full items-center justify-between rounded-xl px-3 py-2 text-[13px] transition-colors",
                            active
                              ? "bg-white/8 text-white"
                              : "text-neutral-300 hover:bg-white/6"
                          )}
                        >
                          <span className="truncate">{tag}</span>
                          <span className="flex items-center gap-2 text-neutral-500">
                            <span className="text-[12px]">{count}</span>
                            {active ? (
                              <Check size={14} className="text-neutral-300" />
                            ) : null}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="divide-y divide-white/6">
              {visibleArticles.length === 0 ? (
                <div className="py-16">
                  <div className="rounded-2xl border border-white/[0.07] bg-white/2 p-8">
                    <div className="text-[12px] uppercase tracking-[0.2em] text-neutral-500">
                      {loading ? "Carregando" : "Sem resultados"}
                    </div>
                    <p className="mt-3 text-[14px] leading-7 text-neutral-400">
                      {loading
                        ? "Buscando artigos no DeFi Institute…"
                        : "Nenhum artigo encontrado com esse filtro."}
                    </p>
                  </div>
                </div>
              ) : (
                visibleArticles.map((article) => (
                  <article key={article.id} className="py-9">
                    <div className="flex items-start justify-between gap-8">
                      <div className="min-w-0">
                        <Link href={`/articles/${article.id}`} className="block">
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
                            <span className="rounded-full border border-white/10 bg-white/4 px-2 py-0.5 text-[11px] text-neutral-200">
                              {article.tag}
                            </span>
                          </div>

                          <div className="ml-auto flex items-center gap-4 text-neutral-500">
                            <div className="flex items-center gap-1">
                              <Eye size={16} />
                              {article.views}
                            </div>
                            <button
                              type="button"
                              className="rounded-md p-1 hover:bg-white/8 transition-colors"
                              aria-label="Mais ações"
                            >
                              <Share size={16} />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="relative hidden h-24 w-40 shrink-0 overflow-hidden sm:block">
                        <Image
                          src={article.image}
                          alt={article.title}
                          fill
                          sizes="160px"
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/10" />
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <div className="rounded-2xl border border-white/[0.07] bg-white/2 p-6">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                  <PenLine size={14} className="text-neutral-600" />
                  Contribua
                </div>
                <h3 className="mt-3 text-[18px] font-semibold leading-[1.25] tracking-tight text-white">
                  Venha escrever para o DeFi Institute
                </h3>
                <p className="mt-2 text-[13px] leading-6 text-neutral-400">
                  Publique guias, análises e frameworks práticos. A gente ajuda com
                  edição, padrão visual e distribuição.
                </p>
                <ul className="mt-4 space-y-2 text-[13px] text-neutral-400">
                  <li className="flex gap-2">
                    <span className="mt-2 size-1.5 rounded-full bg-white/25" />
                    <span>Temas: mecânicas, risco, segurança, estratégia</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-2 size-1.5 rounded-full bg-white/25" />
                    <span>Formato: direto ao ponto, com exemplos</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-2 size-1.5 rounded-full bg-white/25" />
                    <span>Crédito e autoria preservados</span>
                  </li>
                </ul>

                <Link
                  href="/login"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-black hover:bg-neutral-100 transition-colors"
                >
                  Quero escrever <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
