"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  score: number; // 0–100
  empty?: boolean;
};

// Three-stop interpolation: emerald-400 → amber-400 → red-400
const COLOR_LOW  = [52,  211, 153] as const; // emerald-400
const COLOR_MID  = [251, 191,  36] as const; // amber-400
const COLOR_HIGH = [248, 113, 113] as const; // red-400

function scoreToColor(score: number): string {
  const t = score / 100;
  let from: readonly [number, number, number];
  let to:   readonly [number, number, number];
  let u: number;

  if (t < 0.5) {
    from = COLOR_LOW; to = COLOR_MID; u = t / 0.5;
  } else {
    from = COLOR_MID; to = COLOR_HIGH; u = (t - 0.5) / 0.5;
  }

  const r = Math.round(from[0] + (to[0] - from[0]) * u);
  const g = Math.round(from[1] + (to[1] - from[1]) * u);
  const b = Math.round(from[2] + (to[2] - from[2]) * u);
  return `rgb(${r},${g},${b})`;
}

function scoreToLabel(score: number): string {
  if (score < 35) return "Low risk";
  if (score < 65) return "Medium risk";
  return "High risk";
}

export function RiskGauge({ score, empty = false }: Props) {
  const [displayed, setDisplayed] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (empty) return;
    let start: number | null = null;
    const duration = 1200;

    const tick = (now: number) => {
      if (!start) start = now;
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setDisplayed(Math.round(ease * score));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };

    const timeout = setTimeout(() => {
      rafRef.current = requestAnimationFrame(tick);
    }, 300);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(rafRef.current);
    };
  }, [score, empty]);

  const pct = empty ? 0 : displayed;
  const color = empty ? "rgba(255,255,255,0.15)" : scoreToColor(displayed);

  return (
    <div className="w-full select-none" aria-label={empty ? "Connect wallet to see risk score" : `Risk score: ${score}`}>
      {/* Score number + label */}
      <div className="mb-4 flex items-end justify-between">
        <div className="flex items-end gap-3">
          <span
            className="font-mono text-[3.6rem] font-semibold leading-none tracking-tight transition-colors"
            style={{ color: empty ? "rgba(255,255,255,0.12)" : "white" }}
          >
            {empty ? "—" : displayed}
          </span>
          <span
            className="mb-1.5 text-[13px] font-medium transition-colors"
            style={{ color }}
          >
            {empty ? "Risk score" : scoreToLabel(displayed)}
          </span>
        </div>
        <div className="mb-1 flex gap-3 text-[11px] text-neutral-700">
          <span>0 Low</span>
          <span>100 High</span>
        </div>
      </div>

      {/* Track */}
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/6">
        {/* Gradient fill */}
        {!empty && (
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-none"
            style={{
              width: `${pct}%`,
              background: `linear-gradient(to right, rgb(52,211,153), ${color})`,
              boxShadow: `0 0 8px ${color}`,
            }}
          />
        )}
      </div>

      {/* Thumb */}
      <div className="relative mt-0 h-4">
        {!empty && (
          <div
            className="absolute top-0 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${pct}%` }}
          >
            <div
              className="h-3.5 w-3.5 rounded-full border-2 mb-2 border-[#0f0f0f]"
              style={{
                backgroundColor: color,
                boxShadow: `0 0 10px ${color}`,
              }}
            />
          </div>
        )}
      </div>

      {/* Scale ticks */}
      <div className="mt-1 flex justify-between px-0.5">
        {[0, 25, 50, 75, 100].map((tick) => (
          <div key={tick} className="flex flex-col items-center gap-1">
            <div className="h-1 w-px bg-white/10" />
            <span className="font-mono text-[9px] text-neutral-700">{tick}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
