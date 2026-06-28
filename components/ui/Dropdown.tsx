"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type DropdownProps = {
  trigger: (open: boolean) => React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right";
  width?: string;
  className?: string;
};

export function Dropdown({ trigger, children, align = "right", width = "w-52", className }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (!open) return;
      if (ref.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <div onClick={() => setOpen((v) => !v)}>{trigger(open)}</div>
      {open && (
        <div
          className={cn(
            "absolute top-full z-50 mt-2 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0f0f0f] p-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.6)]",
            align === "right" ? "right-0" : "left-0",
            width,
            className
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

type DropdownItemProps = {
  onClick?: () => void;
  active?: boolean;
  children: React.ReactNode;
  className?: string;
  as?: "button" | "div";
};

export function DropdownItem({ onClick, active, children, className, as: Tag = "button" }: DropdownItemProps) {
  return (
    <Tag
      type={Tag === "button" ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 mt-0.5 text-[13px] transition-colors",
        active ? "bg-white/8 text-white" : "text-neutral-300 hover:bg-white/6 hover:text-white",
        className
      )}
    >
      {children}
    </Tag>
  );
}

export function DropdownLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-neutral-600">
      {children}
    </div>
  );
}

export function DropdownSeparator() {
  return <div className="my-1 border-t border-white/6" />;
}
