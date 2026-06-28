"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bookmark, Check, ChevronDown, ChevronUp, Clock, Copy, Heart, Share } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

import { MOCK_ARTICLES, type MockArticle } from "./mockArticles";

// ─── Types ────────────────────────────────────────────────────────────────────

type ApiAuthor = {
  id: string;
  username: string;
  role: "ADMIN" | "USER" | "CONTRIBUTOR";
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

type ViewArticle = {
  id: string;
  title: string;
  author: string;
  date: string;
  readTime: string;
  tag: string;
  cover: string;
  markdown: string;
};

type TocEntry = { id: string; text: string; level: number };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateShort(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", year: "numeric" }).format(date);
}

function computeReadMinutes(article: Pick<ApiArticle, "readingTimeMinutes" | "wordCount">) {
  if (article.readingTimeMinutes && article.readingTimeMinutes > 0) return article.readingTimeMinutes;
  return Math.max(1, Math.round((article.wordCount || 0) / 200));
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function extractToc(markdown: string): TocEntry[] {
  return markdown
    .split("\n")
    .filter((line) => /^#{1,3}\s+/.test(line))
    .map((line) => {
      const m = line.match(/^(#{1,3})\s+(.*)$/);
      if (!m) return null;
      const text = m[2].trim();
      return { id: slugify(text), text, level: m[1].length };
    })
    .filter(Boolean) as TocEntry[];
}

function authorInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

// ─── Inline markdown ──────────────────────────────────────────────────────────

function parseInline(text: string, keyPrefix: string) {
  const parts: Array<string | { type: "link" | "code" | "strong" | "em"; text: string; href?: string }> = [];
  let rest = text;

  while (rest.length > 0) {
    const link   = rest.match(/\[([^\]]+)\]\(([^)]+)\)/);
    const code   = rest.match(/`([^`]+)`/);
    const strong = rest.match(/\*\*([^*]+)\*\*/);
    const em     = rest.match(/\*([^*]+)\*/);

    const candidates = [link, code, strong, em].filter(Boolean) as RegExpMatchArray[];
    if (candidates.length === 0) { parts.push(rest); break; }

    candidates.sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
    const next = candidates[0];
    const idx  = next.index ?? 0;

    if (idx > 0) parts.push(rest.slice(0, idx));

    if (next === link)        parts.push({ type: "link",   text: next[1], href: next[2] });
    else if (next === code)   parts.push({ type: "code",   text: next[1] });
    else if (next === strong) parts.push({ type: "strong", text: next[1] });
    else                      parts.push({ type: "em",     text: next[1] });

    rest = rest.slice(idx + next[0].length);
  }

  return parts.map((p, idx) => {
    if (typeof p === "string") return <span key={`${keyPrefix}-t-${idx}`}>{p}</span>;
    if (p.type === "link") {
      const href     = p.href || "#";
      const external = /^https?:\/\//.test(href);
      return (
        <a key={`${keyPrefix}-l-${idx}`} href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noreferrer" : undefined}
          className="underline decoration-white/20 underline-offset-4 hover:decoration-white/50"
        >{p.text}</a>
      );
    }
    if (p.type === "code")   return <code   key={`${keyPrefix}-c-${idx}`} className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[0.9em] text-white/90">{p.text}</code>;
    if (p.type === "strong") return <strong key={`${keyPrefix}-s-${idx}`} className="font-semibold text-white">{p.text}</strong>;
    return                          <em     key={`${keyPrefix}-e-${idx}`} className="italic text-white/80">{p.text}</em>;
  });
}

// ─── Code block ───────────────────────────────────────────────────────────────

function CodeBlock({ code, nodeKey }: { code: string; nodeKey: string }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); }).catch(() => {});
  }, [code]);

  return (
    <div key={nodeKey} className="group relative my-6">
      <pre className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5 p-4">
        <code className="block whitespace-pre text-[13px] leading-6 text-white/90">{code}</code>
      </pre>
      <button type="button" onClick={copy}
        className="absolute right-3 top-3 flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-neutral-400 opacity-0 transition-all hover:bg-white/10 hover:text-white group-hover:opacity-100"
        aria-label="Copy code"
      >
        {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

// ─── Markdown renderer ────────────────────────────────────────────────────────

function renderMarkdown(markdown: string) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const nodes: ReactNode[] = [];
  let i = 0, key = 0;
  let inCode = false, codeLines: string[] = [];

  const flushCode = () => {
    nodes.push(<CodeBlock key={`pre-${key++}`} nodeKey={`pre-${key}`} code={codeLines.join("\n")} />);
    inCode = false; codeLines = [];
  };

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("```")) {
      if (inCode) flushCode(); else inCode = true;
      i++; continue;
    }
    if (inCode) { codeLines.push(line); i++; continue; }
    if (/^\s*$/.test(line)) { i++; continue; }

    if (/^---\s*$/.test(line)) {
      nodes.push(<hr key={`hr-${key++}`} className="my-10 border-white/8" />);
      i++; continue;
    }

    const hm = line.match(/^(#{1,3})\s+(.*)$/);
    if (hm) {
      const level = hm[1].length;
      const text  = hm[2];
      const id    = slugify(text);
      const Tag   = level === 1 ? "h1" : level === 2 ? "h2" : "h3";
      const cls   = level === 1
        ? "mt-10 mb-1 text-[1.5rem] font-semibold leading-snug tracking-tight text-white scroll-mt-24"
        : level === 2
          ? "mt-10 mb-1 text-[1.2rem] font-semibold tracking-tight text-white scroll-mt-24"
          : "mt-7 mb-1 text-[1rem] font-semibold tracking-tight text-neutral-200 scroll-mt-24";
      nodes.push(<Tag key={`h-${key++}`} id={id} className={cls}>{parseInline(text, `h-${key}`)}</Tag>);
      i++; continue;
    }

    if (line.startsWith("> ")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) { quoteLines.push(lines[i].slice(2)); i++; }
      nodes.push(
        <blockquote key={`q-${key++}`} className="my-7 border-l-[3px] border-white/20 pl-5 text-[16px] italic leading-[1.7] text-neutral-300">
          {quoteLines.join("\n").split("\n").map((ql, qi) => (
            <p key={`q-${key}-${qi}`} className={qi === 0 ? "" : "mt-3"}>{parseInline(ql, `q-${key}-${qi}`)}</p>
          ))}
        </blockquote>
      );
      continue;
    }

    const ulm = line.match(/^[-*]\s+(.*)$/);
    if (ulm) {
      const items: string[] = [];
      while (i < lines.length) { const m = lines[i].match(/^[-*]\s+(.*)$/); if (!m) break; items.push(m[1]); i++; }
      nodes.push(
        <ul key={`ul-${key++}`} className="my-5 space-y-2 pl-5 text-[16px] leading-[1.75] text-neutral-300">
          {items.map((it, ii) => <li key={`ul-${key}-${ii}`} className="list-disc">{parseInline(it, `ul-${key}-${ii}`)}</li>)}
        </ul>
      );
      continue;
    }

    const olm = line.match(/^\d+\.\s+(.*)$/);
    if (olm) {
      const items: string[] = [];
      while (i < lines.length) { const m = lines[i].match(/^\d+\.\s+(.*)$/); if (!m) break; items.push(m[1]); i++; }
      nodes.push(
        <ol key={`ol-${key++}`} className="my-5 space-y-2 pl-5 text-[16px] leading-[1.75] text-neutral-300">
          {items.map((it, ii) => <li key={`ol-${key}-${ii}`} className="list-decimal">{parseInline(it, `ol-${key}-${ii}`)}</li>)}
        </ol>
      );
      continue;
    }

    const paraLines: string[] = [];
    while (i < lines.length) {
      const l = lines[i];
      if (/^\s*$/.test(l) || l.startsWith("```") || l.startsWith("> ") || /^---\s*$/.test(l) || /^(#{1,3})\s+/.test(l) || /^[-*]\s+/.test(l) || /^\d+\.\s+/.test(l)) break;
      paraLines.push(l); i++;
    }
    nodes.push(
      <p key={`p-${key++}`} className="my-5 text-[16px] leading-[1.75] text-neutral-300">
        {parseInline(paraLines.join(" ").trim(), `p-${key}`)}
      </p>
    );
  }

  if (inCode) flushCode();
  return nodes;
}

// ─── Data transforms ──────────────────────────────────────────────────────────

function toViewArticleFromApi(a: ApiArticle): ViewArticle {
  return {
    id: a.id, title: a.title,
    author: a.author?.username || "Cofano Research",
    date: formatDateShort(a.createdAt),
    readTime: `${computeReadMinutes(a)} min`,
    tag: a.tag, cover: a.cover, markdown: a.content,
  };
}

function toViewArticleFromMock(a: MockArticle): ViewArticle {
  return { id: a.id, title: a.title, author: a.author, date: a.date, readTime: a.readTime, tag: a.tag, cover: a.cover, markdown: a.markdown };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const total = el.scrollHeight - el.clientHeight;
      setProgress(total > 0 ? Math.min(100, ((el.scrollTop || document.body.scrollTop) / total) * 100) : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="fixed left-0 top-0 z-60 h-0.5 w-full bg-transparent">
      <div className="h-full bg-white/30 transition-[width] duration-75" style={{ width: `${progress}%` }} />
    </div>
  );
}


function LikeButton({ articleId }: { articleId: string }) {
  const [liked, setLiked] = useState(false);
  const toggle = () => {
    setLiked((v) => !v);
    fetch(`/api/articles/${articleId}/like`, { method: liked ? "DELETE" : "POST", credentials: "include" }).catch(() => {});
  };
  return (
    <button type="button" onClick={toggle}
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] transition-all",
        liked ? "border-red-500/30 bg-red-500/10 text-red-400" : "border-white/10 bg-white/4 text-neutral-400 hover:bg-white/8 hover:text-white"
      )}
    >
      <Heart size={13} className={liked ? "fill-red-400" : ""} />
      {liked ? "Liked" : "Like"}
    </button>
  );
}

function SaveBtn({ articleId }: { articleId: string }) {
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await fetch(`/api/articles/saved?id=${encodeURIComponent(articleId)}`, {
        method: saved ? "DELETE" : "POST",
        credentials: "include",
      });
      setSaved((v) => !v);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] transition-all disabled:opacity-50",
        saved
          ? "border-white/20 bg-white/8 text-white"
          : "border-white/10 bg-white/4 text-neutral-400 hover:bg-white/8 hover:text-white"
      )}
    >
      <Bookmark size={13} className={saved ? "fill-white" : ""} />
      {saved ? "Saved" : "Save"}
    </button>
  );
}

function ShareBtn({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const onShare = useCallback(async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    try { if (navigator.share) { await navigator.share({ title, url }); return; } } catch { /* dismissed */ }
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1200); } catch { /* no clipboard */ }
  }, [title]);
  return (
    <button type="button" onClick={onShare}
      className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/4 px-3 py-1.5 text-[12px] text-neutral-400 transition-all hover:bg-white/8 hover:text-white"
    >
      {copied ? <Check size={13} className="text-emerald-400" /> : <Share size={13} />}
      {copied ? "Copied" : "Share"}
    </button>
  );
}

function RelatedArticles({ currentId, tag }: { currentId: string; tag: string }) {
  const related = useMemo(() => Object.values(MOCK_ARTICLES).filter((a) => a.id !== currentId && a.tag === tag).slice(0, 3), [currentId, tag]);
  const fallback = useMemo(() => Object.values(MOCK_ARTICLES).filter((a) => a.id !== currentId).slice(0, 3), [currentId]);
  const items = related.length > 0 ? related : fallback;
  if (items.length === 0) return null;
  return (
    <section className="mt-14 border-t border-white/6 pt-10">
      <div className="mb-6 text-[11px] uppercase tracking-[0.2em] text-neutral-600">More to read</div>
      <div className="space-y-4">
        {items.map((a) => {
          const excerpt = a.markdown.replace(/^#.*$/m, "").replace(/[#*>`\-[\]()]/g, "").trim().slice(0, 140) + "…";
          return (
            <Link
              key={a.id}
              href={`/research/${a.id}`}
              className="group flex gap-4 rounded-2xl border border-white/6 bg-white/2 p-4 transition-all hover:border-white/12 hover:bg-white/4"
            >
              <div className="relative h-24 w-36 shrink-0 overflow-hidden rounded-xl sm:h-28 sm:w-44">
                <Image src={a.cover} alt={a.title} fill sizes="176px" className="object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                <div>
                  <div className="flex items-center gap-2 text-[11px] text-neutral-600">
                    <Badge variant="tag">{a.tag}</Badge>
                    <span className="text-neutral-700">·</span>
                    <span>{a.date}</span>
                  </div>
                  <h3 className="mt-2 text-[15px] font-semibold leading-snug tracking-tight text-white line-clamp-2 group-hover:text-neutral-100">
                    {a.title}
                  </h3>
                  <p className="mt-1.5 text-[13px] leading-[1.55] text-neutral-500 line-clamp-2 hidden sm:block">
                    {excerpt}
                  </p>
                </div>
                <div className="mt-2 flex items-center gap-1 text-[11px] text-neutral-600">
                  <Clock size={11} />{a.readTime} read
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function ArticleSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-52 w-full rounded-xl bg-white/6" />
      <div className="mt-7 space-y-3">
        <div className="h-3 w-14 rounded-full bg-white/6" />
        <div className="h-9 w-4/5 rounded-lg bg-white/6" />
        <div className="mt-3 flex items-center gap-3">
          <div className="h-7 w-7 rounded-full bg-white/6" />
          <div className="h-3 w-28 rounded-full bg-white/4" />
        </div>
      </div>
      <div className="mt-10 space-y-3">
        {[100, 92, 85, 100, 78, 96, 70, 88].map((w, i) => (
          <div key={i} className="h-4 rounded-full bg-white/4" style={{ width: `${w}%` }} />
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ResearchPageClient({ id, backHref = "/research" }: { id: string; backHref?: string }) {
  const [apiArticle, setApiArticle] = useState<ApiArticle | null>(null);
  const [status, setStatus]         = useState<"loading" | "ready" | "notfound">("loading");
  const articleRef                  = useRef<HTMLElement>(null);

  const fallback = useMemo(() => MOCK_ARTICLES[id] ?? null, [id]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    queueMicrotask(() => { if (!active) return; setStatus("loading"); setApiArticle(null); });

    fetch(`/api/articles?id=${encodeURIComponent(id)}`, { signal: controller.signal })
      .then(async (res) => { if (res.status === 404) return null; if (!res.ok) throw new Error(); return (await res.json()) as ApiArticle; })
      .then((data) => {
        if (!data) { setStatus("notfound"); return; }
        setApiArticle(data); setStatus("ready");
        fetch(`/api/articles/${encodeURIComponent(id)}/view`, { method: "POST" }).catch(() => {});
      })
      .catch((err) => { if ((err as { name?: string }).name === "AbortError") return; setStatus("notfound"); });

    return () => { active = false; controller.abort(); };
  }, [id]);

  const viewArticle = useMemo<ViewArticle | null>(() => {
    if (apiArticle) return toViewArticleFromApi(apiArticle);
    if (status === "notfound" && fallback) return toViewArticleFromMock(fallback);
    if (status === "ready" && fallback && !apiArticle) return toViewArticleFromMock(fallback);
    return null;
  }, [apiArticle, fallback, status]);

  useEffect(() => {
    if (!viewArticle) return;
    try {
      const existing = JSON.parse(localStorage.getItem("last_read_article") ?? "null") as { id: string; progress: number } | null;
      const progress = existing?.id === viewArticle.id ? (existing.progress ?? 0) : 0;
      localStorage.setItem("last_read_article", JSON.stringify({ id: viewArticle.id, title: viewArticle.title, progress }));
    } catch {}

    const onScroll = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      if (total <= 0) return;
      const progress = Math.round((scrolled / total) * 100);
      try {
        localStorage.setItem("last_read_article", JSON.stringify({ id: viewArticle.id, title: viewArticle.title, progress }));
      } catch {}
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [viewArticle]);

  const toc            = useMemo(() => viewArticle ? extractToc(viewArticle.markdown) : [], [viewArticle]);
  const markdownNodes  = useMemo(() => viewArticle ? renderMarkdown(viewArticle.markdown) : null, [viewArticle]);

  if (!viewArticle) {
    return (
      <main className="flex-1 bg-[#0f0f0f] text-white">
        <ReadingProgressBar />
        <div className="mx-auto max-w-2xl px-6 py-10">
          <Link href={backHref} className="text-[13px] text-neutral-500 hover:text-neutral-200 transition-colors">← Research</Link>
          {status === "loading" ? <div className="mt-8"><ArticleSkeleton /></div> : (
            <div className="mt-10 rounded-2xl border border-white/8 bg-white/2 p-8">
              <p className="text-[12px] uppercase tracking-[0.2em] text-neutral-500">Not found</p>
              <p className="mt-3 text-[14px] leading-7 text-neutral-400">This article doesn&apos;t exist or was removed.</p>
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-[#0f0f0f] text-white">
      <ReadingProgressBar />

      {/* Cover — wide, reduced height */}
      <div className="relative h-52 w-full overflow-hidden sm:h-64">
        <Image src={viewArticle.cover} alt={viewArticle.title} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Envelope */}
      {/* Notion-style layout: centered column + ToC peeking on the right */}
      <div className="relative mx-auto max-w-3xl px-6 py-10">

        {/* ToC — hidden sidebar à la Notion, visible on lg+ */}
        {toc.length >= 2 && (
          <aside className="absolute left-full top-[260px] hidden xl:block">
            <div className="group ml-10 w-48">
              {/* Always-visible thin indicator */}
              <div className="mb-3 text-[10px] uppercase tracking-[0.2em] text-neutral-700 transition-colors group-hover:text-neutral-500">
                On this page
              </div>
              <ul className="space-y-1.5">
                {toc.map((e) => (
                  <li key={e.id}>
                    <a
                      href={`#${e.id}`}
                      className={cn(
                        "block truncate text-[12px] leading-5 text-neutral-800 transition-colors hover:text-neutral-300 group-hover:text-neutral-600",
                        e.level === 2 ? "pl-3" : e.level === 3 ? "pl-6" : ""
                      )}
                    >
                      {e.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        )}

        {/* Nav */}
        <div className="flex items-center justify-between gap-4">
          <Link href={backHref} className="text-[13px] text-neutral-500 hover:text-neutral-200 transition-colors">← Research</Link>
          <ShareBtn title={viewArticle.title} />
        </div>

        {/* Tag */}
        <div className="mt-6">
          <Badge variant="tag">{viewArticle.tag}</Badge>
        </div>

        {/* Title */}
        <h1 className="mt-3 text-[2rem] font-semibold leading-[1.12] tracking-tight text-white sm:text-[2.4rem]">
          {viewArticle.title}
        </h1>

        {/* Author row */}
        <div className="mt-5 flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/8 font-mono text-[11px] font-semibold text-neutral-300">
            {authorInitials(viewArticle.author)}
          </div>
          <div className="text-[13px] text-neutral-400">
            <span className="text-neutral-200">{viewArticle.author}</span>
            <span className="mx-2 text-neutral-700">·</span>
            <span>{viewArticle.date}</span>
            <span className="mx-2 text-neutral-700">·</span>
            <span className="inline-flex items-center gap-1">
              <Clock size={11} />{viewArticle.readTime} read
            </span>
          </div>
        </div>

        <div className="mt-8 border-t border-white/6" />

        {/* Body */}
        <article ref={articleRef}>
          {markdownNodes}
        </article>

        {/* Engagement */}
        <div className="mt-5 flex items-center gap-3 pt-6">
          <LikeButton articleId={viewArticle.id} />
          <SaveBtn articleId={viewArticle.id} />
          <ShareBtn title={viewArticle.title} />
        </div>

        {/* Related */}
        <RelatedArticles currentId={viewArticle.id} tag={viewArticle.tag} />

      </div>
    </main>
  );
}
