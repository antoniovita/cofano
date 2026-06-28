"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Bell,
  CreditCard,
  Fingerprint,
  Languages,
  Laptop,
  LogOut,
  Moon,
  Shield,
  Sun,
  UserCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";

type ApiUser = {
  id: string;
  username: string;
  role: "ADMIN" | "USER" | "CONTRIBUTOR";
  locale: string;
  theme: "DARK" | "LIGHT";
};

type LoadState =
  | { status: "loading" }
  | { status: "unauthorized" }
  | { status: "ready"; user: ApiUser }
  | { status: "error" };

type AccountSection =
  | "dados"
  | "seguranca"
  | "sessoes"
  | "notificacoes"
  | "pagamentos"
  | "tema-idioma";

type ThemeMode = "dark" | "light";
type LanguageOption = { code: string; label: string; name: string };

const LANGUAGES: LanguageOption[] = [
  { code: "pt", label: "PT", name: "Português" },
  { code: "en", label: "EN", name: "English" },
  { code: "es", label: "ES", name: "Español" },
  { code: "fr", label: "FR", name: "Français" },
];

function applyTheme(theme: ThemeMode) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme;
  document.documentElement.classList.toggle("theme-light", theme === "light");
}

function RoleBadge({ role }: { role: ApiUser["role"] }) {
  const style =
    role === "ADMIN"
      ? "border-amber-500/20 bg-amber-500/10 text-amber-200"
      : role === "CONTRIBUTOR"
        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
        : "border-white/10 bg-white/4 text-neutral-200";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] uppercase tracking-[0.18em]",
        style
      )}
    >
      {role}
    </span>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [logoutBusy, setLogoutBusy] = useState(false);
  const [section, setSection] = useState<AccountSection>("dados");
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [language, setLanguage] = useState<LanguageOption>(LANGUAGES[0]);

  const loginHref = useMemo(
    () => `/login?next=${encodeURIComponent("/account")}`,
    []
  );

  useEffect(() => {
    let active = true;
    const run = async () => {
      try {
        const res = await fetch("/api/me", {
          method: "GET",
          credentials: "include",
        });
        if (!active) return;

        if (res.status === 401) {
          setState({ status: "unauthorized" });
          return;
        }

        if (!res.ok) {
          setState({ status: "error" });
          return;
        }

        const body = (await res.json().catch(() => null)) as
          | { ok?: boolean; user?: ApiUser }
          | null;

        if (!body?.user) {
          setState({ status: "error" });
          return;
        }

        const u = body.user;
        setState({ status: "ready", user: u });

        // seed theme/locale from DB, falling back to localStorage
        const dbTheme: ThemeMode = u.theme === "LIGHT" ? "light" : "dark";
        setTheme(dbTheme);
        applyTheme(dbTheme);
        try { window.localStorage.setItem("theme", dbTheme); } catch {}

        const dbLocale = u.locale ?? "pt";
        const found = LANGUAGES.find((l) => l.code === dbLocale) ?? LANGUAGES[0];
        setLanguage(found);
        try { window.localStorage.setItem("language", found.code); } catch {}
      } catch {
        if (!active) return;
        setState({ status: "error" });
      }
    };

    void run();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const key = hash.replace(/^#/, "");
    if (
      key === "dados" ||
      key === "seguranca" ||
      key === "sessoes" ||
      key === "notificacoes" ||
      key === "pagamentos" ||
      key === "tema-idioma"
    ) {
      setSection(key);
    }
  }, []);

  const savePreference = async (patch: { theme?: ThemeMode; locale?: string }) => {
    try {
      await fetch("/api/me/preferences", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(patch.theme ? { theme: patch.theme } : {}),
          ...(patch.locale ? { locale: patch.locale } : {}),
        }),
      });
    } catch {}
  };

  const onLogout = async () => {
    if (logoutBusy) return;
    setLogoutBusy(true);
    try {
      await fetch("/api/logout", { method: "POST", credentials: "include" });
    } finally {
      setLogoutBusy(false);
      router.refresh();
      router.replace("/");
    }
  };

  const navItems: Array<{
    key: AccountSection;
    label: string;
    icon: React.ReactNode;
  }> = [
    { key: "dados", label: "Dados", icon: <UserCircle size={16} /> },
    { key: "seguranca", label: "Segurança", icon: <Fingerprint size={16} /> },
    { key: "sessoes", label: "Sessões", icon: <Laptop size={16} /> },
    { key: "notificacoes", label: "Notificações", icon: <Bell size={16} /> },
    { key: "pagamentos", label: "Pagamentos", icon: <CreditCard size={16} /> },
    { key: "tema-idioma", label: "Tema e idioma", icon: <Languages size={16} /> },
  ];

  const sectionMeta = useMemo(() => {
    const map: Record<
      AccountSection,
      { title: string; description: string }
    > = {
      dados: {
        title: "Dados",
        description: "Informações básicas do seu perfil e status da sessão.",
      },
      seguranca: {
        title: "Segurança",
        description: "Senha, recomendações e controles de proteção.",
      },
      sessoes: {
        title: "Sessões",
        description: "Dispositivos e sessões ativas (em breve).",
      },
      notificacoes: {
        title: "Notificações",
        description: "Preferências de avisos e comunicados (em breve).",
      },
      pagamentos: {
        title: "Pagamentos",
        description: "Plano, faturas e métodos de pagamento (em breve).",
      },
      "tema-idioma": {
        title: "Tema e idioma",
        description: "Personalize aparência e linguagem do app.",
      },
    };
    return map[section];
  }, [section]);

  return (
    <main className="flex-1 bg-[#0f0f0f] text-white">
      <section className="mx-auto max-w-6xl px-6 pt-10 pb-14">
        <div className="grid gap-10 lg:grid-cols-[260px_1fr] lg:items-start">
          <aside className="lg:sticky lg:top-24">
            <div className="rounded-2xl border border-white/[0.07] bg-white/2 p-4">
              <div className="px-3 py-2">
                <div className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                  Conta
                </div>
                <div className="mt-2 flex items-center gap-2 text-[14px] font-medium">
                  <UserCircle size={16} className="text-neutral-400" />
                  <span className="text-white">
                    @
                    {state.status === "ready"
                      ? state.user.username
                      : "admin"}
                  </span>
                </div>
                {state.status === "ready" ? (
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px] text-neutral-500">
                    <RoleBadge role={state.user.role} />
                    <span className="text-neutral-700">·</span>
                    <span className="truncate">ID {state.user.id}</span>
                  </div>
                ) : null}
              </div>

              <nav className="mt-2 flex flex-col gap-0.5">
                {navItems.map((item) => {
                  const active = item.key === section;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => {
                        setSection(item.key);
                        if (typeof window !== "undefined") window.location.hash = item.key;
                      }}
                      className={cn(
                        "flex items-center gap-2 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors",
                        active
                          ? "text-white bg-white/8"
                          : "text-neutral-500 hover:text-neutral-200 hover:bg-white/4"
                      )}
                    >
                      <span className="text-neutral-400">{item.icon}</span>
                      {item.label}
                    </button>
                  );
                })}
              </nav>

              <div className="mt-3 border-t border-white/6 pt-3 px-3">
                {state.status === "ready" ? (
                  <button
                    type="button"
                    onClick={onLogout}
                    disabled={logoutBusy}
                    className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/4 px-3 py-2.5 text-[13px] text-neutral-300 transition-colors hover:bg-white/6 hover:text-white disabled:pointer-events-none disabled:opacity-50"
                  >
                    <span className="flex items-center gap-2">
                      <LogOut size={16} className="text-neutral-400" />
                      Sair
                    </span>
                    <span className="text-neutral-700">→</span>
                  </button>
                ) : (
                  <Link
                    href={loginHref}
                    className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/4 px-3 py-2.5 text-[13px] text-neutral-300 transition-colors hover:bg-white/6 hover:text-white"
                  >
                    <span className="flex items-center gap-2">
                      <Shield size={16} className="text-neutral-400" />
                      Entrar
                    </span>
                    <span className="text-neutral-700">→</span>
                  </Link>
                )}
              </div>
            </div>
          </aside>

          <div>
            <div className="border-b border-white/6 pb-6">
              <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                {sectionMeta.title}
              </p>
              <p className="mt-3 max-w-2xl text-[15px] leading-7 text-neutral-400">
                {sectionMeta.description}
              </p>
            </div>

            {state.status === "loading" ? (
              <div className="mt-8 rounded-2xl border border-white/[0.07] bg-white/2 p-6">
                <div className="h-5 w-40 rounded bg-white/10" />
                <div className="mt-4 grid gap-2">
                  <div className="h-4 w-72 rounded bg-white/10" />
                  <div className="h-4 w-56 rounded bg-white/10" />
                </div>
              </div>
            ) : null}

            {state.status === "unauthorized" ? (
              <div className="mt-8 rounded-2xl border border-white/[0.07] bg-white/2 p-6">
                <div className="flex items-start gap-3">
                  <Shield size={18} className="mt-0.5 text-neutral-400" />
                  <div>
                    <div className="text-[13px] font-medium text-white">
                      Área reservada
                    </div>
                    <p className="mt-2 text-[13px] leading-6 text-neutral-400">
                      Faça login para acessar sua conta.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        href={loginHref}
                        className="inline-flex h-10 items-center justify-center rounded-xl border border-white/[0.10] bg-white/8 px-4 text-[13px] font-medium text-white transition-colors hover:bg-white/10 active:translate-y-px"
                      >
                        Entrar
                      </Link>
                      <Link
                        href="/research"
                        className="inline-flex h-10 items-center justify-center rounded-xl border border-white/[0.07] bg-white/2 px-4 text-[13px] text-neutral-300 transition-colors hover:bg-white/6 hover:text-white active:translate-y-px"
                      >
                        Ver artigos
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {state.status === "error" ? (
              <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
                <div className="text-[13px] font-medium text-red-100">
                  Não foi possível carregar sua conta
                </div>
                <p className="mt-2 text-[13px] leading-6 text-red-200/80">
                  Tente recarregar a página.
                </p>
              </div>
            ) : null}

            {state.status === "ready" ? (
              <div className="mt-8 grid gap-4">
                {section === "dados" ? (
                  <>
                    <div className="rounded-2xl border border-white/[0.07] bg-white/2 p-6">
                      <div className="flex items-start gap-3">
                        <UserCircle size={18} className="mt-0.5 text-neutral-400" />
                        <div>
                          <div className="text-[12px] uppercase tracking-[0.2em] text-neutral-500">
                            Perfil
                          </div>
                          <div className="mt-2 text-[18px] font-semibold tracking-tight text-white">
                            @{state.user.username}
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px] text-neutral-500">
                            <RoleBadge role={state.user.role} />
                            <span className="text-neutral-700">·</span>
                            <span className="truncate">ID {state.user.id}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/[0.07] bg-white/2 p-6">
                      <div className="flex items-start gap-3">
                        <BadgeCheck size={18} className="mt-0.5 text-neutral-400" />
                        <div>
                          <div className="text-[12px] uppercase tracking-[0.2em] text-neutral-500">
                            Sessão
                          </div>
                          <p className="mt-3 text-[14px] leading-7 text-neutral-400">
                            Sessão via cookie httpOnly. Em breve: sessões ativas e histórico.
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : null}

                {section === "seguranca" ? (
                  <div className="rounded-2xl border border-white/[0.07] bg-white/2 p-6">
                    <div className="flex items-start gap-3">
                      <Fingerprint size={18} className="mt-0.5 text-neutral-400" />
                      <div>
                        <div className="text-[12px] uppercase tracking-[0.2em] text-neutral-500">
                          Segurança
                        </div>
                        <p className="mt-3 text-[14px] leading-7 text-neutral-400">
                          Em breve: troca de senha, recomendações e controles avançados.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}

                {section === "sessoes" ? (
                  <div className="rounded-2xl border border-white/[0.07] bg-white/2 p-6">
                    <div className="flex items-start gap-3">
                      <Laptop size={18} className="mt-0.5 text-neutral-400" />
                      <div>
                        <div className="text-[12px] uppercase tracking-[0.2em] text-neutral-500">
                          Sessões
                        </div>
                        <p className="mt-3 text-[14px] leading-7 text-neutral-400">
                          Em breve: sessões ativas por dispositivo e opção de encerrar.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}

                {section === "notificacoes" ? (
                  <div className="rounded-2xl border border-white/[0.07] bg-white/2 p-6">
                    <div className="flex items-start gap-3">
                      <Bell size={18} className="mt-0.5 text-neutral-400" />
                      <div>
                        <div className="text-[12px] uppercase tracking-[0.2em] text-neutral-500">
                          Notificações
                        </div>
                        <p className="mt-3 text-[14px] leading-7 text-neutral-400">
                          Em breve: preferências de alertas, comunicados e newsletters.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}

                {section === "pagamentos" ? (
                  <div className="rounded-2xl border border-white/[0.07] bg-white/2 p-6">
                    <div className="flex items-start gap-3">
                      <CreditCard size={18} className="mt-0.5 text-neutral-400" />
                      <div>
                        <div className="text-[12px] uppercase tracking-[0.2em] text-neutral-500">
                          Pagamentos
                        </div>
                        <p className="mt-3 text-[14px] leading-7 text-neutral-400">
                          Em breve: plano, faturas e métodos de pagamento.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}

                {section === "tema-idioma" ? (
                  <>
                    <div className="rounded-2xl border border-white/[0.07] bg-white/2 p-6">
                      <div className="flex items-start gap-3">
                        {theme === "dark" ? (
                          <Sun size={18} className="mt-0.5 text-neutral-400" />
                        ) : (
                          <Moon size={18} className="mt-0.5 text-neutral-400" />
                        )}
                        <div className="flex-1">
                          <div className="text-[12px] uppercase tracking-[0.2em] text-neutral-500">
                            Tema
                          </div>
                          <p className="mt-3 text-[14px] leading-7 text-neutral-400">
                            Escolha entre modo escuro e claro.
                          </p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {(["dark", "light"] as ThemeMode[]).map((opt) => {
                              const active = opt === theme;
                              return (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => {
                                    setTheme(opt);
                                    applyTheme(opt);
                                    try { window.localStorage.setItem("theme", opt); } catch {}
                                    void savePreference({ theme: opt });
                                  }}
                                  className={cn(
                                    "inline-flex h-10 items-center justify-center rounded-xl border px-4 text-[13px] transition-colors",
                                    active
                                      ? "border-white/10 bg-white/8 text-white"
                                      : "border-white/10 bg-white/4 text-neutral-300 hover:bg-white/6 hover:text-white"
                                  )}
                                >
                                  {opt === "dark" ? "Dark" : "Light"}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/[0.07] bg-white/2 p-6">
                      <div className="flex items-start gap-3">
                        <Languages size={18} className="mt-0.5 text-neutral-400" />
                        <div className="flex-1">
                          <div className="text-[12px] uppercase tracking-[0.2em] text-neutral-500">
                            Idioma
                          </div>
                          <p className="mt-3 text-[14px] leading-7 text-neutral-400">
                            Ajusta rótulos e preferências do app.
                          </p>
                          <div className="mt-4 grid gap-2 sm:grid-cols-2">
                            {LANGUAGES.map((opt) => {
                              const active = opt.code === language.code;
                              return (
                                <button
                                  key={opt.code}
                                  type="button"
                                  onClick={() => {
                                    setLanguage(opt);
                                    try { window.localStorage.setItem("language", opt.code); } catch {}
                                    void savePreference({ locale: opt.code });
                                  }}
                                  className={cn(
                                    "flex items-center justify-between rounded-xl border px-4 py-3 text-[13px] transition-colors",
                                    active
                                      ? "border-white/10 bg-white/8 text-white"
                                      : "border-white/10 bg-white/4 text-neutral-300 hover:bg-white/6 hover:text-white"
                                  )}
                                >
                                  <span className="truncate">{opt.name}</span>
                                  <span className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                                    {opt.label}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
