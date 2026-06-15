import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

type MockNews = {
  id: string;
  source: string;
  title: string;
  date: string;
  image: string;
  content: string;
};

const MOCK_NEWS: Record<string, MockNews> = {
  "n-1": {
    id: "n-1",
    source: "Market",
    title: "Stablecoin flows rise as traders de-risk ahead of volatility",
    date: "Apr 12, 2026",
    image: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=1600&q=80",
    content: `Net stablecoin minting accelerated across Ethereum and Arbitrum this week as on-chain traders reduced exposure to volatile assets ahead of macro data releases.

Data from major lending protocols shows a notable increase in USDC and USDT deposits, while borrowing of ETH and liquid staking tokens declined. The pattern is consistent with risk-off positioning — traders parking capital in stable assets rather than deploying it into yield strategies.

**What to watch**

The key risk here is that large stablecoin inflows can temporarily suppress lending rates, which may push yield-seekers toward riskier strategies once the macro uncertainty passes. Monitor utilization rates on Aave and Morpho over the next 48 hours.

**Cofano note**

If you hold lending positions backed by volatile collateral, this is a good moment to review your health factor. Stablecoin de-risking often precedes volatility spikes that can compress collateral values quickly.`,
  },
  "n-2": {
    id: "n-2",
    source: "Protocols",
    title: "Lending rates compress while onchain leverage rotates to perps",
    date: "Apr 10, 2026",
    image: "https://images.unsplash.com/photo-1559526324-593bc073d938?w=1600&q=80",
    content: `Utilization rates on major lending markets dropped this week as leveraged traders shifted positions from spot-collateral loops to perpetual futures contracts.

The rotation is visible in on-chain data: borrow volumes on Aave V3 and Spark declined, while open interest on leading perp DEXs increased. This suggests traders are seeking leverage without the liquidation mechanics of collateralized lending.

**What this means for lending LPs**

Lower utilization means lower yields for liquidity providers in variable-rate markets. If you are supplying assets expecting stable yield, rates may remain compressed until the next risk-on cycle.

**Cofano note**

Perp-based leverage carries different risks than lending-based leverage — notably funding rate risk and the absence of collateral requirements. Neither is inherently safer; they just fail in different scenarios.`,
  },
  "n-3": {
    id: "n-3",
    source: "Security",
    title: "Checklist: what to verify before approving a new contract",
    date: "Apr 8, 2026",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1600&q=80",
    content: `A practical reference for the minimum checks every DeFi user should run before signing an approval transaction.

**1. Verify the contract address**
Cross-reference the contract on Etherscan or the equivalent explorer. Check that it matches the address published in the protocol's official documentation or governance forum — not just what the UI shows.

**2. Check proxy patterns**
Many DeFi contracts are upgradeable proxies. This means the logic can change after you approve. Look for a "proxy" tag on the explorer and identify who controls the upgrade key.

**3. Review admin keys**
Who can pause the contract? Who can change parameters? A multisig with a 24-hour timelock is meaningfully different from a single EOA with instant upgrade rights.

**4. Scope your approval**
Avoid unlimited approvals when possible. Set a specific allowance matching your intended transaction size. Tools like Revoke.cash let you audit and revoke existing approvals.

**5. Simulate the transaction**
Use Tenderly or a similar tool to simulate the exact transaction before sending it. Verify the state changes match your expectations.

**Cofano note**

These checks take less than five minutes. The cost of skipping them can be the entire approved balance.`,
  },
  "n-4": {
    id: "n-4",
    source: "Ecosystem",
    title: "DEX liquidity migrates to new incentives — what it changes for LPs",
    date: "Apr 5, 2026",
    image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1600&q=80",
    content: `A significant incentive program shifted TVL between competing AMMs this week, creating meaningful impermanent loss exposure for liquidity providers on the losing side.

The migration pattern is familiar: a new protocol offers elevated token rewards, liquidity chases yield, depth on the incumbent AMM drops, and traders experience worse execution. LPs who did not exit early are now holding a position in a thinner pool with higher slippage — compounding their impermanent loss.

**The LP math**

When liquidity leaves a pool, the remaining LPs hold a larger share of a smaller pool. Their fee income drops proportionally to the TVL decline, but their impermanent loss exposure does not change. This asymmetry is often underappreciated.

**What to monitor**

Watch the TVL-to-volume ratio on pools you provide liquidity to. A declining ratio suggests liquidity is leaving faster than volume — a warning sign for fee yield sustainability.

**Cofano note**

Incentive-driven liquidity is inherently unstable. Before providing liquidity to a high-APR pool, ask: what happens to this pool when the incentives end?`,
  },
};

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const news = MOCK_NEWS[id];

  if (!news) notFound();

  const paragraphs = news.content.split("\n\n").filter(Boolean);

  return (
    <main className="flex-1 bg-[#0f0f0f] text-white">
      <section className="mx-auto max-w-5xl px-6 py-10">
        <Link href="/research?tab=News" className="text-[14px] text-neutral-400 hover:text-neutral-200 transition-colors">
          ← Back to research
        </Link>

        <div className="mt-8">
          <div className="relative h-44 w-full overflow-hidden sm:h-56">
            <Image src={news.image} alt={news.title} fill priority sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
            <div className="absolute inset-0 bg-black/35" />
          </div>

          <div className="mt-7">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[12px] text-neutral-500">
              <Badge variant="tag">{news.source}</Badge>
              <span className="text-neutral-700">·</span>
              <span>Cofano Research</span>
              <span className="text-neutral-700">·</span>
              <span>{news.date}</span>
            </div>
            <h1 className="mt-4 text-[2rem] font-semibold leading-[1.12] tracking-tight text-white sm:text-[2.5rem]">
              {news.title}
            </h1>
          </div>
        </div>

        <article className="mt-10 space-y-5">
          {paragraphs.map((block, i) => {
            if (block.startsWith("**") && block.endsWith("**")) {
              return (
                <h2 key={i} className="mt-8 text-[18px] font-semibold tracking-tight text-white">
                  {block.replace(/^\*\*|\*\*$/g, "")}
                </h2>
              );
            }
            const parts = block.split(/(\*\*[^*]+\*\*)/g);
            return (
              <p key={i} className="text-[15px] leading-7 text-neutral-200">
                {parts.map((part, j) =>
                  part.startsWith("**") && part.endsWith("**")
                    ? <strong key={j} className="font-semibold text-white">{part.slice(2, -2)}</strong>
                    : <span key={j}>{part}</span>
                )}
              </p>
            );
          })}
        </article>

        <Card className="mt-12 p-6">
          <p className="text-[12px] uppercase tracking-[0.2em] text-neutral-500">Disclaimer</p>
          <p className="mt-2 text-[13px] leading-6 text-neutral-400">
            This is a news summary for informational purposes. It is not financial advice.
          </p>
        </Card>
      </section>
    </main>
  );
}
