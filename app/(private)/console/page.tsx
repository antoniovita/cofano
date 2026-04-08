"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ExternalLink,
  Eye,
  FilePlus2,
  RefreshCw,
  Save,
  Trash2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

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
  locale: string;
  defaultLocale: string;
  createdAt: string;
  updatedAt: string;
  author: ApiAuthor;
};

type PublishedFilter = "all" | "published" | "draft";

type ArticleFormState = {
  id?: string;
  locale: string;
  title: string;
  tag: string;
  cover: string;
  published: boolean;
  content: string;
};

function jsonErrorMessage(value: unknown) {
  if (
    value &&
    typeof value === "object" &&
    "error" in value &&
    typeof (value as { error?: unknown }).error === "string"
  ) {
    return (value as { error: string }).error;
  }
  return null;
}

async function apiJson<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers || {}) },
  });

  const text = await res.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!res.ok) {
    const msg = jsonErrorMessage(data) || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data as T;
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
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
  const plain = stripMarkdown(content || "");
  if (plain.length <= maxLen) return plain;
  const cut = plain.slice(0, maxLen).replace(/\s+\S*$/, "").trim();
  return `${cut}…`;
}

function emptyForm(locale = "pt"): ArticleFormState {
  return {
    locale,
    title: "",
    tag: "",
    cover: "",
    published: false,
    content: "",
  };
}

export default function ConsolePage() {
  const [articles, setArticles] = useState<ApiArticle[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [locale, setLocale] = useState("pt");
  const [publishedFilter, setPublishedFilter] = useState<PublishedFilter>("all");
  const [query, setQuery] = useState("");
  const [tagFilter, setTagFilter] = useState<string>("all");

  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"create" | "edit">("create");
  const [form, setForm] = useState<ArticleFormState>(() => emptyForm(locale));
  const [sheetBusy, setSheetBusy] = useState<null | "saving" | "deleting" | "loading">(null);
  const [sheetError, setSheetError] = useState<string | null>(null);

  const listUrl = useMemo(() => {
    const params = new URLSearchParams({
      take: "50",
      skip: "0",
      order: "createdAt",
      direction: "desc",
      locale,
    });
    const trimmed = query.trim();
    if (trimmed) params.set("q", trimmed);

    if (publishedFilter === "published") params.set("published", "true");
    if (publishedFilter === "draft") params.set("published", "false");
    return `/api/articles?${params.toString()}`;
  }, [locale, publishedFilter, query]);

  const refreshRef = useRef<AbortController | null>(null);
  const refresh = async () => {
    refreshRef.current?.abort();
    const controller = new AbortController();
    refreshRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const data = await apiJson<ApiArticle[]>(listUrl, { signal: controller.signal });
      setArticles(Array.isArray(data) ? data : []);
    } catch (err) {
      if ((err as { name?: string }).name === "AbortError") return;
      setArticles([]);
      setError((err as Error).message || "Erro ao buscar artigos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    return () => refreshRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listUrl]);

  const tags = useMemo(() => {
    const set = new Set<string>();
    for (const a of articles || []) {
      if (a.tag) set.add(a.tag);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [articles]);

  const visibleArticles = useMemo(() => {
    const list = articles || [];
    if (tagFilter === "all") return list;
    return list.filter((a) => a.tag === tagFilter);
  }, [articles, tagFilter]);

  const openCreate = () => {
    setSheetMode("create");
    setSheetError(null);
    setForm(emptyForm(locale));
    setSheetOpen(true);
  };

  const openEdit = (article: ApiArticle) => {
    setSheetMode("edit");
    setSheetError(null);
    setForm({
      id: article.id,
      locale: article.locale || locale,
      title: article.title || "",
      tag: article.tag || "",
      cover: article.cover || "",
      published: Boolean(article.published),
      content: article.content || "",
    });
    setSheetOpen(true);
  };

  const loadArticleForLocale = async (id: string, nextLocale: string) => {
    setSheetBusy("loading");
    setSheetError(null);
    try {
      const params = new URLSearchParams({ id, locale: nextLocale });
      const data = await apiJson<ApiArticle>(`/api/articles?${params.toString()}`);
      setForm((prev) => ({
        ...prev,
        locale: nextLocale,
        title: data.title || "",
        content: data.content || "",
        tag: data.tag || prev.tag,
        cover: data.cover || prev.cover,
        published: Boolean(data.published),
      }));
    } catch (err) {
      setSheetError((err as Error).message || "Erro ao carregar artigo");
      setForm((prev) => ({ ...prev, locale: nextLocale }));
    } finally {
      setSheetBusy(null);
    }
  };

  const saveArticle = async () => {
    setSheetBusy("saving");
    setSheetError(null);
    try {
      const payload = {
        title: form.title.trim(),
        content: form.content.trim(),
        tag: form.tag.trim(),
        cover: form.cover.trim(),
        published: form.published,
        locale: form.locale,
      };

      if (sheetMode === "create") {
        const created = await apiJson<ApiArticle>("/api/articles", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setArticles((prev) => [created, ...(prev || [])]);
        setSheetOpen(false);
      } else {
        const id = form.id;
        if (!id) throw new Error("ID do artigo ausente");
        const params = new URLSearchParams({ id, locale: form.locale });
        const updated = await apiJson<ApiArticle>(`/api/articles?${params.toString()}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        setArticles((prev) => {
          const list = prev || [];
          const next = list.map((a) => (a.id === updated.id ? updated : a));
          return next;
        });
        setSheetOpen(false);
      }
    } catch (err) {
      setSheetError((err as Error).message || "Erro ao salvar artigo");
    } finally {
      setSheetBusy(null);
    }
  };

  const deleteArticle = async () => {
    if (sheetMode !== "edit" || !form.id) return;
    setSheetBusy("deleting");
    setSheetError(null);
    try {
      const params = new URLSearchParams({ id: form.id });
      await apiJson<{ ok: true }>(`/api/articles?${params.toString()}`, { method: "DELETE" });
      setArticles((prev) => (prev || []).filter((a) => a.id !== form.id));
      setSheetOpen(false);
    } catch (err) {
      setSheetError((err as Error).message || "Erro ao deletar artigo");
    } finally {
      setSheetBusy(null);
    }
  };

  return (
    <main className="flex-1 bg-[#0f0f0f] text-white">
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-6">
          <header className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Console</h1>
            <p className="text-sm leading-6 text-neutral-400">
              Área privada para administrar artigos: criar, editar, publicar e revisar.
            </p>
          </header>

          <div className="flex flex-col gap-3 rounded-2xl border border-white/6 bg-white/2 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                {([
                  { key: "all", label: "Todos" },
                  { key: "published", label: "Publicados" },
                  { key: "draft", label: "Rascunhos" },
                ] as Array<{ key: PublishedFilter; label: string }>).map((opt) => {
                  const active = opt.key === publishedFilter;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setPublishedFilter(opt.key)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-[12px] transition-colors",
                        active
                          ? "border-white/15 bg-white/10 text-white"
                          : "border-white/10 bg-transparent text-neutral-400 hover:bg-white/6 hover:text-neutral-200"
                      )}
                    >
                      {opt.label}
                    </button>
                  );
                })}

                <span className="mx-1 hidden h-6 w-px bg-white/10 md:block" />

                <label className="inline-flex items-center gap-2 text-[12px] text-neutral-500">
                  <span className="uppercase tracking-[0.18em]">Locale</span>
                  <select
                    value={locale}
                    onChange={(e) => setLocale(e.target.value)}
                    className="h-8 rounded-lg border border-white/10 bg-white/5 px-2 text-[13px] text-neutral-200 outline-none focus:border-white/20"
                  >
                    <option value="pt">pt</option>
                    <option value="en">en</option>
                    <option value="es">es</option>
                    <option value="fr">fr</option>
                  </select>
                </label>

                <label className="inline-flex items-center gap-2 text-[12px] text-neutral-500">
                  <span className="uppercase tracking-[0.18em]">Tag</span>
                  <select
                    value={tagFilter}
                    onChange={(e) => setTagFilter(e.target.value)}
                    className="h-8 rounded-lg border border-white/10 bg-white/5 px-2 text-[13px] text-neutral-200 outline-none focus:border-white/20"
                  >
                    <option value="all">Todas</option>
                    {tags.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="w-full sm:w-80">
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar por título ou conteúdo…"
                    className="border-white/10 bg-white/5 text-neutral-200 placeholder:text-neutral-600 focus-visible:border-white/20"
                  />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void refresh()}
                  disabled={loading}
                  className="border-white/10 bg-white/5 text-neutral-200 hover:bg-white/8 hover:text-white"
                >
                  <RefreshCw className={cn("mr-2 size-4", loading && "animate-spin")} />
                  Atualizar
                </Button>

                <Button
                  type="button"
                  onClick={openCreate}
                  className="bg-white text-black hover:bg-neutral-100"
                >
                  <FilePlus2 className="mr-2 size-4" />
                  Novo artigo
                </Button>
              </div>
            </div>

            {error ? (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-[13px] text-red-200">
                {error}
              </div>
            ) : null}

            <div className="overflow-hidden rounded-2xl border border-white/6">
              <div className="grid grid-cols-[1fr_120px_120px] gap-0 border-b border-white/6 bg-white/3 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-neutral-500 md:grid-cols-[1fr_140px_120px_120px]">
                <div>Título</div>
                <div className="hidden md:block">Atualizado</div>
                <div>Status</div>
                <div className="text-right">Views</div>
              </div>

              <div className="divide-y divide-white/6">
                {articles === null ? (
                  <div className="px-4 py-10 text-sm text-neutral-400">Carregando…</div>
                ) : visibleArticles.length === 0 ? (
                  <div className="px-4 py-10 text-sm text-neutral-400">
                    Nenhum artigo encontrado com os filtros atuais.
                  </div>
                ) : (
                  visibleArticles.map((article) => (
                    <button
                      key={article.id}
                      type="button"
                      onClick={() => openEdit(article)}
                      className="grid w-full grid-cols-[1fr_120px_120px] items-start gap-0 px-4 py-3 text-left transition-colors hover:bg-white/4 md:grid-cols-[1fr_140px_120px_120px]"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="truncate text-[14px] font-medium text-white">
                            {article.title || "(sem título)"}
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-neutral-300">
                            {article.tag || "Sem tag"}
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-neutral-400">
                            {article.locale}
                          </span>
                        </div>
                        <div className="mt-1 line-clamp-2 text-[12px] leading-5 text-neutral-500">
                          {makeExcerpt(article.content, 180)}
                        </div>
                        <div className="mt-2 text-[11px] text-neutral-600">
                          Autor: {article.author?.username || "—"} · ID: {article.id}
                        </div>
                      </div>

                      <div className="hidden text-[12px] text-neutral-500 md:block">
                        {formatDateTime(article.updatedAt)}
                      </div>

                      <div className="pt-0.5">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px]",
                            article.published
                              ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
                              : "border-amber-400/20 bg-amber-500/10 text-amber-200"
                          )}
                        >
                          {article.published ? "Publicado" : "Rascunho"}
                        </span>
                      </div>

                      <div className="flex items-center justify-end gap-1 text-[12px] text-neutral-400">
                        <Eye className="size-4 text-neutral-600" />
                        {article.views ?? 0}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="right"
          className="w-full border-white/10 bg-[#0f0f0f] text-white sm:max-w-xl"
        >
          <SheetHeader className="border-b border-white/6">
            <SheetTitle className="text-white">
              {sheetMode === "create" ? "Novo artigo" : "Editar artigo"}
            </SheetTitle>
            <SheetDescription className="text-neutral-500">
              {sheetMode === "create"
                ? "Crie um artigo e salve como rascunho ou publicado."
                : "Edite conteúdo, metadados, locale e status de publicação."}
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-4 p-4">
            {sheetError ? (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-[13px] text-red-200">
                {sheetError}
              </div>
            ) : null}

            {sheetMode === "edit" && form.id ? (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/6 bg-white/2 px-3 py-2 text-[12px] text-neutral-400">
                <div className="min-w-0 truncate">
                  ID: <span className="text-neutral-200">{form.id}</span>
                </div>
                <Link
                  href={`/articles/${form.id}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-neutral-300 hover:bg-white/6 hover:text-white transition-colors"
                >
                  Abrir <ExternalLink className="size-3.5" />
                </Link>
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1">
                <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                  Locale
                </span>
                <select
                  value={form.locale}
                  onChange={(e) => {
                    const nextLocale = e.target.value;
                    if (sheetMode === "edit" && form.id) {
                      void loadArticleForLocale(form.id, nextLocale);
                      return;
                    }
                    setForm((prev) => ({ ...prev, locale: nextLocale }));
                  }}
                  disabled={sheetBusy !== null}
                  className="h-9 rounded-xl border border-white/10 bg-white/5 px-3 text-[13px] text-neutral-200 outline-none focus:border-white/20 disabled:opacity-60"
                >
                  <option value="pt">pt</option>
                  <option value="en">en</option>
                  <option value="es">es</option>
                  <option value="fr">fr</option>
                </select>
              </label>

              <label className="grid gap-1">
                <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                  Status
                </span>
                <button
                  type="button"
                  disabled={sheetBusy !== null}
                  onClick={() => setForm((prev) => ({ ...prev, published: !prev.published }))}
                  className={cn(
                    "h-9 rounded-xl border px-3 text-left text-[13px] transition-colors disabled:opacity-60",
                    form.published
                      ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/15"
                      : "border-amber-400/20 bg-amber-500/10 text-amber-200 hover:bg-amber-500/15"
                  )}
                >
                  {form.published ? "Publicado" : "Rascunho"}
                </button>
              </label>
            </div>

            <label className="grid gap-1">
              <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                Título
              </span>
              <input
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                disabled={sheetBusy !== null}
                className="h-9 rounded-xl border border-white/10 bg-white/5 px-3 text-[13px] text-neutral-200 outline-none focus:border-white/20 disabled:opacity-60"
                placeholder="Ex: AMMs: preço, slippage e o custo real do swap"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1">
                <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                  Tag
                </span>
                <input
                  value={form.tag}
                  onChange={(e) => setForm((prev) => ({ ...prev, tag: e.target.value }))}
                  disabled={sheetBusy !== null}
                  className="h-9 rounded-xl border border-white/10 bg-white/5 px-3 text-[13px] text-neutral-200 outline-none focus:border-white/20 disabled:opacity-60"
                  placeholder="Ex: Fundamentos"
                />
              </label>

              <label className="grid gap-1">
                <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                  Cover (URL)
                </span>
                <input
                  value={form.cover}
                  onChange={(e) => setForm((prev) => ({ ...prev, cover: e.target.value }))}
                  disabled={sheetBusy !== null}
                  className="h-9 rounded-xl border border-white/10 bg-white/5 px-3 text-[13px] text-neutral-200 outline-none focus:border-white/20 disabled:opacity-60"
                  placeholder="https://..."
                />
              </label>
            </div>

            <label className="grid gap-1">
              <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                Conteúdo (Markdown)
              </span>
              <textarea
                value={form.content}
                onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                disabled={sheetBusy !== null}
                className="min-h-56 resize-y rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-[13px] leading-6 text-neutral-200 outline-none focus:border-white/20 disabled:opacity-60"
                placeholder={"# Título\n\n- Ponto 1\n- Ponto 2\n\n```solidity\n// code\n```"}
              />
            </label>
          </div>

          <SheetFooter className="border-t border-white/6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                {sheetMode === "edit" ? (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => void deleteArticle()}
                    disabled={sheetBusy !== null}
                    className="border border-red-500/20 bg-red-500/10 text-red-100 hover:bg-red-500/15"
                  >
                    <Trash2 className="mr-2 size-4" />
                    Deletar
                  </Button>
                ) : null}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSheetOpen(false)}
                  disabled={sheetBusy !== null}
                  className="border-white/10 bg-white/5 text-neutral-200 hover:bg-white/8 hover:text-white"
                >
                  <X className="mr-2 size-4" />
                  Fechar
                </Button>
              </div>

              <Button
                type="button"
                onClick={() => void saveArticle()}
                disabled={sheetBusy !== null}
                className="bg-white text-black hover:bg-neutral-100"
              >
                <Save className="mr-2 size-4" />
                {sheetBusy === "saving" ? "Salvando…" : "Salvar"}
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </main>
  );
}
