import { ArrowRight, BookOpen, ShieldCheck, TrendingUp } from "lucide-react";

import { Btn } from "@/components/ui/Btn";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";

export const metadata = {
  title: "About · Cofano",
  description: "Cofano is a DeFi risk intelligence platform for on-chain investors.",
};

const PILLARS = [
  {
    icon: BookOpen,
    name: "Cofano Research",
    description:
      "In-depth articles and analyses on DeFi protocols, market mechanics, and security. Written for investors who want to understand what they're doing before they do it.",
    href: "/research",
    cta: "Read research",
  },
  {
    icon: TrendingUp,
    name: "Cofano Markets",
    description:
      "A focused market context dashboard: key on-chain metrics, lending rates, TVL flows and stablecoin dynamics — the signals that matter for DeFi positioning.",
    href: "/",
    cta: "See snapshot",
  },
  {
    icon: ShieldCheck,
    name: "Cofano Portfolio Risk",
    description:
      "Wallet-level risk analysis via wallet connect. Health factor, liquidation exposure, protocol concentration and yield summary — in seconds, with no private key.",
    href: "/portfolio",
    cta: "Analyze wallet",
  },
];

export default function AboutPage() {
  return (
    <main className="flex-1 bg-[#0f0f0f] text-white">
      <section className="mx-auto max-w-3xl px-6 pt-16 pb-12">
        <SectionHeader
          eyebrow="About Cofano"
          size="lg"
          title={
            <>
              DeFi risk intelligence
              <br />
              <span className="text-neutral-400">for on-chain investors.</span>
            </>
          }
        />
        <div className="mt-6 space-y-4 text-[15px] leading-7 text-neutral-400">
          <p>
            Cofano started as{" "}
            <span className="text-neutral-300">defi.institute</span> — a content operation
            focused on making DeFi understandable. We published articles on protocols,
            mechanics and security for investors who wanted clarity before capital.
          </p>
          <p>
            Over time, the question we kept hearing from readers was not just
            &ldquo;how does this work?&rdquo; but &ldquo;what is my actual exposure right now?&rdquo;
            That question became the product.
          </p>
          <p>
            Cofano is now a risk intelligence platform built around three pillars: research
            that explains the market, a market dashboard that tracks what matters, and a
            portfolio risk engine that tells you exactly what you are exposed to in your wallet.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-6">
        <div className="h-px bg-white/6" />
      </div>

      <section className="mx-auto max-w-3xl px-6 py-14">
        <h2 className="text-[18px] font-semibold tracking-tight">What we build</h2>
        <div className="mt-8 space-y-6">
          {PILLARS.map(({ icon: Icon, name, description, href, cta }) => (
            <Card key={name} className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-white/4">
                  <Icon size={16} className="text-neutral-400" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[16px] font-semibold tracking-tight text-white">{name}</h3>
                  <p className="mt-2 text-[14px] leading-6 text-neutral-400">{description}</p>
                  <Btn href={href} variant="ghost" className="mt-4 px-0 text-[13px]">
                    {cta} <ArrowRight size={13} />
                  </Btn>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-6">
        <div className="h-px bg-white/6" />
      </div>

      <section className="mx-auto max-w-3xl px-6 py-14">
        <h2 className="text-[18px] font-semibold tracking-tight">Our approach</h2>
        <div className="mt-5 space-y-4 text-[15px] leading-7 text-neutral-400">
          <p>
            We write and build for investors who are already in DeFi — not as an
            introduction, but as a working reference. Our research is direct, example-driven
            and focused on decisions, not definitions.
          </p>
          <p>
            On the product side, we believe risk should be legible. Complex on-chain
            positions should not require manual spreadsheet work or a data science background
            to understand. We make that work automatic.
          </p>
          <p>
            We use quantitative models and on-chain data — no black boxes, no
            hand-wavy scores. When we flag a risk, we show you the underlying number
            and what would need to change to affect it.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-6 pb-16">
        <Card className="p-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">Disclaimer</p>
          <p className="mt-3 text-[13px] leading-6 text-neutral-400">
            Cofano provides informational content and risk analysis tools. Nothing on
            this platform constitutes financial advice or a recommendation to buy, sell
            or hold any asset. Risk scores and reports are algorithmic estimates based
            on public on-chain data and are not guarantees of future outcomes. Always
            do your own research.
          </p>
        </Card>
      </div>
    </main>
  );
}
