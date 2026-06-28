"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Globe, LayoutDashboard, LogOut, Menu, Moon, Sun, Terminal, UserCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardTrigger, useDashboard } from "@/components/DashboardDrawer";
import { Dropdown, DropdownItem, DropdownLabel, DropdownSeparator } from "@/components/ui/Dropdown";

type AuthState =
  | { status: "unknown" }
  | { status: "guest" }
  | { status: "authed"; username?: string; role?: string };

type ThemeMode = "dark" | "light";

type LanguageOption = { code: string; label: string; name: string };

const LANGUAGES: LanguageOption[] = [
  { code: "pt", label: "PT", name: "Português" },
  { code: "en", label: "EN", name: "English" },
  { code: "es", label: "ES", name: "Español" },
  { code: "fr", label: "FR", name: "Français" },
];

const PILLARS = [
  { href: "/research", label: "Research",  match: "/research" },
  { href: "/markets",  label: "Markets",   match: "/markets"  },
  { href: "/portfolio",label: "Portfolio", match: "/portfolio" },
];

function applyTheme(theme: ThemeMode) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme;
  document.documentElement.classList.toggle("theme-light", theme === "light");
}

function useAuth(pathname: string): AuthState {
  const [auth, setAuth] = useState<AuthState>({ status: "unknown" });

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const res = await fetch("/api/check", { method: "GET", credentials: "include", cache: "no-store" });
        if (!active) return;
        if (!res.ok) { setAuth({ status: "guest" }); return; }
        const body = (await res.json().catch(() => null)) as { allowed?: boolean; user?: { username?: string; role?: string } } | null;
        setAuth(body?.allowed ? { status: "authed", username: body.user?.username, role: body.user?.role } : { status: "guest" });
      } catch {
        if (active) setAuth({ status: "guest" });
      }
    };
    void refresh();
    window.addEventListener("focus", refresh);
    window.addEventListener("auth-changed", refresh);
    return () => { active = false; window.removeEventListener("focus", refresh); window.removeEventListener("auth-changed", refresh); };
  }, [pathname]);

  return auth;
}

function PillControls({ compact }: { compact?: boolean }) {
  const [language, setLanguage] = useState<LanguageOption>(LANGUAGES[0]);
  const [theme, setTheme] = useState<ThemeMode>("dark");

  useEffect(() => {
    const storedTheme = (typeof window !== "undefined" ? localStorage.getItem("theme") : null) as ThemeMode | null;
    const next: ThemeMode = storedTheme === "light" ? "light" : "dark";
    queueMicrotask(() => { setTheme(next); applyTheme(next); });
    const storedLang = typeof window !== "undefined" ? localStorage.getItem("language") : null;
    if (storedLang) {
      const found = LANGUAGES.find((l) => l.code === storedLang);
      if (found) queueMicrotask(() => setLanguage(found));
    }
  }, []);

  return (
    <div className={cn("flex items-center gap-0.5 rounded-full border border-white/[0.07] bg-white/2 px-1.5 py-1", compact && "px-1")}>
      <Dropdown
        trigger={(open) => (
          <button
            type="button"
            aria-label="Idioma"
            className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] text-neutral-300 transition-colors hover:bg-white/6 hover:text-white", compact && "px-2", open && "bg-white/6 text-white")}
          >
            <Globe size={13} className="text-neutral-500" />
            <span className="text-[11px] uppercase tracking-[0.18em] text-neutral-400">{language.label}</span>
          </button>
        )}
      >
        <DropdownLabel>Language</DropdownLabel>
        {LANGUAGES.map((opt) => (
          <DropdownItem
            key={opt.code}
            active={opt.code === language.code}
            onClick={() => { setLanguage(opt); try { localStorage.setItem("language", opt.code); } catch {} }}
          >
            <span>{opt.name}</span>
            <span className="ml-auto text-[11px] uppercase tracking-[0.18em] text-neutral-500">{opt.label}</span>
          </DropdownItem>
        ))}
      </Dropdown>

      <span className="mx-0.5 h-4 w-px bg-white/10" />

      <button
        type="button"
        aria-label={theme === "dark" ? "Switch to light" : "Switch to dark"}
        onClick={() => {
          const next: ThemeMode = theme === "dark" ? "light" : "dark";
          setTheme(next); applyTheme(next);
          try { localStorage.setItem("theme", next); } catch {}
        }}
        className={cn("inline-flex items-center justify-center rounded-full px-2.5 py-1 transition-colors hover:bg-white/6", compact && "px-2")}
      >
        {theme === "dark"
          ? <Sun size={13} className="text-neutral-500" />
          : <Moon size={13} className="text-neutral-500" />}
      </button>
    </div>
  );
}

function MobileDashboardButton({ onCloseMobileMenu }: { onCloseMobileMenu: () => void }) {
  const { open } = useDashboard();
  return (
    <button
      type="button"
      onClick={() => { onCloseMobileMenu(); open(); }}
      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[14px] font-medium text-neutral-400 hover:text-white hover:bg-white/4 transition-colors"
    >
      <LayoutDashboard size={15} className="text-neutral-500" />
      Dashboard
    </button>
  );
}

export function NavBar() {
  const pathname = usePathname();
  const auth = useAuth(pathname);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { queueMicrotask(() => setMobileOpen(false)); }, [pathname]);

  const loginHref = pathname && pathname !== "/login" ? `/login?next=${encodeURIComponent(pathname)}` : "/login";
  const isActive = (match: string) => pathname === match || pathname.startsWith(`${match}/`);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full bg-[#0f0f0f]/90 backdrop-blur-md transition-all duration-300",
          scrolled ? "border-b border-white/6" : "border-b border-transparent"
        )}
      >
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">

          {/* Logo */}
          <Link
            href="/"
            className="shrink-0 transition-opacity duration-200 hover:opacity-100 opacity-90"
          >
            <span
              className="text-white text-[18px] font-medium tracking-tight"
              style={{ fontFamily: '"Georgia Pro", Georgia, serif' }}
            >
              Cofano
            </span>
          </Link>

          {/* Desktop nav — three pillars */}
          <div className="hidden sm:flex items-center">
            <div className="flex items-center gap-0.5 rounded-full border border-white/[0.07] bg-white/2 px-1.5 py-1">
              {PILLARS.map((item) => {
                const active = isActive(item.match);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative px-4 py-1.5 text-[13px] font-medium tracking-wide rounded-full transition-all duration-200",
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

          {/* Desktop right controls */}
          <div className="hidden sm:flex items-center gap-2.5">
            <PillControls />

            {auth.status === "authed" ? (
              <>
                <DashboardTrigger />

                <Dropdown
                  trigger={(open) => (
                    <button
                      type="button"
                      title={auth.username ?? "Account"}
                      className={cn(
                        "inline-flex items-center justify-center h-9 w-9 rounded-full border border-white/[0.07] bg-white/2 transition-colors",
                        open || pathname === "/account"
                          ? "text-white bg-white/8"
                          : "text-neutral-400 hover:text-white hover:bg-white/6"
                      )}
                    >
                      <UserCircle size={16} />
                    </button>
                  )}
                >
                  {auth.username && (
                    <div className="px-3 py-2 text-[11px] text-neutral-600 truncate">
                      @{auth.username}
                    </div>
                  )}
                  <DropdownItem as="div">
                    <Link href="/account" className="flex items-center gap-2.5 w-full">
                      <UserCircle size={14} className="text-neutral-500" />
                      Account
                    </Link>
                  </DropdownItem>
                  {auth.role === "ADMIN" && (
                    <DropdownItem as="div">
                      <Link href="/console" className="flex items-center gap-2.5 w-full">
                        <Terminal size={14} className="text-neutral-500" />
                        Console
                      </Link>
                    </DropdownItem>
                  )}
                  <DropdownSeparator />
                  <DropdownItem
                    onClick={async () => {
                      await fetch("/api/logout", { method: "POST", credentials: "include" });
                      window.dispatchEvent(new Event("auth-changed"));
                      window.location.href = "/";
                    }}
                  >
                    <LogOut size={14} className="text-neutral-500" />
                    Sign out
                  </DropdownItem>
                </Dropdown>
              </>
            ) : (
              <Link
                href={loginHref}
                className={cn(
                  "inline-flex h-9 items-center rounded-full border border-white/[0.07] bg-white/2 px-4 text-[13px] font-medium tracking-wide transition-colors",
                  pathname === "/login" ? "text-white bg-white/8" : "text-neutral-300 hover:text-white hover:bg-white/6"
                )}
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile right */}
          <div className="flex items-center gap-2 sm:hidden">
            <PillControls compact />
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.07] bg-white/2 text-neutral-400 transition-colors hover:text-white"
            >
              {mobileOpen ? <X size={15} /> : <Menu size={15} />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 sm:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="absolute right-0 top-0 h-full w-72 bg-[#0f0f0f] border-l border-white/[0.07] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 h-16 border-b border-white/6">
              <span
                className="text-white text-[17px] font-medium tracking-tight"
                style={{ fontFamily: '"Georgia Pro", Georgia, serif' }}
              >
                Cofano
              </span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.07] text-neutral-500 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
              <div className="px-3 mb-3 text-[10px] uppercase tracking-[0.2em] text-neutral-600">
                Platform
              </div>
              {PILLARS.map((item) => {
                const active = isActive(item.match);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center px-3 py-2.5 rounded-xl text-[14px] font-medium transition-colors",
                      active ? "text-white bg-white/8" : "text-neutral-400 hover:text-white hover:bg-white/4"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="border-t border-white/6 px-4 py-4 space-y-1">
              {auth.status === "authed" ? (
                <>
                  <MobileDashboardButton onCloseMobileMenu={() => setMobileOpen(false)} />
                  <Link
                    href="/account"
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-colors",
                      isActive("/account") ? "text-white bg-white/8" : "text-neutral-400 hover:text-white hover:bg-white/4"
                    )}
                  >
                    <UserCircle size={15} className="text-neutral-500" />
                    {auth.username ?? "Account"}
                  </Link>
                  {auth.role === "ADMIN" && (
                    <Link
                      href="/console"
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-colors",
                        isActive("/console") ? "text-white bg-white/8" : "text-neutral-400 hover:text-white hover:bg-white/4"
                      )}
                    >
                      <Terminal size={15} className="text-neutral-500" />
                      Console
                    </Link>
                  )}
                </>
              ) : (
                <Link
                  href={loginHref}
                  onClick={() => setMobileOpen(false)}
                  className="flex w-full items-center justify-center rounded-xl border border-white/[0.07] bg-white/2 py-2.5 text-[14px] font-medium text-neutral-200 hover:bg-white/6 transition-colors"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
