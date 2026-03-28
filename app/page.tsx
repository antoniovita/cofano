"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { ArrowRight, Clock, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Globe } from "@/components/ui/globe";

type MockArticle = {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  tag: string;
  readTime: string;
  image: string;
};

type MockCourse = {
  id: string;
  title: string;
  level: "Iniciante" | "Intermediário" | "Avançado";
  description: string;
  modules: number;
  hours: number;
};

const MOCK_ARTICLES: MockArticle[] = [
  {
    id: "a-1",
    title: "O que é DeFi e por que importa",
    excerpt:
      "Uma visão prática do ecossistema DeFi: DEXs, lending, stablecoins e os riscos que você precisa entender antes de começar.",
    date: "20 Mar 2026",
    tag: "Fundamentos",
    readTime: "6 min",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&q=80",
  },
  {
    id: "a-2",
    title: "AMMs: como Uniswap precifica swaps",
    excerpt:
      "Entenda a fórmula do produto constante, slippage, pools e como avaliar o impacto de taxas na sua estratégia.",
    date: "16 Mar 2026",
    tag: "Mecânicas",
    readTime: "8 min",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80",
  },
  {
    id: "a-3",
    title: "Riscos em DeFi: checklist de segurança",
    excerpt:
      "Uma lista curta e objetiva para reduzir risco: permissões, contratos, ponte, custody, e sinais de alerta.",
    date: "10 Mar 2026",
    tag: "Segurança",
    readTime: "7 min",
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&q=80",
  },
];

const MOCK_COURSES: MockCourse[] = [
  {
    id: "c-1",
    title: "DeFi do Zero",
    level: "Iniciante",
    description:
      "Fundamentos, carteiras, stablecoins, DEXs e como evitar armadilhas comuns.",
    modules: 6,
    hours: 4,
  },
  {
    id: "c-2",
    title: "Lending & Borrowing na Prática",
    level: "Intermediário",
    description:
      "Colateral, health factor, taxas, liquidações e como estruturar posições com disciplina.",
    modules: 8,
    hours: 6,
  },
  {
    id: "c-3",
    title: "Estratégias com LP e Yield",
    level: "Intermediário",
    description:
      "Impermanent loss, ranges, rebalanceamento e como medir retorno ajustado ao risco.",
    modules: 7,
    hours: 5,
  },
  {
    id: "c-4",
    title: "Análise de Protocolos (framework)",
    level: "Avançado",
    description:
      "Tokenomics, riscos, governança e um método para avaliar sustentabilidade e incentivos.",
    modules: 9,
    hours: 7,
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

const levelConfig = {
  Iniciante: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
  Intermediário: "border-sky-500/25 bg-sky-500/10 text-sky-300",
  Avançado: "border-violet-500/25 bg-violet-500/10 text-violet-300",
};

export default function Home() {
  return (
    <main className="flex-1 bg-[#0f0f0f] text-white">

      <section className="mx-auto max-w-6xl px-6 pt-16 pb-12">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <span className="inline-block text-[11px] uppercase tracking-[0.2em] text-neutral-500 mb-4">
              Defi Institute
            </span>
            <h1 className="text-[2rem] font-semibold tracking-tight leading-[1.2] sm:text-[2.6rem]">
              Aprenda DeFi com clareza,
              <br className="hidden sm:block" /> prática e rigor.
            </h1>
            <p className="mt-5 text-[15px] leading-7 text-neutral-400 max-w-xl">
              Artigos curtos, guias e cursos para você entender os fundamentos,
              operar com segurança e evoluir para estratégias mais avançadas.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/articles"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[13px] font-semibold text-black hover:bg-neutral-100 transition-colors"
              >
                Últimos artigos <ArrowRight size={14} />
              </Link>
              <a
                href="#courses"
                className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/4 px-5 py-2.5 text-[13px] text-neutral-200 hover:bg-white/8 transition-colors"
              >
                Explorar cursos
              </a>
            </div>
          </motion.div>

          <div className="mt-10 flex items-center justify-center lg:mt-0">
            <Globe />
          </div>

        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6">
        <div className="h-px bg-white/6" />
      </div>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex items-end justify-between gap-4 mb-8"
        >
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Últimos artigos</h2>
            <p className="mt-1.5 text-sm text-neutral-500">
              Conteúdo direto ao ponto para aplicar no mundo real.
            </p>
          </div>
          <Link
            href="/articles"
            className="hidden text-[13px] text-neutral-500 hover:text-white transition-colors sm:inline-flex items-center gap-1.5"
          >
            Ver todos <ArrowRight size={13} />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_ARTICLES.map((article, idx) => (
            <motion.div
              key={article.id}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              variants={fadeUp}
              transition={{ duration: 0.45, ease: "easeOut", delay: idx * 0.07 }}
            >
              <Link
                href="/articles"
                className="group flex flex-col rounded-2xl border border-white/[0.07] bg-white/2 overflow-hidden hover:border-white/13 hover:bg-white/4 transition-all duration-300"
              >
                <div className="relative h-44 w-full overflow-hidden">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-black/30" />
                  <span className="absolute top-3 left-3 rounded-full border border-white/15 bg-black/50 backdrop-blur-sm px-2.5 py-0.5 text-[11px] text-neutral-200">
                    {article.tag}
                  </span>
                </div>

                <div className="flex flex-col flex-1 p-5">
                  <h3 className="text-[15px] font-semibold leading-6 group-hover:text-white transition-colors">
                    {article.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-6 text-neutral-500 line-clamp-2">
                    {article.excerpt}
                  </p>
                  <div className="mt-4 flex items-center justify-between pt-2">
                    <span className="text-[11px] text-neutral-600">{article.date}</span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-neutral-600">
                      <Clock size={11} /> {article.readTime}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <Link
          href="/articles"
          className="mt-6 inline-flex items-center gap-1.5 text-[13px] text-neutral-500 hover:text-white transition-colors sm:hidden"
        >
          Ver todos <ArrowRight size={13} />
        </Link>
      </section>

      <div className="mx-auto max-w-6xl px-6">
        <div className="h-px bg-white/6" />
      </div>

      <section id="courses" className="mx-auto max-w-6xl px-6 py-14">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold tracking-tight">Aprenda com cursos</h2>
          <p className="mt-1.5 text-sm text-neutral-500">
            Trilhas guiadas para acelerar seu aprendizado — do básico ao avançado.
          </p>
        </motion.div>

        <Swiper
          modules={[Autoplay]}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          spaceBetween={12}
          slidesPerView={1.1}
          breakpoints={{
            640: { slidesPerView: 2.1, spaceBetween: 14 },
            1024: { slidesPerView: 3.1, spaceBetween: 14 },
          }}
          className="pb-10"
        >
          {MOCK_COURSES.map((course) => (
            <SwiperSlide key={course.id}>
              <div className="h-full rounded-2xl border border-white/[0.07] bg-white/2 p-5 flex flex-col">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] border", levelConfig[course.level])}>
                    {course.level}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-neutral-600">
                    <BookOpen size={11} /> {course.modules} módulos · {course.hours}h
                  </span>
                </div>

                <h3 className="text-[15px] font-semibold leading-6">{course.title}</h3>
                <p className="mt-2 text-[13px] leading-6 text-neutral-500 flex-1">
                  {course.description}
                </p>

                <div className="mt-5 pt-4 border-t border-white/6">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 text-[13px] text-neutral-300 hover:text-white transition-colors"
                  >
                    Ver detalhes <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* ── CTA Banner ── */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="rounded-2xl border border-white/[0.07] bg-white/2 p-8 sm:p-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6"
        >
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Pronto para começar?</h2>
            <p className="mt-1.5 text-sm text-neutral-500">
              Leia os artigos mais recentes ou explore as trilhas de cursos.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[13px] font-semibold text-black hover:bg-neutral-100 transition-colors"
            >
              Ir para artigos <ArrowRight size={14} />
            </Link>
            <a
              href="#courses"
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/4 px-5 py-2.5 text-[13px] text-neutral-200 hover:bg-white/8 transition-colors"
            >
              Ver cursos
            </a>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
