import Link from "next/link";
import { cn } from "@/lib/utils";

type BaseProps = {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
  className?: string;
  children: React.ReactNode;
};

type ButtonProps = BaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & {
    href?: undefined;
  };

type LinkProps = BaseProps & { href: string };

type Props = ButtonProps | LinkProps;

const variantClass = {
  primary:   "bg-white text-black font-semibold hover:bg-neutral-100",
  secondary: "border border-white/12 bg-white/4 text-neutral-200 hover:bg-white/8",
  ghost:     "text-neutral-500 hover:text-white",
};

const sizeClass = {
  sm: "px-4 py-2 text-[12px]",
  md: "px-5 py-2.5 text-[13px]",
};

export function Btn({ variant = "primary", size = "md", className, children, ...rest }: Props) {
  const cls = cn(
    "inline-flex items-center gap-2 rounded-full transition-colors",
    variantClass[variant],
    sizeClass[size],
    className
  );

  if ("href" in rest && rest.href !== undefined) {
    return <Link href={rest.href} className={cls}>{children}</Link>;
  }

  const { href: _href, ...buttonRest } = rest as ButtonProps & { href?: undefined };
  return <button className={cls} {...buttonRest}>{children}</button>;
}
