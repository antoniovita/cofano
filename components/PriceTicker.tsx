"use client";

import Marquee from "react-fast-marquee";
import { cn } from "@/lib/utils";

const ITEMS = [
  { label: "BTC",       value: "$67,420",  pct:  1.09 },
  { label: "ETH",       value: "$3,247",   pct:  2.41 },
  { label: "SOL",       value: "$178.40",  pct:  3.22 },
  { label: "BNB",       value: "$594.20",  pct:  0.87 },
  { label: "DeFi TVL",  value: "$94.2B",   pct: -0.83 },
  { label: "F&G",       value: "72",       pct:  0,    label2: "Greed" },
  { label: "USDC",      value: "$1.000",   pct:  0.00 },
  { label: "USDT",      value: "$1.001",   pct:  0.01 },
  { label: "ETH Gas",   value: "12 gwei",  pct:  0,    neutral: true },
  { label: "stETH",     value: "3.8%",     pct:  0,    label2: "APY", neutral: true },
  { label: "AAVE USDC", value: "5.2%",     pct:  0,    label2: "APY", neutral: true },
];

export function PriceTicker() {
  return (
    <div className="border-b border-white/[0.04] bg-[#0a0a0a]">
      <Marquee autoFill speed={36} pauseOnHover className="py-0">
        {ITEMS.map((item, i) => (
          <div key={i} className="inline-flex items-center gap-2 px-5 py-2 border-r border-white/[0.04]">
            <span className="text-[10px] uppercase tracking-[0.16em] text-neutral-600">{item.label}</span>
            <span className="font-mono text-[12px] font-medium text-neutral-200">{item.value}</span>
            {item.label2 && (
              <span className="text-[10px] text-neutral-600">{item.label2}</span>
            )}
            {!item.neutral && item.pct !== 0 && (
              <span className={cn("font-mono text-[11px]", item.pct > 0 ? "text-emerald-400" : "text-red-400")}>
                {item.pct > 0 ? "+" : ""}{item.pct.toFixed(2)}%
              </span>
            )}
          </div>
        ))}
      </Marquee>
    </div>
  );
}
