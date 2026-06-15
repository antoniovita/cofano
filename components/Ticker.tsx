"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Marquee from "react-fast-marquee";

import { cn } from "@/lib/utils";

type TickerItem = {
  id: string;
  title: string;
  href: string;
};

const MOCK_NEWS: TickerItem[] = [
  {
    id: "t-1",
    title: "Stablecoins: o que observar em momentos de estresse de liquidez",
    href: "/articles",
  },
  {
    id: "t-2",
    title: "Checklist rápido: permissões, approvals e riscos de contrato",
    href: "/articles",
  },
  {
    id: "t-3",
    title: "AMMs na prática: slippage, taxas e impacto no preço",
    href: "/articles",
  },
  {
    id: "t-4",
    title: "DeFi do zero: como mapear riscos antes de operar",
    href: "/articles",
  },
];

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return reduced;
}

export function Ticker({
  className,
  items = MOCK_NEWS,
}: {
  className?: string;
  items?: TickerItem[];
}) {
  const prefersReducedMotion = usePrefersReducedMotion();

  const content = useMemo(() => {
    return items.map((item) => (
      <Link
        key={item.id}
        href={item.href}
        className="inline-flex items-center gap-2 px-4 py-2 text-[12px] text-neutral-400 hover:text-neutral-200 transition-colors"
      >
        <span className="whitespace-nowrap">{item.title}</span>
        <span className="ml-6 h-1 w-1 rounded-full bg-white/25" />
      </Link>
    ));
  }, [items]);

  return (
    <div
      className={cn(
        "w-full border-b border-white/6 bg-[#0f0f0f]/85 backdrop-blur",
        className
      )}
      aria-label="Últimas notícias"
    >
      <div className="w-full px-6">
        {prefersReducedMotion ? (
          <div className="flex items-center overflow-x-auto whitespace-nowrap">
            {content}
          </div>
        ) : (
          <Marquee
            autoFill
            speed={32}
            pauseOnHover
            className="py-0.5"
          >
            {content}
          </Marquee>
        )}
      </div>
    </div>
  );
}
