"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ShieldCheck } from "lucide-react";

const STEPS = [
  { label: "Connecting to on-chain data...",      duration: 800 },
  { label: "Fetching positions on Aave v3...",    duration: 900 },
  { label: "Checking Lido staking...",            duration: 700 },
  { label: "Scanning Uniswap v3 LP positions...", duration: 900 },
  { label: "Calculating health factor...",        duration: 600 },
  { label: "Assessing liquidation risk...",       duration: 700 },
  { label: "Building your risk report...",        duration: 800 },
];

function shortAddress(addr: string) {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function Shimmer({ className }: { className: string }) {
  return (
    <div className={`relative overflow-hidden rounded bg-white/4 ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-linear-to-r from-transparent via-white/5 to-transparent" />
    </div>
  );
}

export default function ScanningPage() {
  const router  = useRouter();
  const params  = useParams();
  const address = params.address as string;

  const [stepIndex, setStepIndex] = useState(0);
  const [done, setDone]           = useState(false);

  useEffect(() => {
    let current = 0;
    const advance = () => {
      if (current >= STEPS.length) {
        setDone(true);
        setTimeout(() => router.push(`/portfolio/report/${address}`), 700);
        return;
      }
      setStepIndex(current);
      const t = setTimeout(() => { current++; advance(); }, STEPS[current]?.duration ?? 800);
      return t;
    };
    const t = advance();
    return () => { if (t) clearTimeout(t); };
  }, [address, router]);

  const progress      = done ? 100 : Math.round((stepIndex / STEPS.length) * 100);
  const showScore     = stepIndex >= 4 || done;
  const showBreakdown = stepIndex >= 5 || done;
  const showPositions = stepIndex >= 6 || done;

  return (
    <>
      <style>{`@keyframes shimmer { 100% { transform: translateX(200%); } }`}</style>

      <main className="flex-1 bg-[#0f0f0f] text-white">
        <section className="mx-auto max-w-6xl px-6 pt-10 pb-24">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-neutral-500">
              <ShieldCheck size={13} className="text-neutral-600" />
              Risk Report
            </div>
            <span className="font-mono text-[12px] text-neutral-600">{shortAddress(address)}</span>
          </div>

          {/* Progress */}
          <div className="mt-6">
            <div className="mb-1.5 flex justify-between text-[11px] text-neutral-600">
              <span className="transition-all duration-300">
                {done ? "Report ready." : STEPS[stepIndex]?.label}
              </span>
              <span className="font-mono">{progress}%</span>
            </div>
            <div className="h-0.5 w-full overflow-hidden rounded-full bg-white/6">
              <div
                className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                style={{ width: `${progress}%`, boxShadow: "0 0 8px rgb(52,211,153)" }}
              />
            </div>
          </div>

          {/* Summary banner skeleton */}
          <div className="mt-6 flex flex-wrap items-center gap-8 rounded-2xl border border-white/6 bg-white/2 px-6 py-5">
            {[80, 48, 56, 52].map((w, i) => (
              <div key={i}>
                <Shimmer className="h-2.5 w-20 mb-2" />
                <Shimmer className={`h-7 w-${w === 80 ? "28" : "20"}`} />
              </div>
            ))}
          </div>

          {/* Main grid */}
          <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_340px]">

            {/* Left — mirrors report layout */}
            <div className="space-y-10">

              {/* Risk score */}
              <div>
                <Shimmer className="h-2.5 w-20 mb-5" />
                <div className="flex items-end gap-3">
                  {showScore ? (
                    <span className="font-mono text-[3.6rem] font-semibold leading-none text-white">68</span>
                  ) : (
                    <Shimmer className="h-14 w-20" />
                  )}
                  <div className="mb-1 flex-1 space-y-2">
                    <Shimmer className="h-2.5 w-24" />
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/6">
                      <div
                        className="h-full rounded-full bg-amber-400 transition-all duration-700"
                        style={{ width: showScore ? "68%" : "0%" }}
                      />
                    </div>
                    <div className="flex justify-between">
                      {[0, 25, 50, 75, 100].map((t) => (
                        <Shimmer key={t} className="h-2 w-4" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Alerts */}
              <div className="border-t border-white/5 pt-10 space-y-3">
                <Shimmer className="h-2.5 w-16 mb-4" />
                {[0, 1].map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/30" />
                    <div className="flex-1 space-y-1.5">
                      <Shimmer className="h-3 w-3/4" />
                      <Shimmer className="h-2.5 w-full" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Recommendations */}
              <div className="border-t border-white/5 pt-10 space-y-3">
                <Shimmer className="h-2.5 w-40 mb-4" />
                {[0, 1, 2].map((i) => (
                  <div key={i} className="rounded-xl border border-white/6 bg-white/2 p-4 space-y-2">
                    <div className="flex items-start gap-2.5">
                      <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/30" />
                      <div className="flex-1 space-y-1.5">
                        <Shimmer className="h-3 w-3/4" />
                        <Shimmer className="h-2.5 w-1/3" />
                      </div>
                    </div>
                    <Shimmer className="h-2.5 w-full ml-5" />
                  </div>
                ))}
              </div>

              {/* Positions */}
              <div className="border-t border-white/5 pt-10">
                <Shimmer className="h-2.5 w-16 mb-4" />
                <div className="space-y-0">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-3 border-b border-white/4 last:border-0"
                      style={{ opacity: showPositions ? 1 : 0.3 + i * 0.1, transition: "opacity 0.5s" }}
                    >
                      <div className="space-y-1.5">
                        <Shimmer className="h-3 w-14" />
                        <Shimmer className="h-2.5 w-24" />
                      </div>
                      <div className="space-y-1.5 text-right">
                        <Shimmer className="ml-auto h-3 w-14" />
                        <Shimmer className="ml-auto h-2.5 w-10" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Token balances */}
              <div className="border-t border-white/5 pt-10">
                <Shimmer className="h-2.5 w-24 mb-4" />
                <div className="space-y-0">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-white/4 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="h-7 w-7 rounded-full bg-white/5" />
                        <div className="space-y-1.5">
                          <Shimmer className="h-3 w-10" />
                          <Shimmer className="h-2.5 w-20" />
                        </div>
                      </div>
                      <div className="space-y-1.5 text-right">
                        <Shimmer className="ml-auto h-3 w-14" />
                        <Shimmer className="ml-auto h-2.5 w-10" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — single panel with divide-y */}
            <div
              className="rounded-2xl border border-white/6 divide-y divide-white/5"
              style={{ opacity: showBreakdown ? 1 : 0.5, transition: "opacity 0.5s" }}
            >
              {/* Risk breakdown */}
              <div className="p-5">
                <Shimmer className="h-2.5 w-24 mb-4" />
                <div className="space-y-3">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-white/10" />
                        <Shimmer className="h-2.5 w-28" />
                      </div>
                      <Shimmer className="h-2.5 w-10" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Protocol exposure */}
              <div className="p-5">
                <Shimmer className="h-2.5 w-32 mb-4" />
                <div className="space-y-4">
                  {[71, 27, 2].map((pct, i) => (
                    <div key={i}>
                      <div className="mb-1.5 flex justify-between">
                        <Shimmer className="h-2.5 w-14" />
                        <Shimmer className="h-2.5 w-8" />
                      </div>
                      <div className="h-0.5 w-full overflow-hidden rounded-full bg-white/6">
                        <div
                          className="h-full rounded-full bg-white/15 transition-all duration-700"
                          style={{ width: showBreakdown ? `${pct}%` : "0%", transitionDelay: `${i * 100}ms` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chain breakdown */}
              <div className="p-5">
                <Shimmer className="h-2.5 w-28 mb-4" />
                <div className="space-y-4">
                  {[89, 8, 3].map((pct, i) => (
                    <div key={i}>
                      <div className="mb-1.5 flex justify-between">
                        <Shimmer className="h-2.5 w-16" />
                        <Shimmer className="h-2.5 w-8" />
                      </div>
                      <div className="h-0.5 w-full overflow-hidden rounded-full bg-white/6">
                        <div
                          className="h-full rounded-full bg-white/15 transition-all duration-700"
                          style={{ width: showBreakdown ? `${pct}%` : "0%", transitionDelay: `${i * 100}ms` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance */}
              <div className="p-5 space-y-2.5">
                <Shimmer className="h-2.5 w-20 mb-4" />
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Shimmer className="h-2.5 w-20" />
                    <Shimmer className="h-2.5 w-14" />
                  </div>
                ))}
              </div>

              {/* Score history */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <Shimmer className="h-2.5 w-28" />
                  <Shimmer className="h-2.5 w-16" />
                </div>
                <div className="flex items-end gap-1 h-12">
                  {[58, 61, 65, 70, 66, 72, 68].map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm bg-white/6 transition-all duration-500"
                      style={{
                        height: showBreakdown ? `${40 + i * 4}%` : "10%",
                        transitionDelay: `${i * 60}ms`,
                      }}
                    />
                  ))}
                </div>
                <div className="mt-2 flex justify-between">
                  {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                    <Shimmer key={i} className="h-2 w-4" />
                  ))}
                </div>
              </div>

              {/* Disclaimer */}
              <div className="p-5 space-y-1.5">
                <Shimmer className="h-2.5 w-full" />
                <Shimmer className="h-2.5 w-3/4" />
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
