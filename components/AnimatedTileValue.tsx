"use client";

import { useCountUp } from "@/hooks/useCountUp";

type Props = {
  raw: string;
  delay?: number;
};

function parse(raw: string): { prefix: string; num: number; suffix: string; decimals: number } {
  const m = raw.replace(/,/g, "").match(/^([^0-9]*)([0-9]+\.?[0-9]*)([^0-9]*)$/);
  if (!m) return { prefix: "", num: 0, suffix: raw, decimals: 0 };
  const numStr = m[2];
  const decimals = numStr.includes(".") ? numStr.split(".")[1].length : 0;
  return { prefix: m[1], num: parseFloat(numStr), suffix: m[3], decimals };
}

function formatNum(n: number, decimals: number): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function AnimatedTileValue({ raw, delay = 0 }: Props) {
  const { prefix, num, suffix, decimals } = parse(raw);
  const { value, observe } = useCountUp(num, { duration: 1400, delay, decimals });

  return <span ref={observe}>{prefix}{formatNum(value, decimals)}{suffix}</span>;
}
