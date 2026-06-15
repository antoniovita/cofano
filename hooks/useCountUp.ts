"use client";

import { useEffect, useRef, useState } from "react";

type Options = {
  duration?: number;
  delay?: number;
  decimals?: number;
};

export function useCountUp(target: number, { duration = 1200, delay = 0, decimals = 0 }: Options = {}) {
  const [value, setValue] = useState(0);
  const [inView, setInView] = useState(false);
  const ref = useRef<Element | null>(null);
  const rafRef = useRef<number>(0);

  // IntersectionObserver — fires once when element enters viewport
  const observe = (el: Element | null) => {
    if (!el || ref.current === el) return;
    ref.current = el;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
  };

  useEffect(() => {
    if (!inView) return;

    let started = false;
    let startTime: number;

    const tick = (now: number) => {
      if (!started) { startTime = now; started = true; }
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setValue(parseFloat((ease * target).toFixed(decimals)));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else setValue(target);
    };

    const timeout = setTimeout(() => {
      rafRef.current = requestAnimationFrame(tick);
    }, delay);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(rafRef.current);
    };
  }, [inView, target, duration, delay, decimals]);

  return { value, observe };
}
