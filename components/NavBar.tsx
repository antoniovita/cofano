"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState, useEffect, useRef } from "react";
import logo from "@/public/images/logo.png";

type NavItem = { href: string; label: string };

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const items: NavItem[] = useMemo(
    () => [
      { href: "/", label: "Home" },
      { href: "/articles", label: "Artigos" },
      { href: "/about", label: "Sobre" },
      { href: "/learn", label: "Aprenda" },
    ],
    []
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (searchOpen) {
      searchRef.current?.focus();
    } else {
      setQuery("");
    }
  }, [searchOpen]);

  // Fechar pesquisa com Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    setSearchOpen(false);
  };

  return (
    <header
      className={[
        "sticky top-0 z-50 transition-all duration-300",
        scrolled ? "bg-[#111111]/95" : "bg-[#191919]",
      ].join(" ")}
    >
      <nav className="mx-auto flex h-20 max-w-5xl items-center justify-between px-4">
        {/* Logo — esconde quando a busca está aberta no mobile */}
        <Link
          href="/"
          className={[
            "shrink-0 opacity-90 transition-opacity hover:opacity-100",
            searchOpen ? "hidden sm:block" : "",
          ].join(" ")}
        >
          <Image src={logo} alt="Defi Institute" width={150} priority />
        </Link>

        {/* Desktop: links + barra de pesquisa inline */}
        <div className="hidden items-center gap-1 sm:flex">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "px-3.5 py-1.5 text-sm transition-colors duration-200",
                  active
                    ? "text-white"
                    : "text-neutral-500 hover:text-neutral-300",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Desktop search */}
        <div className="hidden sm:flex items-center">
          <form
            onSubmit={handleSearch}
            className={[
              "flex items-center gap-2 overflow-hidden transition-all duration-300",
              searchOpen ? "w-52" : "w-8",
            ].join(" ")}
          >
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Buscar"
              className="shrink-0 text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              <SearchIcon />
            </button>
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar..."
              className={[
                "w-full bg-transparent text-sm text-white placeholder-neutral-600 outline-none border-b border-neutral-700 pb-0.5 transition-all duration-300",
                searchOpen ? "opacity-100" : "opacity-0 pointer-events-none",
              ].join(" ")}
            />
          </form>
        </div>

        {/* Mobile: ícone de busca + hamburger */}
        <div className="flex items-center gap-1 sm:hidden">
          {/* Campo de busca expandido no mobile */}
          {searchOpen && (
            <form
              onSubmit={handleSearch}
              className="flex flex-1 items-center gap-2 mr-2"
            >
              <button type="submit" aria-label="Buscar" className="text-neutral-400 shrink-0">
                <SearchIcon />
              </button>
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar..."
                className="w-full bg-transparent text-sm text-white placeholder-neutral-600 outline-none border-b border-neutral-700 pb-0.5"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="text-neutral-500 hover:text-white shrink-0 transition-colors"
                aria-label="Fechar busca"
              >
                <CloseIcon />
              </button>
            </form>
          )}

          {!searchOpen && (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Abrir busca"
              className="p-2 text-neutral-400 hover:text-white transition-colors"
            >
              <SearchIcon />
            </button>
          )}

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-white transition-colors"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="shrink-0"
              aria-hidden="true"
            >
              {open ? (
                <path
                  d="M6 6L18 18M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M4 6h16M4 12h16M4 18h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={[
          "overflow-hidden bg-[#141414] sm:hidden transition-all duration-300 ease-in-out",
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
        ].join(" ")}
      >
        <div className="mx-auto flex max-w-5xl flex-col px-4 py-3 gap-0.5">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                onClick={() => setOpen(false)}
                className={[
                  "px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "text-white"
                    : "text-neutral-500 hover:text-neutral-300",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path
        d="M16.5 16.5L21 21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M6 6L18 18M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}