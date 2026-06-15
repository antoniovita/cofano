"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type LoginErrorCode =
  | "missing_credentials"
  | "invalid_credentials"
  | "server_misconfigured";

function isSafeNextPath(value: string | null): value is string {
  if (!value) return false;
  if (!value.startsWith("/")) return false;
  if (value.startsWith("//")) return false;
  return true;
}

function getErrorMessage(code: LoginErrorCode | string) {
  switch (code) {
    case "missing_credentials":
      return "Preencha usuário e senha para continuar.";
    case "invalid_credentials":
      return "Usuário ou senha inválidos.";
    case "server_misconfigured":
      return "Servidor indisponível no momento. Tente novamente em instantes.";
    default:
      return "Não foi possível entrar. Tente novamente.";
  }
}

export function LoginPanel({
  variant = "modal",
  next,
}: {
  variant?: "modal" | "page";
  next?: string | null;
}) {
  const router = useRouter();
  const usernameRef = useRef<HTMLInputElement>(null);
  const nextValue: string | null = next ?? null;

  const redirectTo = useMemo(() => {
    if (isSafeNextPath(nextValue)) return nextValue;
    return "/dashboard";
  }, [nextValue]);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        const res = await fetch("/api/check", { method: "GET" });
        if (!active) return;
        if (res.ok) {
          if (variant === "modal") return;
          router.replace(redirectTo);
        }
      } catch {
      }
    };

    void run();
    return () => {
      active = false;
    };
  }, [redirectTo, router, variant]);

  useEffect(() => {
    queueMicrotask(() => usernameRef.current?.focus());
  }, []);

  const canSubmit =
    username.trim().length > 0 && password.length > 0 && !submitting;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);

    try {
      const debugAuth =
        typeof window !== "undefined" &&
        new URLSearchParams(window.location.search).has("debugAuth");
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: username.trim(), password }),
      });

      if (res.ok) {
        try {
          window.dispatchEvent(new Event("auth-changed"));
          if (debugAuth) console.debug("[auth] login ok -> dispatched auth-changed");
        } catch {
        }
        router.replace(redirectTo);
        return;
      }

      const body = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;

      setError(getErrorMessage(body?.error ?? "unknown"));
    } catch {
      setError("Falha de rede ao tentar entrar. Verifique sua conexão e tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={cn(
        variant === "page"
          ? "rounded-2xl border border-white/[0.07] bg-white/2 p-6 sm:p-8"
          : "p-0"
      )}
    >
      <div className="flex items-start justify-between gap-6">

        <div className="hidden sm:flex items-center gap-4 text-[13px] text-neutral-500">
          <button
            type="button"
            className="relative py-2 text-white transition-colors"
            aria-current="page"
          >
            Log in
            <span className="absolute left-0 -bottom-px h-[2px] w-full bg-white" />
          </button>
          <button
            type="button"
            className="relative py-2 transition-colors hover:text-neutral-200 disabled:opacity-60"
            aria-disabled="true"
            disabled
            title="Em breve"
          >
            Sign up
            <span className="absolute left-0 -bottom-px h-[2px] w-full bg-white opacity-0" />
          </button>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-4" aria-busy={submitting}>
        <div>
          <label
            htmlFor="username"
            className="block text-[11px] uppercase tracking-[0.2em] text-neutral-500"
          >
            Usuário
          </label>
          <div className="relative mt-2">
            <User
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
            />
            <Input
              ref={usernameRef}
              id="username"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="seu-usuario"
              className="h-10 rounded-xl border border-white/[0.07] bg-white/2 pl-9 pr-3 text-[13px] text-neutral-200 placeholder:text-neutral-600 focus-visible:ring-0 focus-visible:border-white/[0.14]"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-4">
            <label
              htmlFor="password"
              className="block text-[11px] uppercase tracking-[0.2em] text-neutral-500"
            >
              Senha
            </label>
            <Link
              href="/learn"
              className="text-[12px] text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              Esqueceu a senha?
            </Link>
          </div>

          <div className="relative mt-2">
            <Lock
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
            />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-10 rounded-xl border border-white/[0.07] bg-white/2 pl-9 pr-11 text-[13px] text-neutral-200 placeholder:text-neutral-600 focus-visible:ring-0 focus-visible:border-white/[0.14]"
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-neutral-400 transition-colors hover:bg-white/6 hover:text-neutral-200"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {error ? (
          <div
            role="alert"
            className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[13px] text-red-200"
          >
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={!canSubmit}
          className={cn(
            "mt-1 inline-flex h-10 w-full items-center justify-center rounded-xl border border-white/[0.10] bg-white/8 px-4 text-[13px] font-medium text-white transition-colors hover:bg-white/10 active:translate-y-px disabled:pointer-events-none disabled:opacity-50",
            submitting && "opacity-80"
          )}
        >
          {submitting ? "Entrando..." : "Entrar"}
        </button>

        <div className="pt-4">
          <div className="flex items-center gap-3 text-[12px] text-neutral-500">
            <span className="h-px flex-1 bg-white/10" />
            <span className="uppercase tracking-[0.22em]">ou</span>
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <div className="mt-4 grid gap-2">
            {[
              { label: "Continuar com Google" },
              { label: "Continuar com Apple" },
              { label: "Continuar com Binance" },
              { label: "Continuar com Wallet" },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                disabled
                className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-white/[0.07] bg-white/2 text-[13px] text-neutral-400 opacity-60"
                aria-disabled="true"
                title="Em breve"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
