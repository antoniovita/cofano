"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type GuardState = "checking" | "allowed" | "denied";

export function useAdminGuard(): GuardState {
  const router = useRouter();
  const [state, setState] = useState<GuardState>("checking");

  useEffect(() => {
    let active = true;
    fetch("/api/check", { method: "GET", credentials: "include", cache: "no-store" })
      .then(async (res) => {
        if (!active) return;
        if (!res.ok) { setState("denied"); router.replace("/"); return; }
        const body = (await res.json().catch(() => null)) as { allowed?: boolean; user?: { role?: string } } | null;
        if (!body?.allowed || body.user?.role !== "ADMIN") {
          setState("denied");
          router.replace("/");
        } else {
          setState("allowed");
        }
      })
      .catch(() => { if (active) { setState("denied"); router.replace("/"); } });
    return () => { active = false; };
  }, [router]);

  return state;
}
