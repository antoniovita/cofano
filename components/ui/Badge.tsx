import { cn } from "@/lib/utils";

type RiskLevel = "ok" | "warn" | "danger";

const riskStyle: Record<RiskLevel, string> = {
  ok:     "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
  warn:   "border-amber-500/25  bg-amber-500/10  text-amber-300",
  danger: "border-red-500/25    bg-red-500/10    text-red-300",
};

const riskLabel: Record<RiskLevel, string> = {
  ok:     "Low risk",
  warn:   "Medium risk",
  danger: "High risk",
};

type Props =
  | { variant: "tag";  children: React.ReactNode; className?: string }
  | { variant: "risk"; level: RiskLevel;           children?: React.ReactNode; className?: string }
  | { variant: "highlight"; children: React.ReactNode; className?: string };

export function Badge(props: Props) {
  const base = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-normal leading-none";

  if (props.variant === "tag") {
    return (
      <span className={cn(base, "border-white/10 bg-white/5 px-2 text-[10px] text-neutral-300", props.className)}>
        {props.children}
      </span>
    );
  }

  if (props.variant === "risk") {
    return (
      <span className={cn(base, riskStyle[props.level], props.className)}>
        {props.children ?? riskLabel[props.level]}
      </span>
    );
  }

  return (
    <span className={cn(base, "border-white/15 bg-white/10 text-neutral-200", props.className)}>
      {props.children}
    </span>
  );
}
