import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-white bg-[#0f0f0f]">
      <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-neutral-600">404</p>

      <h1
        className="mt-5 text-[3rem] font-semibold leading-[1.06] tracking-tight sm:text-[4rem]"
        style={{ fontFamily: '"Georgia Pro", Georgia, serif' }}
      >
        Page not found.
      </h1>

      <p className="mt-5 max-w-sm text-center text-[15px] leading-7 text-neutral-500">
        The page you&apos;re looking for doesn&apos;t exist or was moved.
      </p>

      <div className="mt-10 flex items-center gap-4">
        <Link
          href="/"
          className="inline-flex h-10 items-center rounded-full bg-white px-5 text-[13px] font-medium text-black transition-opacity hover:opacity-85"
        >
          Go home
        </Link>
        <Link
          href="/research"
          className="inline-flex h-10 items-center rounded-full border border-white/[0.07] bg-white/2 px-5 text-[13px] text-neutral-300 transition-colors hover:bg-white/6 hover:text-white"
        >
          Browse Research
        </Link>
      </div>
    </main>
  );
}
