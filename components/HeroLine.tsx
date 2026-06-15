"use client";

import { useEffect, useRef } from "react";

const W = 600;
const H = 340;
const CX = W / 2;
const CY = H / 2;

// Emerald-400 and red-400 as [r,g,b]
const COLOR_UP   = [52,  211, 153] as const;
const COLOR_DOWN = [248, 113, 113] as const;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

// Smooth interpolation factor — eased so the color glides, not snaps
function lerpColor(from: readonly [number,number,number], to: readonly [number,number,number], t: number) {
  // ease in-out cubic
  const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  return [
    Math.round(lerp(from[0], to[0], e)),
    Math.round(lerp(from[1], to[1], e)),
    Math.round(lerp(from[2], to[2], e)),
  ] as [number, number, number];
}

function sineSum(x: number, t: number, harmonics: { freq: number; amp: number; phase: number; speed: number }[]) {
  return harmonics.reduce((sum, h) => {
    return sum + Math.sin(x * h.freq + t * h.speed + h.phase) * h.amp;
  }, 0);
}

const HARMONICS = [
  { freq: 0.008, amp: 38, phase: 0,   speed: 0.28 },
  { freq: 0.018, amp: 18, phase: 1.2, speed: 0.41 },
  { freq: 0.034, amp: 9,  phase: 2.7, speed: 0.19 },
  { freq: 0.055, amp: 5,  phase: 0.8, speed: 0.55 },
];
const HARMONICS_B = HARMONICS.map((h) => ({ ...h, phase: h.phase + 1.1, amp: h.amp * 0.6 }));
const HARMONICS_C = HARMONICS.map((h) => ({ ...h, phase: h.phase + 2.3, amp: h.amp * 0.35 }));

function buildPath(harmonics: typeof HARMONICS, t: number, steps = 120, cy = CY): string {
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * W;
    const y = cy + sineSum(x, t, harmonics);
    pts.push(`${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return pts.join(" ");
}

function buildFill(harmonics: typeof HARMONICS, t: number, steps = 120, cy = CY, h = H): string {
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * W;
    const y = cy + sineSum(x, t, harmonics);
    pts.push(`${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return `${pts.join(" ")} L ${W} ${h} L 0 ${h} Z`;
}

function setGradientColor(el: SVGLinearGradientElement | null, rgb: [number,number,number], midOpacity: number, fillOpacity: boolean) {
  if (!el) return;
  const stops = el.querySelectorAll("stop");
  if (fillOpacity) {
    stops[0]?.setAttribute("stop-color", `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.09)`);
    stops[1]?.setAttribute("stop-color", `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`);
  } else {
    stops[0]?.setAttribute("stop-color", `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`);
    stops[1]?.setAttribute("stop-color", `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${midOpacity})`);
    stops[2]?.setAttribute("stop-color", `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${midOpacity})`);
    stops[3]?.setAttribute("stop-color", `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`);
  }
}

export function HeroLine({ compact = false }: { compact?: boolean }) {
  const height = compact ? 160 : H;
  const pathARef    = useRef<SVGPathElement>(null);
  const pathBRef    = useRef<SVGPathElement>(null);
  const pathCRef    = useRef<SVGPathElement>(null);
  const fillRef     = useRef<SVGPathElement>(null);
  const strokeRef   = useRef<SVGLinearGradientElement>(null);
  const fillGradRef = useRef<SVGLinearGradientElement>(null);
  const rafRef      = useRef<number>(0);

  useEffect(() => {
    let t = 0;
    let prevMidY = height / 2;
    // colorBlend: 0 = fully up (green), 1 = fully down (red)
    let colorBlend = 0;
    // How fast the color transitions: higher = faster
    const TRANSITION_SPEED = 0.018;

    const tick = () => {
      t += 0.012;

      const cy = height / 2;
      const midY = cy + sineSum(CX, t, HARMONICS);
      const goingDown = midY > prevMidY;
      prevMidY = midY;

      const target = goingDown ? 1 : 0;
      colorBlend += (target - colorBlend) * TRANSITION_SPEED;

      const rgb = lerpColor(COLOR_UP, COLOR_DOWN, colorBlend);

      if (pathARef.current) pathARef.current.setAttribute("d", buildPath(HARMONICS,   t, 120, cy));
      if (pathBRef.current) pathBRef.current.setAttribute("d", buildPath(HARMONICS_B, t, 120, cy));
      if (pathCRef.current) pathCRef.current.setAttribute("d", buildPath(HARMONICS_C, t, 120, cy));
      if (fillRef.current)  fillRef.current.setAttribute("d",  buildFill(HARMONICS,   t, 120, cy, height));

      // Update gradient colors
      setGradientColor(strokeRef.current,   rgb, 0.9,  false);
      setGradientColor(fillGradRef.current, rgb, 0.09, true);

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div className="relative w-full select-none" style={{ aspectRatio: `${W} / ${height}` }} aria-hidden="true">
      <svg
        viewBox={`0 0 ${W} ${height}`}
        width="100%"
        height="100%"
        style={{ overflow: "visible" }}
      >
        <defs>
          <linearGradient id="hl-mask-h" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="white" stopOpacity="0" />
            <stop offset="12%"  stopColor="white" stopOpacity="1" />
            <stop offset="88%"  stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="hl-mask-v" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="white" stopOpacity="0" />
            <stop offset="18%"  stopColor="white" stopOpacity="1" />
            <stop offset="82%"  stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <mask id="hl-mask">
            <rect width={W} height={H} fill="url(#hl-mask-h)" />
            <rect width={W} height={H} fill="url(#hl-mask-v)" style={{ mixBlendMode: "multiply" }} />
          </mask>

          {/* Stroke gradient — updated each frame via ref */}
          <linearGradient ref={strokeRef} id="hl-stroke" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="rgba(52,211,153,0)" />
            <stop offset="20%"  stopColor="rgba(52,211,153,0.9)" />
            <stop offset="80%"  stopColor="rgba(52,211,153,0.9)" />
            <stop offset="100%" stopColor="rgba(52,211,153,0)" />
          </linearGradient>

          {/* Fill gradient — updated each frame via ref */}
          <linearGradient ref={fillGradRef} id="hl-fill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="rgba(52,211,153,0.09)" />
            <stop offset="100%" stopColor="rgba(52,211,153,0)" />
          </linearGradient>
        </defs>

        <g mask="url(#hl-mask)">
          <path ref={fillRef}  fill="url(#hl-fill)" />
          <path ref={pathCRef} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          <path ref={pathBRef} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <path ref={pathARef} fill="none" stroke="url(#hl-stroke)" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}
