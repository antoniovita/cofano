import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "highlight" | "sm";
  hover?: boolean;
};

export function Card({ children, className, variant = "default", hover = false }: Props) {
  const base = "border bg-white/2";
  const variants = {
    default:   "rounded-2xl border-white/[0.07]",
    highlight: "rounded-2xl border-white/20 bg-white/6",
    sm:        "rounded-xl border-white/8",
  };
  const hoverClass = hover
    ? "transition-all duration-300 hover:border-white/13 hover:bg-white/4"
    : "";

  return (
    <div className={cn(base, variants[variant], hoverClass, className)}>
      {children}
    </div>
  );
}
