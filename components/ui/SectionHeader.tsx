import { cn } from "@/lib/utils";

type Props = {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
  align?: "left" | "center";
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  className,
  size = "md",
  align = "left",
}: Props) {
  const titleClass = {
    sm: "text-[18px] font-semibold tracking-tight",
    md: "text-[22px] font-semibold tracking-tight",
    lg: "text-[2.4rem] font-semibold leading-[1.1] tracking-tight sm:text-[3rem]",
  }[size];

  return (
    <div className={cn(align === "center" && "text-center", className)}>
      {eyebrow && (
        <p className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">{eyebrow}</p>
      )}
      <h2 className={cn(eyebrow ? "mt-4" : undefined, titleClass)}>{title}</h2>
      {description && (
        <p className={cn("mt-2 text-[13px] leading-6 text-neutral-500", size === "lg" && "mt-5 text-[15px] leading-7")}>
          {description}
        </p>
      )}
    </div>
  );
}
