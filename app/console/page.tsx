import { redirect, notFound } from "next/navigation";

import { getCurrentUser } from "@/lib/currentUser";

export default async function AdminConsolePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/console");
  }

  if (user.role !== "ADMIN") {
    notFound();
  }

  return (
    <main className="flex-1 bg-[#0f0f0f] text-white">
      <section className="mx-auto max-w-6xl px-6 pt-10 pb-14">
        <div className="border-b border-white/6 pb-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            Console
          </p>
          <h1
            className="mt-3 text-[34px] font-semibold leading-[1.05] tracking-tight text-white"
            style={{ fontFamily: '"Georgia Pro", Georgia, serif' }}
          >
            Admin
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-7 text-neutral-400">
            Área administrativa para monitorar e controlar o sistema.
          </p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/[0.07] bg-white/2 p-6">
            <div className="text-[12px] uppercase tracking-[0.2em] text-neutral-500">
              Sessão
            </div>
            <div className="mt-3 text-[14px] text-neutral-300">
              Logado como{" "}
              <span className="text-white font-medium">@{user.username}</span>
            </div>
            <div className="mt-2 text-[12px] text-neutral-500">Role: ADMIN</div>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-white/2 p-6">
            <div className="text-[12px] uppercase tracking-[0.2em] text-neutral-500">
              API Admin
            </div>
            <div className="mt-3 text-[14px] text-neutral-300">
              Endpoint de healthcheck disponível em{" "}
              <code className="text-neutral-200">/api/admin/health</code>.
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-white/2 p-6">
            <div className="text-[12px] uppercase tracking-[0.2em] text-neutral-500">
              Próximos passos
            </div>
            <div className="mt-3 text-[14px] leading-7 text-neutral-400">
              Em breve: gestão de usuários, publicação de artigos/notícias e
              configurações globais.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

