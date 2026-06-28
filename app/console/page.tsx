import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { Activity, FileText, Newspaper, Users } from "lucide-react";

import { getCurrentUser } from "@/lib/currentUser";
import { getPrisma } from "@/lib/prisma";

export default async function AdminConsolePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/console");
  if (user.role !== "ADMIN") notFound();

  const prisma = getPrisma();
  const [articleCount, newsCount, publishedArticles, publishedNews] = await Promise.all([
    prisma.article.count(),
    prisma.news.count(),
    prisma.article.count({ where: { published: true } }),
    prisma.news.count({ where: { published: true } }),
  ]);

  const sections = [
    { label: "Articles", total: articleCount, published: publishedArticles, icon: FileText,  href: "/console/articles" },
    { label: "News",     total: newsCount,    published: publishedNews,    icon: Newspaper, href: "/console/news"     },
  ];

  return (
    <main className="flex-1 bg-[#0f0f0f] text-white">
      <div className="mx-auto max-w-5xl px-6 pt-10 pb-20">
        <div className="border-b border-white/6 pb-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">Console</p>
          <h1 className="mt-2 text-[28px] font-semibold tracking-tight">Admin</h1>
          <p className="mt-1 text-[13px] text-neutral-500">
            Logado como <span className="text-white">@{user.username}</span>
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {sections.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              className="group rounded-2xl border border-white/[0.07] bg-white/2 p-6 transition-colors hover:border-white/12 hover:bg-white/4"
            >
              <div className="flex items-center justify-between">
                <s.icon size={18} className="text-neutral-500 transition-colors group-hover:text-neutral-300" />
                <span className="text-[11px] text-neutral-600">{s.published}/{s.total} published</span>
              </div>
              <div className="mt-4 text-[2rem] font-semibold tracking-tight">{s.total}</div>
              <div className="mt-0.5 text-[13px] text-neutral-400">{s.label}</div>
            </Link>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/[0.07] bg-white/2 p-5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-neutral-500">
              <Activity size={12} /> API Health
            </div>
            <p className="mt-2 text-[13px] text-neutral-400">
              <code className="text-neutral-200">/api/admin/health</code>
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.07] bg-white/2 p-5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-neutral-500">
              <Users size={12} /> Sessão
            </div>
            <p className="mt-2 text-[13px] text-neutral-400">
              Role: <span className="text-white">ADMIN</span>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

