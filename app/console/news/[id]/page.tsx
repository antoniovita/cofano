"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminGuard } from "@/lib/useAdminGuard";

type FormState = {
  title: string;
  tag: string;
  cover: string;
  content: string;
  published: boolean;
};

const EMPTY: FormState = { title: "", tag: "", cover: "", content: "", published: false };

const TAGS = ["Market", "Protocols", "Security", "Ecosystem", "Regulation", "Research"];

export default function NewsEditorPage() {
  const guard = useAdminGuard();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const isNew = params.id === "new";

  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (isNew) return;
    fetch(`/api/news?id=${encodeURIComponent(params.id)}&locale=pt`, { credentials: "include" })
      .then(async (r) => {
        if (!r.ok) return;
        const d = await r.json() as FormState & { id: string };
        setForm({ title: d.title, tag: d.tag, cover: d.cover, content: d.content, published: d.published });
      })
      .finally(() => setLoading(false));
  }, [isNew, params.id]);

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const save = async () => {
    setError(null);
    if (!form.title.trim()) { setError("Title is required"); return; }
    if (!form.content.trim()) { setError("Content is required"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/news", {
        method: isNew ? "POST" : "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isNew ? { ...form, locale: "pt" } : { id: params.id, ...form, locale: "pt" }),
      });
      if (!res.ok) { const e = await res.json() as { error?: string }; setError(e.error ?? "Error saving"); return; }
      router.push("/console/news");
    } finally {
      setSaving(false);
    }
  };

  if (guard === "checking" || loading) {
    return (
      <main className="flex-1 bg-[#0f0f0f] text-white">
        <div className="mx-auto max-w-5xl px-6 pt-10">
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-48 rounded-full bg-white/6" />
            <div className="h-10 w-full rounded-xl bg-white/4" />
          </div>
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
              <Link href="/console/news" className="hover:text-white transition-colors">News</Link>
              <span>/</span>
              <span className="text-neutral-300">{isNew ? "New" : "Edit"}</span>
            </div>
            <h1 className="mt-1 text-[24px] font-semibold tracking-tight">{isNew ? "New news item" : "Edit news item"}</h1>
          </div>
          <div className="flex items-center gap-2">
            {!isNew && (
              <Link
                href={`/news/${params.id}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/2 px-3 py-1.5 text-[12px] text-neutral-400 transition-colors hover:text-white"
              >
                <Eye size={12} /> Preview
              </Link>
            )}
            <button
              type="button"
              onClick={() => setPreview((v) => !v)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[12px] transition-colors",
                preview ? "border-white/20 bg-white/8 text-white" : "border-white/[0.07] bg-white/2 text-neutral-400 hover:text-white"
              )}
            >
              {preview ? "Edit" : "Markdown preview"}
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-[13px] font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-[13px] text-red-300">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-[11px] uppercase tracking-[0.15em] text-neutral-500">Title</label>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="News title…"
              className="w-full rounded-xl border border-white/[0.07] bg-white/2 px-4 py-3 text-[15px] text-white placeholder:text-neutral-700 outline-none focus:border-white/20 focus:bg-white/4 transition-colors"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[11px] uppercase tracking-[0.15em] text-neutral-500">Tag</label>
              <div className="flex flex-wrap gap-1.5">
                {TAGS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => set("tag", t)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-[12px] transition-colors",
                      form.tag === t
                        ? "border-white/20 bg-white/10 text-white"
                        : "border-white/[0.07] bg-white/2 text-neutral-500 hover:text-white"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] uppercase tracking-[0.15em] text-neutral-500">Cover URL</label>
              <input
                value={form.cover}
                onChange={(e) => set("cover", e.target.value)}
                placeholder="https://images.unsplash.com/…"
                className="w-full rounded-xl border border-white/[0.07] bg-white/2 px-4 py-3 text-[13px] text-white placeholder:text-neutral-700 outline-none focus:border-white/20 focus:bg-white/4 transition-colors"
              />
              {form.cover && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.cover} alt="" className="mt-2 h-20 w-full rounded-lg object-cover opacity-60" />
              )}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] uppercase tracking-[0.15em] text-neutral-500">Content (Markdown)</label>
            {preview ? (
              <div className="min-h-[320px] w-full rounded-xl border border-white/[0.07] bg-white/2 p-5 font-mono text-[12px] leading-6 text-neutral-300 whitespace-pre-wrap">
                {form.content || <span className="text-neutral-700">Nothing to preview.</span>}
              </div>
            ) : (
              <textarea
                value={form.content}
                onChange={(e) => set("content", e.target.value)}
                placeholder="Write in Markdown…"
                rows={16}
                className="w-full rounded-xl border border-white/[0.07] bg-white/2 px-4 py-3 font-mono text-[13px] text-neutral-200 placeholder:text-neutral-700 outline-none focus:border-white/20 focus:bg-white/4 transition-colors resize-y"
              />
            )}
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/2 px-4 py-3">
            <button
              type="button"
              onClick={() => set("published", !form.published)}
              className={cn(
                "relative h-5 w-9 rounded-full border transition-colors",
                form.published ? "border-emerald-500/50 bg-emerald-500/20" : "border-white/10 bg-white/6"
              )}
            >
              <span className={cn(
                "absolute top-0.5 h-4 w-4 rounded-full transition-all",
                form.published ? "left-4 bg-emerald-400" : "left-0.5 bg-neutral-600"
              )} />
            </button>
            <span className="text-[13px] text-neutral-300">
              {form.published ? "Published — visible to readers" : "Draft — not publicly visible"}
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
