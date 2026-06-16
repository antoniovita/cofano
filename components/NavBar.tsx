"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Globe, Menu, Moon, Search, Sun, UserCircle } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string };

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/research", label: "Research" },
  { href: "/markets", label: "Markets" },
  { href: "/portfolio", label: "Portfolio" },
];

type ThemeMode = "dark" | "light";

type LanguageOption = {
  code: string;
  label: string;
  name: string;
};

type AuthState =
  | { status: "unknown" }
  | { status: "guest" }
  | { status: "authed"; username?: string };

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

function PillControls({
  compact,
}: {
  compact?: boolean;
}) {
  const [languageOpen, setLanguageOpen] = useState(false);
  const [language, setLanguage] = useState<LanguageOption>(LANGUAGES[0]);
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedTheme = (typeof window !== "undefined" ? window.localStorage.getItem("theme") : null) as
      | ThemeMode
      | null;
    const nextTheme: ThemeMode = storedTheme === "light" ? "light" : "dark";
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setTheme(nextTheme);
      applyTheme(nextTheme);
    });

    const storedLang = typeof window !== "undefined" ? window.localStorage.getItem("language") : null;
    if (storedLang) {
      const found = LANGUAGES.find((l) => l.code === storedLang);
      if (found) {
        queueMicrotask(() => {
          if (!active) return;
          setLanguage(found);
        });
      }
    }
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (!languageOpen) return;
      const target = e.target as Node | null;
      if (target && wrapperRef.current?.contains(target)) return;
      setLanguageOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [languageOpen]);

  const themeIcon = theme === "dark" ? <Sun size={14} className="text-neutral-400" /> : <Moon size={14} className="text-neutral-400" />;
  const themeLabel = theme === "dark" ? "Switch to light" : "Switch to dark";

  return (
    <div
      ref={wrapperRef}
      className={cn(
        "relative flex items-center gap-0.5 rounded-full border border-white/[0.07] bg-white/2 px-1.5 py-1",
        compact && "px-1 py-1"
      )}
    >
      <button
        type="button"
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[12px] text-neutral-300 transition-colors hover:bg-white/6 hover:text-white",
          compact && "px-2"
        )}
        aria-label="Trocar idioma"
        title="Idioma"
        onClick={() => setLanguageOpen((v) => !v)}
      >
        <Globe size={14} className="text-neutral-400" />
        <span className="text-[11px] uppercase tracking-[0.18em] text-neutral-300">{language.label}</span>
      </button>

      {languageOpen ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0f0f0f] p-1 shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
          <div className="px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            Idioma
          </div>
          {LANGUAGES.map((opt) => {
            const active = opt.code === language.code;
            return (
              <button
                key={opt.code}
                type="button"
                onClick={() => {
                  setLanguage(opt);
                  setLanguageOpen(false);
                  try {
                    window.localStorage.setItem("language", opt.code);
                  } catch {
                  }
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl px-3 py-2 mt-1 gap-3 text-[13px] transition-colors",
                  active ? "bg-white/8 text-white" : "text-neutral-300 hover:bg-white/6"
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
      ) : null}

      <span className="mx-0.5 h-5 w-px bg-white/10" />

      <button
        type="button"
        className={cn(
          "inline-flex items-center justify-center rounded-full px-2.5 py-1 text-[12px] text-neutral-300 transition-colors hover:bg-white/6 hover:text-white",
          compact && "px-2"
        )}
        aria-label="Alternar tema"
        title={themeLabel}
        onClick={() => {
          const nextTheme: ThemeMode = theme === "dark" ? "light" : "dark";
          setTheme(nextTheme);
          applyTheme(nextTheme);
          try {
            window.localStorage.setItem("theme", nextTheme);
          } catch {
          }
        }}
      >
        {themeIcon}
      </button>
    </div>
  );
}

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [auth, setAuth] = useState<AuthState>({ status: "unknown" });
  const isSearchRoute = useMemo(() => pathname === "/search", [pathname]);
  const isLoginRoute = useMemo(() => pathname === "/login", [pathname]);
  const isAccountRoute = useMemo(() => pathname === "/account", [pathname]);
  const loginHref = useMemo(() => {
    if (!pathname || pathname === "/login") return "/login";
    return `/login?next=${encodeURIComponent(pathname)}`;
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let active = true;
    const refreshAuth = async () => {
      try {
        const debugAuth =
          typeof window !== "undefined" &&
          new URLSearchParams(window.location.search).has("debugAuth");
        const res = await fetch("/api/check", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });
        if (!active) return;
        if (!res.ok) {
          if (debugAuth) console.debug("[auth] navbar check -> guest", res.status);
          setAuth({ status: "guest" });
          return;
        }
        const body = (await res.json().catch(() => null)) as
          | { allowed?: boolean; user?: { username?: string } }
          | null;
        if (body?.allowed) {
          if (debugAuth) console.debug("[auth] navbar check -> authed", body.user?.username);
          setAuth({ status: "authed", username: body.user?.username });
          return;
        }
        if (debugAuth) console.debug("[auth] navbar check -> guest (allowed=false)");
        setAuth({ status: "guest" });
      } catch {
        if (!active) return;
        try {
          const debugAuth =
            typeof window !== "undefined" &&
            new URLSearchParams(window.location.search).has("debugAuth");
          if (debugAuth) console.debug("[auth] navbar check -> guest (error)");
        } catch {
        }
        setAuth({ status: "guest" });
      }
    };

    void refreshAuth();

    const onFocus = () => void refreshAuth();
    const onAuthChanged = () => void refreshAuth();
    window.addEventListener("focus", onFocus);
    window.addEventListener("auth-changed", onAuthChanged);
    return () => {
      active = false;
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("auth-changed", onAuthChanged);
    };
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    setQuery("");
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full bg-[#0f0f0f]/85 backdrop-blur transition-all duration-500",
        scrolled ? "border-b border-white/6" : "border-b border-transparent"
      )}
    >
      <nav className="mx-auto flex h-18 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="shrink-0 opacity-85 hover:opacity-100 transition-opacity duration-200">
          <h1
            className="text-white text-[18px] font-medium tracking-tight sm:text-[19px]"
            style={{ fontFamily: '"Georgia Pro", Georgia, serif' }}
          >
            Cofano
          </h1>
        </Link>

        <div className="hidden sm:flex items-center">
          <div className="flex items-center gap-1 rounded-full border border-white/[0.07] bg-white/2 px-1.5 py-1">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "px-4 py-1.5 text-[13px] font-medium tracking-wide rounded-full transition-all duration-200",
                    active
                      ? "text-white bg-white/8"
                      : "text-neutral-500 hover:text-neutral-200 hover:bg-white/4"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3">
          {!isSearchRoute ? (
            <form onSubmit={handleSearch} className="hidden sm:flex items-center">
              <div className="relative">
                <Search
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
                />
                <Input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar conteúdo..."
                  className="h-9 w-64 rounded-full border border-white/[0.07] bg-white/2 pl-9 pr-3 text-[13px] text-neutral-200 placeholder:text-neutral-600 focus-visible:ring-0 focus-visible:border-white/[0.14]"
                />
              </div>
            </form>
          ) : null}

          <PillControls />

          {auth.status === "authed" ? (
            <Link
              href="/account"
              aria-current={isAccountRoute ? "page" : undefined}
              className={cn(
                "inline-flex px-2.5 py-2.5 items-center gap-2 rounded-full border border-white/7 bg-white/2 text-[13px] font-medium tracking-wide transition-colors",
                isAccountRoute ? "text-white bg-white/8" : "text-neutral-300 hover:text-white hover:bg-white/6"
              )}
              title="Account"
              aria-label="Account"
            >
              <UserCircle size={16} className="text-neutral-400" />
            </Link>
          ) : (
            <Link
              href={loginHref}
              aria-current={isLoginRoute ? "page" : undefined}
              className={cn(
                "inline-flex h-9 items-center rounded-full border border-white/7 bg-white/2 px-4 text-[13px] font-medium tracking-wide transition-colors",
                isLoginRoute ? "text-white bg-white/8" : "text-neutral-300 hover:text-white hover:bg-white/6"
              )}
            >
              Login
            </Link>
          )}
        </div>

        <div className="flex items-center sm:hidden">
          <PillControls compact />

          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon"
                className="h-8 w-8 text-neutral-300 hover:text-white hover:bg-white/8">
                <Menu size={16} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right"
              className="w-72 bg-[#0f0f0f] border-l border-white/[0.07] p-0">
              <div className="flex flex-col h-full">
                <div className="px-6 pt-8 pb-4 border-b border-white/6">
                  <h1
                    className="text-white text-lg font-medium tracking-tight"
                    style={{ fontFamily: '"Georgia Pro", Georgia, serif' }}
                  >
                    Cofano
                  </h1>
                </div>
                <div className="flex flex-col px-3 pt-4 gap-0.5">
                  {NAV_ITEMS.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <Link key={item.href} href={item.href}
                        aria-current={active ? "page" : undefined}
                        onClick={() => setSheetOpen(false)}
                        className={cn(
                          "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                          active
                            ? "text-white bg-white/8"
                            : "text-neutral-500 hover:text-neutral-200 hover:bg-white/4"
                        )}>
                        {item.label}
                      </Link>
                    );
                  })}

                  <Link
                    href={auth.status === "authed" ? "/account" : loginHref}
                    aria-current={
                      auth.status === "authed"
                        ? isAccountRoute
                          ? "page"
                          : undefined
                        : isLoginRoute
                          ? "page"
                          : undefined
                    }
                    onClick={() => setSheetOpen(false)}
                    className={cn(
                      "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      auth.status === "authed" ? isAccountRoute : isLoginRoute
                        ? "text-white bg-white/8"
                        : "text-neutral-300 hover:text-white hover:bg-white/6"
                    )}
                  >
                    {auth.status === "authed" ? (
                      <span className="flex items-center gap-2">
                        <UserCircle size={16} className="text-neutral-400" />
                        Account
                      </span>
                    ) : (
                      "Login"
                    )}
                  </Link>
                </div>

                <div className="mt-auto border-t border-white/6 px-4 py-4">
                  <form onSubmit={handleSearch} className="flex items-center">
                    <div className="relative w-full">
                      <Search
                        size={14}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
                      />
                      <Input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Buscar conteúdo..."
                        className="h-10 w-full rounded-full border border-white/[0.07] bg-white/2 pl-9 pr-3 text-[13px] text-neutral-200 placeholder:text-neutral-600 focus-visible:ring-0 focus-visible:border-white/[0.14]"
                      />
                    </div>
                  </form>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
