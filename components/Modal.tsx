"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export function Modal({
  children,
  title,
  description,
  className,
}: {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}) {
  const router = useRouter();
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(true);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [close]);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  useEffect(() => {
    if (open) return;
    const t = window.setTimeout(() => {
      router.back();
    }, 180);
    return () => window.clearTimeout(t);
  }, [open, router]);

  useEffect(() => {
    queueMicrotask(() => panelRef.current?.focus());
  }, []);

  return (
    <AnimatePresence>
      {open ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          aria-describedby={description ? descId : undefined}
        >
          <motion.button
            type="button"
            aria-label="Fechar"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
          />

          <motion.div
            ref={panelRef}
            tabIndex={-1}
            className={cn(
              "relative w-full max-w-[560px] overflow-hidden rounded-3xl border border-white/[0.10] bg-white/2 shadow-[0_30px_90px_rgba(0,0,0,0.65)]",
              className
            )}
            initial={{ opacity: 0, y: 10, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.985 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <div className="flex items-center justify-between gap-4 border-b border-white/6 px-6 py-4">
              <div className="min-w-0">
                {title ? (
                  <div
                    id={titleId}
                    className="truncate text-[12px] uppercase tracking-[0.2em] text-neutral-500"
                  >
                    {title}
                  </div>
                ) : null}
                {description ? (
                  <div id={descId} className="mt-1 text-[13px] text-neutral-300">
                    {description}
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                onClick={close}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.07] bg-white/2 text-neutral-300 transition-colors hover:bg-white/6 hover:text-white"
                aria-label="Fechar modal"
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-6 py-6">{children}</div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
