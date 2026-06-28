"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, SlidersHorizontal } from "lucide-react";
import { motion } from "motion/react";

import { Badge } from "@/components/ui/Badge";
import { Dropdown, DropdownItem, DropdownLabel } from "@/components/ui/Dropdown";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;

const MOCK_NEWS: NewsCard[] = [
  {
    id: "n-1",
    source: "Market",
    title: "Stablecoin flows rise as traders de-risk ahead of volatility",
    date: "Apr 12, 2026",
    views: "2.1K",
    cover: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=900&q=80",
  },
  {
    id: "n-2",
    source: "Protocols",
    title: "Lending rates compress while onchain leverage rotates to perps",
    date: "Apr 10, 2026",
    views: "1.8K",
    cover: "https://images.unsplash.com/photo-1559526324-593bc073d938?w=900&q=80",
  },
  {
    id: "n-3",
    source: "Security",
    title: "Checklist: what to verify before approving a new contract",
    date: "Apr 8, 2026",
    views: "3.5K",
    cover: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=900&q=80",
  },
  {
    id: "n-4",
    source: "Ecosystem",
    title: "DEX liquidity migrates to new incentives — what it changes for LPs",
    date: "Apr 5, 2026",
    views: "1.2K",
    cover: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=900&q=80",
  },
];

type ApiNews = {
  id: string;
  title: string;
  tag: string;
  cover: string;
  views: number;
  createdAt: string;
};

type NewsCard = {
  id: string;
  source: string;
  title: string;
  date: string;
  views: string;
  cover: string;
};

function formatDateShort(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", year: "numeric" }).format(date);
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact", compactDisplay: "short", maximumFractionDigits: 1 }).format(value);
}

function toCard(n: ApiNews): NewsCard {
  return {
    id: n.id,
    source: n.tag,
    title: n.title,
    date: formatDateShort(n.createdAt),
    views: formatCompactNumber(n.views),
    cover: n.cover,
  };
}

export default function NewsPage() {
  const [items, setItems] = useState<NewsCard[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [activeTag, setActiveTag] = useState("All");
  const [useApi, setUseApi] = useState(false);

  const fetchPage = useCallback(async (pageIndex: number, tag: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        published: "true",
        order: "createdAt",
        direction: "desc",
        take: String(PAGE_SIZE),
        skip: String(pageIndex * PAGE_SIZE),
      });
      if (tag !== "All") params.set("tag", tag);

      const res = await fetch(`/api/news?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { items: ApiNews[]; total: number };

      const cards = data.items.map(toCard);
      setTotal(data.total);
      setUseApi(true);

      if (pageIndex === 0) {
        setItems(cards);
      } else {
        setItems((prev) => [...prev, ...cards]);
      }
    } catch {
      if (pageIndex === 0) setItems(MOCK_NEWS);
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    setPage(0);
    void fetchPage(0, activeTag);
  }, [activeTag, fetchPage]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    void fetchPage(next, activeTag);
  };

  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const n of items) counts.set(n.source, (counts.get(n.source) || 0) + 1);
    return Array.from(counts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }, [items]);

  const visibleItems = useMemo(
    () => (activeTag === "All" || useApi ? items : items.filter((n) => n.source === activeTag)),
    [items, activeTag, useApi]
  );

  const hasMore = useApi ? items.length < total : false;
  const featuredItem = visibleItems[0] ?? null;
  const listItems = visibleItems.slice(1);

  return (
    <main className="flex-1 bg-[#0f0f0f] text-white">
      <section className="mx-auto max-w-6xl px-6 pt-14 pb-14">
        <div className="mb-6 text-[11px] uppercase tracking-[0.2em] text-neutral-500">
          News
        </div>

        {/* Featured hero */}
        {featuredItem && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <Link
              href={`/news/${featuredItem.id}`}
              className="group relative mb-10 flex h-65 w-full overflow-hidden rounded-2xl sm:h-75"
            >
              <Image
                src={featuredItem.cover}
                alt={featuredItem.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 900px"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-black/10" />
              <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-10">
                <Badge variant="tag">{featuredItem.source}</Badge>
                <h2 className="mt-3 max-w-2xl text-[1.75rem] font-semibold leading-[1.1] tracking-tight text-white sm:text-[2.2rem]">
                  {featuredItem.title}
                </h2>
                <div className="mt-4 flex items-center gap-4 text-[12px] text-white/50">
                  <span>{featuredItem.date}</span>
                  <span className="text-white/20">·</span>
                  <span className="flex items-center gap-1"><Eye size={12} />{featuredItem.views}</span>
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        <div className="flex items-center justify-between border-b border-white/6 pb-3 mb-6">
          <span className="text-[13px] text-neutral-500">
            {loaded && useApi ? `${total} item${total !== 1 ? "s" : ""}` : ""}
          </span>

          <Dropdown
            width="w-56"
            trigger={(open) => (
              <button
                type="button"
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-3 py-1.5 text-[12px] text-neutral-300 transition-colors hover:bg-white/8",
                  open && "bg-white/8"
                )}
              >
                <SlidersHorizontal size={14} className="text-neutral-400" />
                {activeTag === "All" ? "Filter" : activeTag}
              </button>
            )}
          >
            <DropdownLabel>Topics</DropdownLabel>
            {[{ tag: "All", count: items.length }, ...tagCounts].map(({ tag, count }) => (
              <DropdownItem
                key={tag}
                active={tag === activeTag}
                onClick={() => setActiveTag(tag)}
              >
                <span className="truncate">{tag}</span>
                <span className="ml-auto text-[12px] text-neutral-500">{count}</span>
              </DropdownItem>
            ))}
          </Dropdown>
        </div>

        {/* Grid */}
        {!loaded && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-white/6 bg-white/2 p-5">
                <div className="h-32 rounded-xl bg-white/6" />
                <div className="mt-4 space-y-2">
                  <div className="h-3 w-16 rounded-full bg-white/6" />
                  <div className="h-4 w-4/5 rounded-full bg-white/5" />
                  <div className="h-4 w-3/5 rounded-full bg-white/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {loaded && visibleItems.length === 0 && (
          <div className="rounded-2xl border border-white/[0.07] bg-white/2 p-8">
            <div className="text-[12px] uppercase tracking-[0.2em] text-neutral-500">No results</div>
            <p className="mt-3 text-[14px] leading-7 text-neutral-400">No news found with this filter.</p>
          </div>
        )}

        {loaded && listItems.length > 0 && (
          <motion.div
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }}
          >
            {listItems.map((item) => (
              <motion.div
                key={item.id}
                variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] } } }}
              >
                <Link
                  href={`/news/${item.id}`}
                  className="group flex flex-col rounded-2xl border border-white/[0.07] bg-white/2 overflow-hidden transition-all hover:border-white/12 hover:bg-white/4"
                >
                  <div className="relative h-36 w-full overflow-hidden">
                    <Image
                      src={item.cover}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-black/20" />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <Badge variant="tag">{item.source}</Badge>
                    <h3 className="mt-3 text-[15px] font-semibold leading-snug tracking-tight text-white line-clamp-3 group-hover:text-neutral-100">
                      {item.title}
                    </h3>
                    <div className="mt-auto pt-4 flex items-center gap-3 text-[12px] text-neutral-600">
                      <span>{item.date}</span>
                      <span className="text-neutral-800">·</span>
                      <span className="flex items-center gap-1"><Eye size={11} />{item.views}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}

        {hasMore && (
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={loadMore}
              disabled={loading}
              className="rounded-full border border-white/10 bg-white/4 px-6 py-2.5 text-[13px] text-neutral-300 transition-colors hover:bg-white/8 hover:text-white disabled:opacity-50"
            >
              {loading ? "Loading…" : "Load more"}
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
