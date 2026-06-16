"use client";

import Link from "next/link";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export function LoginPanel({
  variant = "modal",
  onClose,
  next,
}: {
  variant?: "modal" | "page";
  next?: string | null;
  onClose?: () => void;
}) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => { document.documentElement.style.overflow = prev; };
  }, []);

  const canSubmit = username.trim().length > 0 && password.length > 0 && !loading;

  const onSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
        credentials: "include",
      });

      const body = (await res.json()) as { ok: boolean; error?: string };

      if (!body.ok) {
        setError(
          body.error === "invalid_credentials"
            ? "Usuário ou senha incorretos."
            : "Ocorreu um erro. Tente novamente."
        );
        return;
      }

      window.dispatchEvent(new Event("auth-changed"));

      if (variant === "modal") {
        setOpen(false);
      } else {
        router.push(next ?? "/dashboard");
        router.refresh();
      }
    } catch {
      setError("Sem conexão com o servidor. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const close = () => {
    setOpen(false);
  };

  const inner = (
    <div className="flex flex-col p-8">
      <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">Acesso</p>
      <h2 className="mt-2 text-[1.4rem] font-semibold leading-tight tracking-tight text-white">
        Entre na sua conta
      </h2>
      <p className="mt-2 text-[13px] leading-6 text-neutral-400">
        Preencha suas credenciais para continuar.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <div>
          <label className="mb-1.5 block text-[11px] text-neutral-500" htmlFor="username">
            Usuário
          </label>
          <div className="relative">
            <User size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" />
            <input
              id="username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(null); }}
              placeholder="seu-usuario"
              className="w-full rounded-xl border border-white/8 bg-white/2 py-3 pl-9 pr-4 font-mono text-[13px] text-white placeholder:text-neutral-700 focus:border-white/20 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-4">
            <label className="text-[11px] text-neutral-500" htmlFor="password">
              Senha
            </label>
            <Link
              href="/learn"
              className="text-[12px] text-neutral-500 transition-colors hover:text-neutral-300"
            >
              Esqueceu a senha?
            </Link>
          </div>
          <div className="relative mt-1.5">
            <Lock size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null); }}
              placeholder="••••••••"
              className="w-full rounded-xl border border-white/8 bg-white/2 py-3 pl-9 pr-11 font-mono text-[13px] text-white placeholder:text-neutral-700 focus:border-white/20 focus:outline-none"
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-neutral-400 transition-colors hover:bg-white/6 hover:text-neutral-200"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        {error && (
          <p className="rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-2.5 text-[12px] text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-1 inline-flex w-full items-center justify-center rounded-xl border border-white/8 bg-white/6 px-4 py-3 text-[13px] font-medium text-white transition-colors hover:bg-white/8 active:translate-y-px disabled:pointer-events-none disabled:opacity-50"
        >
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>

      <div className="mt-5">
        <div className="flex items-center gap-3 text-[11px] text-neutral-600">
          <span className="h-px flex-1 bg-white/6" />
          <span>ou</span>
          <span className="h-px flex-1 bg-white/6" />
        </div>

        <div className="mt-3 space-y-1.5">
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
              aria-disabled="true"
              title="Em breve"
              className="inline-flex w-full items-center justify-center rounded-xl border border-white/8 bg-white/2 px-4 py-3 text-[13px] text-neutral-400 opacity-60"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-6 text-[11px] text-neutral-700">
        Seus dados estão seguros · Nunca compartilhamos suas informações
      </p>
    </div>
  );

  if (variant === "page") {
    return (
      <div className="w-full max-w-sm rounded-2xl border border-white/8 bg-[#141414] shadow-[0_40px_100px_rgba(0,0,0,0.8)]">
        {inner}
      </div>
    );
  }

  return createPortal(
    <AnimatePresence onExitComplete={onClose}>
      {open && (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
          />

          <motion.div
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/8 bg-[#141414] shadow-[0_40px_100px_rgba(0,0,0,0.8)]"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              onClick={close}
              className="absolute right-4 top-4 z-10 flex h-7 w-7 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-white/6 hover:text-neutral-300"
            >
              ×
            </button>
            {inner}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
