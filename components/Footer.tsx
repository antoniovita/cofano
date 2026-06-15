import Link from "next/link";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/research", label: "Research" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/about", label: "About" },
];

export function Footer() {
  return (
    <footer className="border-t border-white/6 bg-[#0f0f0f]">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <div>
            <Link
              href="/"
              className="text-[15px] font-semibold tracking-tight text-white"
            >
              Cofano
            </Link>
            <p className="mt-1 text-[12px] text-neutral-600">
              DeFi risk intelligence for on-chain investors.
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[13px] text-neutral-500 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t border-white/6 pt-6 sm:flex-row sm:items-center">
          <p className="text-[11px] text-neutral-700">
            © {new Date().getFullYear()} Cofano. All rights reserved.
          </p>
          <p className="max-w-sm text-right text-[11px] leading-5 text-neutral-700">
            Not financial advice. Risk scores are algorithmic estimates, not guarantees.
          </p>
        </div>
      </div>
    </footer>
  );
}
