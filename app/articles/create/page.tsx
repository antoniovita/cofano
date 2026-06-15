import { redirect, notFound } from "next/navigation";

import { getCurrentUser } from "@/lib/currentUser";

export default async function CreateArticlePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/articles/create");
  }

  if (user.role !== "CONTRIBUTOR" && user.role !== "ADMIN") {
    notFound();
  }

  return (
    <main className="flex-1 bg-[#0f0f0f] text-white">
      <section className="mx-auto max-w-6xl px-6 pt-10 pb-14">
        <div className="border-b border-white/6 pb-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            Articles
          </p>
          <h1
            className="mt-3 text-[34px] font-semibold leading-[1.05] tracking-tight text-white"
            style={{ fontFamily: '"Georgia Pro", Georgia, serif' }}
          >
            Create
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-7 text-neutral-400">
            Em breve: editor para criar e publicar artigos como contributor.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-white/[0.07] bg-white/2 p-6">
          <div className="text-[12px] uppercase tracking-[0.2em] text-neutral-500">
            Status
          </div>
          <p className="mt-3 text-[14px] leading-7 text-neutral-400">
            Esta tela foi criada para suportar o fluxo do botão <span className="text-neutral-200">Create</span> na lista de artigos.
          </p>
        </div>
      </section>
    </main>
  );
}

