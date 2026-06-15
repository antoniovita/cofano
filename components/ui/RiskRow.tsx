import React from "react";
import { cn } from "@/lib/utils";

type RiskLevel = "ok" | "warn" | "danger";

const dotStyle: Record<RiskLevel, string> = {
  ok:     "bg-emerald-400",
  warn:   "bg-amber-400",
  danger: "bg-red-400",
};

const valueStyle: Record<RiskLevel, string> = {
  ok:     "text-emerald-400",
  warn:   "text-amber-400",
  danger: "text-red-400",
};

type Props = {
  label: string;
  value: React.ReactNode;
  level: RiskLevel;
  className?: string;
};

export function RiskRow({ label, value, level, className }: Props) {
  return (
    <div className={cn("flex items-center justify-between text-[13px]", className)}>
      <div className="flex items-center gap-2 text-neutral-400">
        <span className={cn("size-1.5 shrink-0 rounded-full", dotStyle[level])} />
        {label}
      </div>
      <span className={cn("font-mono", valueStyle[level])}>{value}</span>
    </div>
  );
}
