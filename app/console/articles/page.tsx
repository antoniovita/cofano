"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Eye, Plus, Pencil, Trash2, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { useAdminGuard } from "@/lib/useAdminGuard";

type Article = {
  id: string;
  title: string;
  tag: string;
  published: boolean;
  views: number;
  createdAt: string;
  author: { username: string };
};

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

export default function ConsoleArticlesPage() {
  const guard = useAdminGuard();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/articles?take=50&locale=pt", { credentials: "include" })
      .then(async (r) => {
        const data = await r.json() as { items?: Article[] } | Article[];
        const items = Array.isArray(data) ? data : (data as { items?: Article[] }).items ?? [];
        setArticles(items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    if (!confirm("Delete this article?")) return;
    setDeleting(id);
    await fetch(`/api/articles?id=${encodeURIComponent(id)}`, { method: "DELETE", credentials: "include" });
    setDeleting(null);
    load();
  };

  const togglePublish = async (a: Article) => {
    await fetch("/api/articles", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: a.id, published: !a.published }),
    });
    load();
  };

  if (guard === "checking") {
    return (
      <main className="flex-1 bg-[#0f0f0f] text-white">
        <div className="flex items-center justify-center pt-40">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/10 border-t-white/40" />
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-[#0f0f0f] text-white">
      <div className="mx-auto max-w-5xl px-6 pt-10 pb-20">
        <div className="flex items-center justify-between border-b border-white/6 pb-6">
          <div>
            <div className="flex items-center gap-2 text-[11px] text-neutral-500">
              <Link href="/console" className="hover:text-white transition-colors">Console</Link>
              <span>/</span>
              <span className="text-neutral-300">Articles</span>
            </div>
            <h1 className="mt-1 text-[24px] font-semibold tracking-tight">Articles</h1>
          </div>
          <Link
            href="/console/articles/new"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/4 px-4 py-2 text-[13px] text-neutral-200 transition-colors hover:bg-white/8 hover:text-white"
          >
            <Plus size={14} /> New article
          </Link>
        </div>

        {loading ? (
          <div className="mt-8 space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse h-16 rounded-xl bg-white/4" />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="mt-16 text-center text-neutral-600">No articles yet.</div>
        ) : (
          <div className="mt-6 divide-y divide-white/[0.05] rounded-2xl border border-white/[0.07] overflow-hidden">
            {articles.map((a) => (
              <div key={a.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/2 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "h-1.5 w-1.5 rounded-full shrink-0",
                      a.published ? "bg-emerald-400" : "bg-neutral-600"
                    )} />
                    <span className="truncate text-[14px] font-medium text-white">{a.title}</span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-[11px] text-neutral-600">
                    <Badge variant="tag">{a.tag}</Badge>
                    <span>@{a.author.username}</span>
                    <span className="flex items-center gap-0.5"><Eye size={9} />{fmt(a.views)}</span>
                    <span>{new Date(a.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => togglePublish(a)}
                    title={a.published ? "Unpublish" : "Publish"}
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
                      a.published ? "text-emerald-400 hover:bg-emerald-500/10" : "text-neutral-600 hover:text-white hover:bg-white/6"
                    )}
                  >
                    <Globe size={13} />
                  </button>
                  <Link
                    href={`/console/articles/${a.id}`}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-600 transition-colors hover:bg-white/6 hover:text-white"
                  >
                    <Pencil size={13} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(a.id)}
                    disabled={deleting === a.id}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-600 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
