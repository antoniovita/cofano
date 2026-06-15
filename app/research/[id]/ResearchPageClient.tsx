"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

import { ShareButton } from "@/components/ShareButton";
import { cn } from "@/lib/utils";

import { MOCK_ARTICLES, type MockArticle } from "./mockArticles";

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
  publication: string;
  date: string;
  readTime: string;
  tag: string;
  cover: string;
  markdown: string;
};

function formatDateShort(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

function computeReadMinutes(article: Pick<ApiArticle, "readingTimeMinutes" | "wordCount">) {
  if (article.readingTimeMinutes && article.readingTimeMinutes > 0) return article.readingTimeMinutes;
  return Math.max(1, Math.round((article.wordCount || 0) / 200));
}

function parseInline(text: string, keyPrefix: string) {
  const parts: Array<string | { type: "link" | "code" | "strong" | "em"; text: string; href?: string }> = [];
  let rest = text;

  while (rest.length > 0) {
    const link = rest.match(/\[([^\]]+)\]\(([^)]+)\)/);
    const code = rest.match(/`([^`]+)`/);
    const strong = rest.match(/\*\*([^*]+)\*\*/);
    const em = rest.match(/\*([^*]+)\*/);

    const candidates = [link, code, strong, em].filter(Boolean) as RegExpMatchArray[];
    if (candidates.length === 0) {
      parts.push(rest);
      break;
    }

    candidates.sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
    const next = candidates[0];
    const idx = next.index ?? 0;

    if (idx > 0) parts.push(rest.slice(0, idx));

    if (next === link) {
      parts.push({ type: "link", text: next[1], href: next[2] });
    } else if (next === code) {
      parts.push({ type: "code", text: next[1] });
    } else if (next === strong) {
      parts.push({ type: "strong", text: next[1] });
    } else {
      parts.push({ type: "em", text: next[1] });
    }

    rest = rest.slice(idx + next[0].length);
  }

  return parts.map((p, idx) => {
    if (typeof p === "string") return <span key={`${keyPrefix}-t-${idx}`}>{p}</span>;
    if (p.type === "link") {
      const href = p.href || "#";
      const external = /^https?:\/\//.test(href);
      return (
        <a
          key={`${keyPrefix}-l-${idx}`}
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noreferrer" : undefined}
          className="underline decoration-white/20 underline-offset-4 hover:decoration-white/50"
        >
          {p.text}
        </a>
      );
    }
    if (p.type === "code") {
      return (
        <code
          key={`${keyPrefix}-c-${idx}`}
          className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[0.9em] text-white/90"
        >
          {p.text}
        </code>
      );
    }
    if (p.type === "strong") {
      return (
        <strong key={`${keyPrefix}-s-${idx}`} className="font-semibold text-white">
          {p.text}
        </strong>
      );
    }
    return (
      <em key={`${keyPrefix}-e-${idx}`} className="italic text-white/90">
        {p.text}
      </em>
    );
  });
}

function renderMarkdown(markdown: string) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const nodes: ReactNode[] = [];
  let i = 0;
  let key = 0;

  let inCode = false;
  let codeLines: string[] = [];

  const flushCode = () => {
    const code = codeLines.join("\n");
    nodes.push(
      <pre
        key={`pre-${key++}`}
        className="my-6 overflow-x-auto rounded-2xl border border-white/10 bg-white/5 p-4"
      >
        <code className="block whitespace-pre text-[13px] leading-6 text-white/90">
          {code}
        </code>
      </pre>
    );
    inCode = false;
    codeLines = [];
  };

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("```")) {
      if (inCode) { flushCode(); } else { inCode = true; }
      i += 1;
      continue;
    }

    if (inCode) { codeLines.push(line); i += 1; continue; }

    if (/^\s*$/.test(line)) { i += 1; continue; }

    if (/^---\s*$/.test(line)) {
      nodes.push(<hr key={`hr-${key++}`} className="my-10 border-white/10" />);
      i += 1;
      continue;
    }

    const headingMatch = line.match(/^(#{1,3})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      const Tag = level === 1 ? "h1" : level === 2 ? "h2" : "h3";
      const cls =
        level === 1
          ? "mt-10 text-2xl font-semibold tracking-tight text-white"
          : level === 2
            ? "mt-10 text-[18px] font-semibold tracking-tight text-white"
            : "mt-8 text-[16px] font-semibold tracking-tight text-white";
      nodes.push(
        <Tag key={`h-${key++}`} className={cls}>
          {parseInline(text, `h-${key}`)}
        </Tag>
      );
      i += 1;
      continue;
    }

    if (line.startsWith("> ")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        quoteLines.push(lines[i].slice(2));
        i += 1;
      }
      nodes.push(
        <blockquote
          key={`q-${key++}`}
          className="my-6 border-l-2 border-white/15 pl-4 text-[15px] leading-7 text-neutral-300"
        >
          {quoteLines.join("\n").split("\n").map((qLine, qIdx) => (
            <p key={`q-${key}-${qIdx}`} className={qIdx === 0 ? "" : "mt-3"}>
              {parseInline(qLine, `q-${key}-${qIdx}`)}
            </p>
          ))}
        </blockquote>
      );
      continue;
    }

    const ulMatch = line.match(/^[-*]\s+(.*)$/);
    if (ulMatch) {
      const items: string[] = [];
      while (i < lines.length) {
        const m = lines[i].match(/^[-*]\s+(.*)$/);
        if (!m) break;
        items.push(m[1]);
        i += 1;
      }
      nodes.push(
        <ul key={`ul-${key++}`} className="my-5 ml-5 list-disc space-y-2 text-[15px] leading-7 text-neutral-200">
          {items.map((it, itIdx) => (
            <li key={`ul-${key}-${itIdx}`}>{parseInline(it, `ul-${key}-${itIdx}`)}</li>
          ))}
        </ul>
      );
      continue;
    }

    const olMatch = line.match(/^\d+\.\s+(.*)$/);
    if (olMatch) {
      const items: string[] = [];
      while (i < lines.length) {
        const m = lines[i].match(/^\d+\.\s+(.*)$/);
        if (!m) break;
        items.push(m[1]);
        i += 1;
      }
      nodes.push(
        <ol key={`ol-${key++}`} className="my-5 ml-5 list-decimal space-y-2 text-[15px] leading-7 text-neutral-200">
          {items.map((it, itIdx) => (
            <li key={`ol-${key}-${itIdx}`}>{parseInline(it, `ol-${key}-${itIdx}`)}</li>
          ))}
        </ol>
      );
      continue;
    }

    const paraLines: string[] = [];
    while (i < lines.length) {
      const l = lines[i];
      if (
        /^\s*$/.test(l) || l.startsWith("```") || l.startsWith("> ") ||
        /^---\s*$/.test(l) || /^(#{1,3})\s+/.test(l) ||
        /^[-*]\s+/.test(l) || /^\d+\.\s+/.test(l)
      ) break;
      paraLines.push(l);
      i += 1;
    }
    nodes.push(
      <p key={`p-${key++}`} className="my-4 text-[15px] leading-7 text-neutral-200">
        {parseInline(paraLines.join(" ").trim(), `p-${key}`)}
      </p>
    );
  }

  if (inCode) flushCode();
  return nodes;
}

function toViewArticleFromApi(article: ApiArticle): ViewArticle {
  return {
    id: article.id,
    title: article.title,
    author: article.author?.username || "Equipe Editorial",
    publication: "Cofano Research",
    date: formatDateShort(article.createdAt),
    readTime: `${computeReadMinutes(article)} min`,
    tag: article.tag,
    cover: article.cover,
    markdown: article.content,
  };
}

function toViewArticleFromMock(article: MockArticle): ViewArticle {
  return {
    id: article.id,
    title: article.title,
    author: article.author,
    publication: article.publication,
    date: article.date,
    readTime: article.readTime,
    tag: article.tag,
    cover: article.cover,
    markdown: article.markdown,
  };
}

export default function ResearchPageClient({ id }: { id: string }) {
  const [apiArticle, setApiArticle] = useState<ApiArticle | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "notfound">("loading");

  const fallback = useMemo(() => MOCK_ARTICLES[id] ?? null, [id]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setStatus("loading");
      setApiArticle(null);
    });

    fetch(`/api/articles?id=${encodeURIComponent(id)}`, { signal: controller.signal })
      .then(async (res) => {
        if (res.status === 404) return null;
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return (await res.json()) as ApiArticle;
      })
      .then((data) => {
        if (!data) { setStatus("notfound"); return; }
        setApiArticle(data);
        setStatus("ready");
        fetch(`/api/articles?id=${encodeURIComponent(id)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ incrementViews: true }),
        }).catch(() => {});
      })
      .catch((err) => {
        if ((err as { name?: string }).name === "AbortError") return;
        setStatus("notfound");
      });

    return () => { active = false; controller.abort(); };
  }, [id]);

  const viewArticle = useMemo<ViewArticle | null>(() => {
    if (apiArticle) return toViewArticleFromApi(apiArticle);
    if (status === "notfound" && fallback) return toViewArticleFromMock(fallback);
    if (status === "ready" && fallback && !apiArticle) return toViewArticleFromMock(fallback);
    return null;
  }, [apiArticle, fallback, status]);

  const markdownNodes = useMemo(() => {
    if (!viewArticle) return null;
    return renderMarkdown(viewArticle.markdown);
  }, [viewArticle]);

  if (!viewArticle) {
    return (
      <main className="flex-1 bg-[#0f0f0f] text-white">
        <section className="mx-auto max-w-5xl px-6 py-10">
          <Link href="/research" className="text-[14px] text-neutral-400 hover:text-neutral-200 transition-colors">
            ← Back to research
          </Link>
          {status === "loading" ? (
            <div className="mt-8 animate-pulse space-y-4">
              <div className="h-44 w-full rounded-xl bg-white/6 sm:h-56" />
              <div className="mt-7 space-y-3">
                <div className="h-3 w-20 rounded-full bg-white/6" />
                <div className="h-10 w-3/4 rounded-lg bg-white/6" />
                <div className="h-8 w-1/2 rounded-lg bg-white/6" />
              </div>
              <div className="mt-10 space-y-3">
                {[0,1,2,3,4].map((i) => (
                  <div key={i} className="h-4 rounded-full bg-white/4" style={{ width: `${90 - i * 8}%` }} />
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-10 rounded-2xl border border-white/[0.07] bg-white/2 p-8">
              <div className="text-[12px] uppercase tracking-[0.2em] text-neutral-500">Não encontrado</div>
              <p className="mt-3 text-[14px] leading-7 text-neutral-400">Esse artigo não existe ou foi removido.</p>
            </div>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-[#0f0f0f] text-white">
      <section className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex items-center justify-between gap-4">
          <Link href="/research" className="text-[14px] text-neutral-400 hover:text-neutral-200 transition-colors">
            ← Back to research
          </Link>
          <ShareButton
            title={viewArticle.title}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-3 py-1.5 text-[12px] text-neutral-300 hover:bg-white/8 transition-colors"
          />
        </div>

        <div className="mt-8">
          <div className="relative h-44 w-full overflow-hidden sm:h-56">
            <Image src={viewArticle.cover} alt={viewArticle.title} fill priority sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
            <div className="absolute inset-0 bg-black/30" />
          </div>

          <div className="mt-7">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[12px] text-neutral-500">
              <span className="rounded-full border border-white/10 bg-white/4 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.16em] text-neutral-300">
                {viewArticle.tag}
              </span>
              <span>
                <span className="text-neutral-200">{viewArticle.author}</span>{" "}
                <span className="text-neutral-600">in</span>{" "}
                <span className="text-neutral-200">{viewArticle.publication}</span>
              </span>
              <span className="text-neutral-700">·</span>
              <span>{viewArticle.date}</span>
              <span className="text-neutral-700">·</span>
              <span>{viewArticle.readTime} read</span>
            </div>
            <h1 className="mt-4 text-[2.1rem] font-semibold leading-[1.12] tracking-tight text-white sm:text-[2.6rem]">
              {viewArticle.title}
            </h1>
          </div>
        </div>

        <article className={cn("mt-10", status !== "ready" && "opacity-95")}>
          <div className="text-neutral-200">{markdownNodes}</div>
        </article>
      </section>
    </main>
  );
}
