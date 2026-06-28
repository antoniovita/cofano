import 'dotenv/config'
import { PrismaClient, Role } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('DATABASE_URL não definida')

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

function wc(text) {
  return text.trim().split(/\s+/).filter(Boolean).length
}
function rt(text) {
  return Math.max(1, Math.ceil(wc(text) / 200))
}

// ─── Articles ────────────────────────────────────────────────────────────────

const ARTICLES = [
  {
    tag: 'Risk',
    cover: 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=1200&q=80',
    published: true,
    featured: true,
    views: 4820,
    locale: 'en',
    title: 'Understanding Health Factors in DeFi Lending',
    content: `## What Is a Health Factor?

In protocols like Aave and Compound, your health factor (HF) is the single most important number to watch. It represents the ratio between the value of your collateral and the value of your debt, adjusted by the liquidation threshold of each asset.

A health factor above 1 means your position is safe. Below 1, you are subject to liquidation — meaning bots will repay part of your debt and seize a portion of your collateral at a discount.

## How It's Calculated

\`\`\`
HF = Σ(collateral_i × liquidation_threshold_i) / total_debt
\`\`\`

For example: if you have $10,000 of ETH as collateral with an 80% liquidation threshold, and $6,000 of USDC debt, your HF is (10,000 × 0.80) / 6,000 = 1.33.

## Why 1.33 Isn't Enough

A health factor of 1.33 sounds comfortable, but it means ETH only needs to fall 25% relative to USDC before you're liquidated. During periods of high volatility — cascades that drop ETH 15–20% in under an hour — that buffer disappears fast.

## Practical Thresholds

| HF | Status |
|----|--------|
| > 2.0 | Conservative — low near-term risk |
| 1.5 – 2.0 | Moderate — review if market moves |
| 1.2 – 1.5 | Elevated — reduce exposure or add collateral |
| < 1.2 | Critical — liquidation risk in normal volatility |

## Monitoring in Practice

Set alerts at HF 1.5. If you're running leveraged loops, monitor every few hours during volatile markets. Most protocols offer real-time HF in their UI, and tools like DeBank or Zapper aggregate it across protocols.

The key insight: health factor is not static. It moves with asset prices, funding rates, and utilization. Build buffers that survive the conditions you can't predict, not just the ones you're comfortable with today.`,
  },
  {
    tag: 'Protocol',
    cover: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&q=80',
    published: true,
    featured: false,
    views: 3210,
    locale: 'en',
    title: 'Aave V3 Risk Parameters: What Changed and Why It Matters',
    content: `## The Shift to Efficiency Mode

Aave V3 introduced several risk innovations over V2, but the most significant is Efficiency Mode (E-Mode). When you enable E-Mode for a correlated asset category — say, all ETH-based liquid staking tokens — you can borrow up to 93% LTV instead of the standard 80%.

This sounds attractive. And it is — until the correlation breaks.

## Isolation Mode

New assets in Aave V3 launch in Isolation Mode. This means:

- They can only be used as collateral for specific stablecoins
- There's a debt ceiling limiting total protocol exposure
- Cross-collateralization with other assets is blocked

Isolation Mode is a meaningful risk control. It prevents a single malicious or broken price oracle from draining the entire protocol. The debt ceilings are conservative by design.

## Supply and Borrow Caps

V3 introduced per-asset caps on both supply and borrow. These throttle how fast a market can grow and limit the blast radius of an exploit. They're updated by governance and can create friction during high-demand periods — you may find you can't supply a particular asset because the cap is full.

## Risk Admin vs. Full Governance

A key governance change: certain low-impact risk parameter updates can now be executed by a Risk Admin multisig without a full governance vote. This allows faster response to market conditions — but also means more centralized control during emergencies.

## What This Means for You

If you're borrowing on Aave V3:
1. Check whether your collateral is in Isolation Mode
2. Understand the liquidation threshold, not just the LTV
3. If using E-Mode, monitor correlation between assets closely
4. Watch borrow cap utilization — high utilization means your position may be hard to repay if rates spike

The protocol has more safety features than V2, but more complexity too. More parameters to understand means more ways to be caught off-guard.`,
  },
  {
    tag: 'Security',
    cover: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&q=80',
    published: true,
    featured: false,
    views: 5640,
    locale: 'en',
    title: 'Oracle Manipulation: The Hidden Risk in Every DeFi Position',
    content: `## What Is an Oracle?

Every DeFi protocol that needs to know the price of an asset relies on an oracle — an external data feed that brings off-chain prices on-chain. Without reliable oracles, there is no lending, no derivatives, no liquidation system.

Chainlink is the dominant provider, using a decentralized network of independent data providers. But not all protocols use Chainlink, and not all use it correctly.

## How Manipulation Works

Oracle manipulation attacks exploit the gap between on-chain price data and real market prices. The most common vector: **flash loan price manipulation**.

A single large trade in a low-liquidity DEX pool can move that pool's spot price significantly. If a protocol uses that pool's spot price as its oracle (rather than a time-weighted average or an external feed), an attacker can:

1. Take a flash loan
2. Manipulate the spot price in the oracle source pool
3. Borrow against artificially inflated collateral value
4. Repay the flash loan and keep the difference

This has been the root cause of dozens of exploits, from the Mango Markets incident ($114M) to dozens of smaller protocols.

## TWAP vs. Spot

Time-Weighted Average Price (TWAP) oracles average the price over a time window, making manipulation far more expensive. An attacker must sustain the manipulated price for the entire TWAP window — requiring much more capital and leaving them exposed longer.

Uniswap V3 TWAPs are commonly used as a secondary check. They're not perfect — thin liquidity and short windows can still be manipulated — but they're substantially more resistant than spot prices.

## Red Flags to Check

Before depositing into a protocol, check:
- What oracle does it use?
- Is it Chainlink, or a custom on-chain feed?
- What's the liquidity depth of the oracle source?
- Has the oracle been audited?
- Is there a circuit breaker if the price moves abnormally?

A single Chainlink feed with multiple data sources, circuit breakers, and a 1-hour heartbeat is meaningfully safer than a Uniswap V2 spot price on a $2M liquidity pool.`,
  },
  {
    tag: 'Market',
    cover: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=80',
    published: true,
    featured: false,
    views: 2190,
    locale: 'en',
    title: 'Stablecoin Depegs: What Happened, Why, and What to Watch',
    content: `## The Peg Is a Social Contract

A stablecoin's peg to $1 is not guaranteed by any law or central bank. It's maintained by a combination of arbitrage incentives, collateral backing, and market confidence. When any of those three weakens, the peg comes under pressure.

## The Three Depeg Types

**Collateral depegs** happen when the assets backing the stablecoin lose value faster than the protocol can react. This is what happened to LUNA/UST in 2022 — the algorithmic backing collapsed in a reflexive spiral when confidence broke.

**Liquidity depegs** happen when there isn't enough buy-side liquidity to absorb sell pressure, even when the stablecoin is theoretically well-collateralized. DAI briefly depegged in March 2023 during the USDC depeg event, not because DAI was undercollateralized, but because large holders fled to perceived safety.

**Redemption depegs** happen when users can't access the underlying collateral fast enough. If a stablecoin backs itself with illiquid assets and faces a bank run, redemption queues create a discount in secondary markets.

## What the On-Chain Data Shows

The most reliable leading indicators of a depeg:
- Stablecoin supply declining rapidly (redemption pressure)
- Curve pool imbalance (large imbalance = sellers dominating)
- Borrow rates spiking on the stablecoin (demand to short)
- Secondary market price on DEXs diverging from $1

## How to Position

If you're holding stablecoins as DeFi collateral or yield:
- Prefer over-collateralized stablecoins (USDC, USDT, FRAX) over algorithmic ones
- Monitor Curve pool depth monthly
- Avoid having 100% stablecoin exposure in a single issuer
- Keep some exposure in USDC or USDT for liquidity — they're the deepest markets

No stablecoin is risk-free. Treat stablecoin diversification the same way you'd treat credit risk in traditional finance.`,
  },
  {
    tag: 'Research',
    cover: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80',
    published: true,
    featured: false,
    views: 1870,
    locale: 'en',
    title: 'Liquidity Pool Risk: A Framework for LP Position Assessment',
    content: `## The LP Value Proposition

When you provide liquidity to an AMM pool, you receive trading fees in exchange for accepting impermanent loss risk. The question is never whether impermanent loss exists — it always does. The question is whether the fees earned justify the risk taken.

## Impermanent Loss: The Math

For a 50/50 Uniswap V2 pool, impermanent loss as a function of price ratio r:

\`\`\`
IL = 2√r / (1+r) - 1
\`\`\`

At r = 2 (one asset doubles), IL = -5.7%
At r = 4 (one asset quadruples), IL = -20%
At r = 0.25 (one asset drops 75%), IL = -20%

This loss is "impermanent" only if prices return to entry levels. In practice, many LPs realize permanent losses because they exit after a large price divergence.

## Concentrated Liquidity Risk

Uniswap V3 allows LPs to concentrate their liquidity in a price range. This amplifies fee income when the price is in range — and amplifies impermanent loss when it moves out. An out-of-range V3 position earns zero fees while still being subject to price exposure.

V3 LPs are effectively running a short volatility strategy. High volatility means more fee income and more impermanent loss — the net effect depends on your range width and the specific volatility profile.

## What to Measure Before Entering a Pool

1. **Fee APR vs. IL breakeven**: How many days of fees does it take to cover a 10% price move? A 20% move?
2. **Volume/TVL ratio**: High ratio means more fees relative to capital at risk
3. **Correlation between assets**: Correlated assets (e.g., ETH/stETH) have lower IL risk
4. **Pool age and consistency**: New pools have less fee history to forecast from
5. **Smart contract risk**: Has the AMM been audited? Is there a timelock on admin keys?

## Protocol Risk in LP Positions

LP positions carry not just market risk but also smart contract risk. The pool contract holds your funds — if it's exploited, you lose regardless of price performance. Audit history and protocol age are the best available proxies for smart contract safety.`,
  },
  {
    tag: 'Tutorial',
    cover: 'https://images.unsplash.com/photo-1639762681057-408e52192e55?w=1200&q=80',
    published: true,
    featured: false,
    views: 3450,
    locale: 'en',
    title: 'How to Read a DeFi Audit Report',
    content: `## Why Audits Matter (and Why They're Not Enough)

An audit is not a security guarantee. It's a point-in-time review by a set of human experts who look for known vulnerability patterns, logic errors, and design flaws. Audits miss things. Smart contracts get upgraded. New attack vectors emerge.

That said, unaudited protocols carry substantially higher risk. The question is how to extract signal from an audit report rather than using it as a binary pass/fail.

## The Anatomy of an Audit Report

Most reports follow a similar structure:

**Executive Summary** — overall risk assessment, number of findings by severity.

**Scope** — which contracts were reviewed, which commit hash, what was explicitly excluded.

**Findings** — each issue listed with severity (Critical/High/Medium/Low/Informational), description, and recommended fix.

**Response** — the protocol team's acknowledgment and their fix (or non-fix, with justification).

**Remediation** — auditor's verification that the fix was applied correctly.

## Reading Findings Critically

**Critical and High** findings that were "acknowledged but not fixed" are red flags. The protocol team may have a reason — the finding may be a design decision rather than a bug — but you want to understand what that reason is.

**Centralization risks** appear frequently as Medium or Low findings. They're not bugs, but they mean someone controls an upgrade key or parameter that could be used against you. This is worth knowing.

**Out of scope** items matter. If the oracle integration, token contract, or governance system was excluded from the audit scope, those are unreviewed attack surfaces.

## Questions to Ask

- Who did the audit? (Trail of Bits, OpenZeppelin, Spearbit carry more weight than unknown firms)
- When was it done? Has the code changed significantly since?
- Were all Critical/High findings fixed?
- Has the protocol been live long enough to have a track record?

An old audit of unchanged code with all findings fixed from a reputable firm is meaningful. A recent audit of a heavily modified codebase from an unknown firm is much less so.`,
  },
  {
    tag: 'Ecosystem',
    cover: 'https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=1200&q=80',
    published: true,
    featured: false,
    views: 2080,
    locale: 'en',
    title: 'The DeFi Risk Stack: Protocol, Market, and Systemic Risk',
    content: `## Three Layers of Risk

When analyzing a DeFi position, most people focus on price risk — will ETH go up or down? But price risk is only one layer. A complete risk assessment covers three layers: protocol risk, market risk, and systemic risk.

## Protocol Risk

Protocol risk is the risk that the smart contract itself fails. This includes:

- **Bugs**: Vulnerabilities in contract logic that allow funds to be stolen or frozen
- **Oracle failures**: Price feeds that can be manipulated or go stale
- **Governance attacks**: Malicious proposals that drain treasury or change parameters
- **Admin key risk**: Centralized control that can be used against users
- **Upgrade risk**: Proxies that can be upgraded to change behavior

Protocol risk can be reduced through audit coverage, protocol age, bug bounties, and decentralized governance. It can never be fully eliminated.

## Market Risk

Market risk is the familiar one: asset prices move against your position. In DeFi, market risk is amplified by leverage and liquidation mechanics.

Key market risk factors:
- Asset volatility (stablecoins vs. volatile tokens)
- Correlation between collateral and debt assets
- Liquidity depth (can you exit your position quickly?)
- Funding rates and borrowing costs over time

## Systemic Risk

Systemic risk is the interconnection of protocols. In DeFi, protocols compose on top of each other. If Aave freezes a market, it can cause forced liquidations that cascade into Curve, which affects stablecoin pegs, which triggers more Aave liquidations.

The Terra/LUNA collapse in 2022 demonstrated systemic risk at scale. The unwinding of the Anchor yield caused cascading depegs, liquidity crises, and liquidations across protocols that had no direct exposure to LUNA.

## Applying the Framework

For any position:
1. Assess protocol risk (audit, age, centralization)
2. Quantify market risk (LTV, health factor, IL)
3. Map systemic exposure (what happens if a connected protocol fails?)

Most DeFi risk management focuses on layer 2. The most catastrophic losses come from layers 1 and 3.`,
  },
  {
    tag: 'Research',
    cover: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=1200&q=80',
    published: true,
    featured: false,
    views: 1320,
    locale: 'en',
    title: 'MEV and You: How Maximal Extractable Value Affects DeFi Users',
    content: `## What Is MEV?

Maximal Extractable Value (MEV) refers to the profit that validators and searchers can extract from the ordering of transactions within blocks. In a permissionless blockchain, transaction ordering is not neutral — it has economic consequences.

If you submit a swap transaction on Uniswap, a MEV bot may see it in the mempool and insert its own transactions before and after yours, profiting from the price impact you create. This is called a **sandwich attack**.

## Types of MEV

**Arbitrage**: The most benign form. Searchers profit by equalizing prices between DEXs. This is economically efficient and doesn't directly harm users.

**Sandwich attacks**: A searcher buys an asset before your swap (pushing the price up), lets your swap execute at a worse price, then sells immediately after. You pay more; they profit the difference.

**Liquidation frontrunning**: When a position becomes eligible for liquidation, multiple searchers compete to liquidate it first. The winner earns the liquidation bonus. This is neutral for the position holder but means liquidations happen efficiently.

**JIT liquidity**: In Uniswap V3, searchers add concentrated liquidity just before a large swap and remove it immediately after, capturing fees from a single trade.

## How Much Does It Cost You?

The actual cost to a typical retail user is hard to quantify but real. Studies suggest MEV extraction costs DEX users hundreds of millions annually. The impact per trade is small — often a few basis points — but compounds across thousands of transactions.

## Protection Strategies

- **Use MEV protection**: Flashbots Protect, MEV Blocker, and similar tools route transactions privately to avoid the public mempool
- **Set low slippage tolerance**: Less price tolerance means sandwich attacks are less profitable (but your transactions may fail more often)
- **Use aggregators with MEV protection**: 1inch Fusion and CoW Protocol use off-chain matching to reduce MEV exposure
- **Avoid large swaps in thin pools**: The larger your trade relative to pool liquidity, the more attractive it is to sandwich

MEV is a fundamental property of permissionless blockchains. You can't eliminate it, but you can reduce your exposure with the right tools.`,
  },
]

// ─── News ─────────────────────────────────────────────────────────────────────

const NEWS = [
  {
    tag: 'Market',
    cover: 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=900&q=80',
    published: true,
    featured: true,
    views: 2140,
    locale: 'en',
    title: 'Stablecoin flows rise as traders de-risk ahead of macro data',
    content: `Net stablecoin minting accelerated across Ethereum and Arbitrum this week as on-chain traders reduced exposure ahead of key macro releases.

Data from major lending protocols shows a notable increase in USDC and USDT deposits, while borrowing of ETH and liquid staking tokens declined. The pattern is consistent with risk-off positioning — capital parking in stable assets rather than deploying into yield strategies.

**What to watch**

Utilization rates on Aave and Morpho over the next 48 hours. Large stablecoin inflows temporarily suppress lending rates, which may push yield-seekers toward riskier strategies once uncertainty clears.

**Cofano note**

If you hold lending positions backed by volatile collateral, this is a good moment to review your health factor. Stablecoin de-risking often precedes volatility spikes that can compress collateral values quickly.`,
  },
  {
    tag: 'Protocols',
    cover: 'https://images.unsplash.com/photo-1559526324-593bc073d938?w=900&q=80',
    published: true,
    featured: false,
    views: 1830,
    locale: 'en',
    title: 'Lending rates compress as onchain leverage rotates to perps',
    content: `Utilization rates on major lending markets dropped this week as leveraged traders shifted from spot-collateral loops to perpetual futures contracts.

Borrow volumes on Aave V3 and Spark declined, while open interest on leading perp DEXs increased. Traders are seeking leverage without the liquidation mechanics of collateralized lending.

**What this means for lending LPs**

Lower utilization means lower yields for liquidity providers in variable-rate markets. Rates may remain compressed until the next risk-on cycle.

**Cofano note**

Perp-based leverage carries different risks than lending-based leverage — notably funding rate risk and the absence of collateral requirements. Neither is inherently safer; they just fail in different scenarios.`,
  },
  {
    tag: 'Security',
    cover: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=900&q=80',
    published: true,
    featured: false,
    views: 3520,
    locale: 'en',
    title: 'Checklist: what to verify before approving a new contract',
    content: `A practical reference for the minimum checks every DeFi user should run before signing an approval transaction.

**1. Verify the contract address**
Cross-reference on Etherscan. Check it matches the address in official documentation — not just what the UI shows.

**2. Check proxy patterns**
Many contracts are upgradeable proxies. The logic can change after you approve. Look for a "proxy" tag and identify who controls the upgrade key.

**3. Review admin keys**
Who can pause the contract? A multisig with a 24-hour timelock is meaningfully different from a single EOA with instant upgrade rights.

**4. Scope your approval**
Avoid unlimited approvals. Set a specific allowance. Use Revoke.cash to audit existing approvals.

**5. Simulate the transaction**
Use Tenderly to simulate the exact transaction before sending. Verify state changes match expectations.

**Cofano note**

These checks take less than five minutes. The cost of skipping them can be the entire approved balance.`,
  },
  {
    tag: 'Ecosystem',
    cover: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=900&q=80',
    published: true,
    featured: false,
    views: 1240,
    locale: 'en',
    title: 'DEX liquidity migrates to new incentives — what it changes for LPs',
    content: `A significant incentive program shifted TVL between competing AMMs this week, creating meaningful impermanent loss exposure for LPs on the losing side.

The rotation is familiar: new protocol offers elevated token rewards, liquidity chases yield, depth on the incumbent AMM drops, and traders experience worse execution. LPs who didn't exit early now hold a position in a thinner pool with higher slippage — compounding impermanent loss.

**The LP math**

When liquidity leaves a pool, remaining LPs hold a larger share of a smaller pool. Fee income drops proportionally to the TVL decline, but IL exposure doesn't change. This asymmetry is often underappreciated.

**Cofano note**

Incentive-driven liquidity is inherently unstable. Before providing liquidity to a high-APR pool, ask: what happens when the incentives end?`,
  },
  {
    tag: 'Market',
    cover: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=900&q=80',
    published: true,
    featured: false,
    views: 2670,
    locale: 'en',
    title: 'ETH funding rates flip negative on major perp exchanges',
    content: `ETH perpetual funding rates turned negative across Binance, Bybit, and dYdX this week, signaling a shift in market sentiment from leveraged longs to shorts.

Negative funding means short positions are paying longs — a signal that bears are paying a premium to maintain their positions. Historically, sustained negative funding has preceded sharp short squeezes as these positions are unwound.

**What the data shows**

Open interest remained elevated even as funding went negative, suggesting shorts are accumulating against a backdrop of flat-to-declining spot prices. This divergence — high OI, negative funding, flat price — often resolves violently in one direction.

**Cofano note**

For users with ETH collateral in lending protocols, a rapid price move in either direction increases liquidation risk on leveraged borrowers. Monitor your health factor if ETH moves more than 8% in either direction over 24 hours.`,
  },
  {
    tag: 'Protocols',
    cover: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=900&q=80',
    published: true,
    featured: false,
    views: 1580,
    locale: 'en',
    title: 'Morpho Blue utilization hits 91% on USDC market',
    content: `Morpho Blue's USDC lending market reached 91% utilization this week — the highest level since launch. At this level, borrow rates are elevated and supply-side exit liquidity is thin.

When utilization is high, suppliers face friction when withdrawing: there may not be enough idle liquidity to cover large withdrawals, forcing a wait or requiring borrowers to repay first.

**Risk implications**

At 91% utilization, the USDC borrow rate on Morpho is approximately 8.6% APY. Borrowers who entered at lower rates are now paying significantly more. Positions running on thin margins may become uneconomical.

**Cofano note**

If you're supplying USDC on Morpho for yield, check your exit liquidity. High utilization is a signal that the market is tight. If you need liquidity urgently, plan your exit timing accordingly.`,
  },
  {
    tag: 'Security',
    cover: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=900&q=80',
    published: true,
    featured: false,
    views: 4120,
    locale: 'en',
    title: '$142M liquidated in ETH cascade — a post-mortem',
    content: `ETH dropped 11% in under two hours on Tuesday, triggering cascading liquidations across Aave, Morpho, and Compound. Total liquidations exceeded $142M before prices stabilized.

**What happened**

A large leveraged long position on a CEX was force-closed at market, creating sell pressure that fed into spot markets. As ETH dropped, on-chain health factors fell below liquidation thresholds. Liquidation bots competed to close positions, creating additional sell pressure in a reinforcing loop.

**The cascade dynamic**

Each liquidation requires selling the collateral asset (ETH) to repay the debt (usually stablecoins). In a falling market, this selling adds downward pressure, triggering the next wave of liquidations. The dynamic is self-reinforcing until either price recovers or over-leveraged positions are cleared.

**Who got liquidated**

Positions with health factors below 1.3 were particularly vulnerable. Most liquidations occurred in the first 45 minutes of the move, while the final 20 minutes saw lighter volume as over-leveraged positions were cleared.

**Cofano note**

A 1.33 health factor on ETH collateral means a 25% ETH drop triggers liquidation. Tuesday's move was 11%. A health factor above 1.8 would have survived this event with no action required.`,
  },
  {
    tag: 'Regulation',
    cover: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=900&q=80',
    published: true,
    featured: false,
    views: 980,
    locale: 'en',
    title: 'MiCA enforcement timelines: what DeFi protocols need to know',
    content: `The EU's Markets in Crypto-Assets regulation entered full force this quarter, with enforcement timelines now clear for stablecoin issuers and crypto asset service providers.

Key implications for DeFi users and protocols operating in or serving EU users:

**Stablecoin issuers**
USDC and EURC have received full MiCA authorization. USDT remains in a transitional period. Protocols that hold or distribute non-authorized stablecoins to EU users face compliance exposure.

**DEX and protocol operators**
Fully decentralized protocols with no identifiable operator may fall outside MiCA scope, but the definition of "decentralized" remains contested. Protocols with admin keys, upgradeable contracts, and fee-collecting entities are more likely to be treated as CASPs.

**What's still unclear**
Cross-chain lending, yield protocols, and DAO governance structures all sit in regulatory grey zones. Formal guidance from ESMA is expected in Q3.

**Cofano note**

For on-chain users in the EU, the near-term impact is primarily on stablecoin selection and the availability of certain front-end interfaces. The structural impact on DeFi protocols themselves will take years to resolve through enforcement and case law.`,
  },
  {
    tag: 'Market',
    cover: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=900&q=80',
    published: true,
    featured: false,
    views: 1760,
    locale: 'en',
    title: 'DeFi TVL recovers to $94B as risk appetite returns',
    content: `Total Value Locked across DeFi protocols climbed to $94.2 billion this week, recovering from a local low of $81B set during last month's volatility event.

The recovery has been led by liquid staking protocols (primarily Lido) and lending markets (Aave, Morpho, Spark). DEX TVL has lagged, consistent with reduced trading activity relative to Q1.

**Where capital is going**

The inflow pattern shows clear risk-off allocation: capital is preferring yield-bearing stablecoins and liquid staking over leveraged DEX positions. This is constructive — it suggests the market is building a healthier base rather than re-leveraging immediately after a drawdown.

**What's not recovering**

Algorithmic and semi-collateralized stablecoin TVL remains 40% below its pre-March peaks. The market appears to have structurally shifted toward fully-collateralized options following the USDe pressure event in April.

**Cofano note**

TVL recovery doesn't mean risk has decreased — it means capital is returning. For users evaluating new positions, the composition of inflows matters more than the headline number.`,
  },
  {
    tag: 'Protocols',
    cover: 'https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=900&q=80',
    published: true,
    featured: false,
    views: 2210,
    locale: 'en',
    title: 'Curve 3pool sees $200M TVL exit in 48 hours',
    content: `Curve's 3pool — the largest and most liquid stablecoin pool in DeFi — lost $200M in TVL over 48 hours as large LPs exited ahead of an expected rate rebalancing event.

The withdrawal reduced pool depth significantly, increasing slippage for large stablecoin swaps and temporarily distorting the implied prices between USDC, USDT, and DAI.

**Why LPs are leaving**

The yield on the 3pool has compressed as CRV emissions declined following the protocol's recent tokenomics adjustment. LPs are rotating to newer pools offering higher incentivized yields, leaving the 3pool with less competitive returns.

**Market impact**

Reduced Curve 3pool depth matters for the broader DeFi ecosystem. The pool is used as the primary reference for stablecoin prices by several lending protocols. Thin liquidity increases the risk of transient mispricing that oracle systems can inadvertently capture.

**Cofano note**

This is a good example of liquidity risk in action. Deep pools become thin pools as incentives rotate. If your protocol relies on Curve pricing, the liquidity depth of those pools is a risk factor worth monitoring regularly.`,
  },
]

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 12)
  const userPassword = await bcrypt.hash('user123', 12)

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: { passwordHash: adminPassword, role: Role.ADMIN },
    create: { username: 'admin', passwordHash: adminPassword, role: Role.ADMIN },
  })

  const contributor = await prisma.user.upsert({
    where: { username: 'antonio' },
    update: { passwordHash: userPassword, role: Role.CONTRIBUTOR },
    create: { username: 'antonio', passwordHash: userPassword, role: Role.CONTRIBUTOR },
  })

  // Clean existing content
  await prisma.articleTranslation.deleteMany()
  await prisma.article.deleteMany()
  await prisma.newsTranslation.deleteMany()
  await prisma.news.deleteMany()

  // Seed articles
  const authors = [admin, contributor]
  for (let i = 0; i < ARTICLES.length; i++) {
    const { locale, title, content, ...rest } = ARTICLES[i]
    const author = authors[i % authors.length]
    await prisma.article.create({
      data: {
        ...rest,
        authorId: author.id,
        defaultLocale: locale,
        translations: {
          create: {
            locale,
            title,
            content,
            wordCount: wc(content),
            readingTimeMinutes: rt(content),
          },
        },
      },
    })
  }

  // Seed news
  for (let i = 0; i < NEWS.length; i++) {
    const { locale, title, content, ...rest } = NEWS[i]
    const author = authors[i % authors.length]
    await prisma.news.create({
      data: {
        ...rest,
        authorId: author.id,
        defaultLocale: locale,
        translations: {
          create: {
            locale,
            title,
            content,
            wordCount: wc(content),
            readingTimeMinutes: rt(content),
          },
        },
      },
    })
  }

  console.log(`✓ Seeded ${ARTICLES.length} articles and ${NEWS.length} news items`)
  console.log(`  users: admin / antonio`)
  console.log(`  passwords: admin123 / user123`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
