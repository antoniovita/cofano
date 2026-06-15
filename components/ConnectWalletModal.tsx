"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wallet, ArrowRight, ChevronRight, ShieldCheck, Zap, Check, Lock, CreditCard, Copy, CheckCheck } from "lucide-react";
import { Btn } from "@/components/ui/Btn";
import { QRCodeSVG } from "qrcode.react";

const MOCK_ADDRESS = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";

const KNOWN_WALLETS = [
  { label: "vitalik.eth",  desc: "Ethereum co-founder",          address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" },
  { label: "punk6529",     desc: "NFT collector & DeFi whale",   address: "0x6CC5F688a315f3dC28A7781717a9A798a59fDA7b" },
  { label: "hayden.eth",   desc: "Uniswap founder",              address: "0x50EC05ADe8280758E2077fcBC08D878D4aef79C3" },
];

const PREVIEW_PROTOCOLS = [
  { name: "Aave v3",    category: "Lending",  value: "$8,420",  pct: 55, color: "bg-amber-400" },
  { name: "Lido",       category: "Staking",  value: "$4,210",  pct: 27, color: "bg-emerald-400" },
  { name: "Uniswap v3", category: "LP",       value: "$2,840",  pct: 18, color: "bg-neutral-400" },
];

const PREVIEW_ALERTS = [
  { text: "Health factor below 1.5", level: "warn" as const },
  { text: "High concentration in Aave", level: "warn" as const },
];

const PLANS = [
  {
    name: "Pay-per-use",
    price: "$4",
    period: "/ scan",
    description: "One scan, no commitment. Credits never expire.",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/ month",
    description: "Unlimited scans + multi-wallet dashboard.",
    highlight: true,
  },
];

const PLAN_FEATURES = [
  "Full risk report",
  "Health factor & liquidation distance",
  "Protocol & chain exposure",
  "7-day risk history",
  "Recommendations",
];


const IS_SUBSCRIBER = false; // mock — replace with real auth check

function Spinner() {
  return (
    <span className="flex items-center gap-2">
      <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
      Processing...
    </span>
  );
}

type Plan  = typeof PLANS[number];
type Props = { onClose: () => void };
type View  = "main" | "paste" | "upgrade" | "checkout";

const VIEW_ORDER: View[] = ["main", "paste", "upgrade", "checkout"];

export function ConnectWalletModal({ onClose }: Props) {
  const router = useRouter();
  const [view, setView]                 = useState<View>("main");
  const [direction, setDirection]       = useState(1);
  const [address, setAddress]           = useState("");
  const [selectedPlan, setSelectedPlan] = useState<typeof PLANS[number] | null>(null);
  const [payMethod, setPayMethod]       = useState<"card" | "crypto" | "pix">("card");
  const [pixCopied, setPixCopied]       = useState(false);
  const [cardNumber, setCardNumber]     = useState("");
  const [expiry, setExpiry]             = useState("");
  const [cvc, setCvc]                   = useState("");
  const [paying, setPaying]             = useState(false);

  const [pendingAddr, setPendingAddr] = useState("");

  const navigate = (next: View) => {
    const dir = VIEW_ORDER.indexOf(next) >= VIEW_ORDER.indexOf(view) ? 1 : -1;
    setDirection(dir);
    setView(next);
  };

  const go = (addr: string) => {
    if (!IS_SUBSCRIBER) {
      setPendingAddr(addr);
      navigate("upgrade");
      return;
    }
    router.push(`/portfolio/scan/${addr}`);
    onClose();
  };

  const selectPlan = (plan: typeof PLANS[number]) => {
    setSelectedPlan(plan);
    navigate("checkout");
  };

  const confirmPurchase = () => {
    setPaying(true);
    setTimeout(() => {
      router.push(`/portfolio/scan/${pendingAddr}`);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      />

      {/* Panel — wide split */}
      <motion.div
        className="relative flex w-full max-w-3xl overflow-hidden rounded-2xl border border-white/8 bg-[#141414] shadow-[0_40px_100px_rgba(0,0,0,0.8)] min-h-160"
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      >

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-7 w-7 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-white/6 hover:text-neutral-300"
        >
          <X size={14} />
        </button>

        {/* Left — form */}
        <div className={`relative flex w-full flex-col overflow-hidden lg:shrink-0 ${view === "checkout" ? "lg:w-full" : "lg:w-105"}`}>
          <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={view}
            custom={direction}
            variants={{
              enter:  (d: number) => ({ x: d * 32, opacity: 0 }),
              center: { x: 0, opacity: 1 },
              exit:   (d: number) => ({ x: d * -32, opacity: 0 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col p-8 w-full h-full"
          >
          {view === "checkout" ? (
            <>
              <button
                onClick={() => navigate("upgrade")}
                className="mb-5 flex items-center gap-1.5 text-[12px] text-neutral-500 transition-colors hover:text-neutral-300"
              >
                ← Back
              </button>

              {/* Plan summary */}
              <div className="rounded-xl border border-white/8 bg-white/2 px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-medium text-white">{selectedPlan?.name}</p>
                  <p className="text-[11px] text-neutral-500">{selectedPlan?.description}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-[1.1rem] font-semibold text-white">{selectedPlan?.price}</span>
                  <span className="ml-1 text-[11px] text-neutral-500">{selectedPlan?.period}</span>
                </div>
              </div>

              {/* Payment method tabs */}
              <div className="mt-5 flex rounded-xl border border-white/8 bg-white/2 p-1">
                {(["card", "crypto", "pix"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setPayMethod(m)}
                    className={`flex-1 rounded-lg py-2 text-[12px] font-medium transition-colors ${
                      payMethod === m
                        ? "bg-white/8 text-white"
                        : "text-neutral-500 hover:text-neutral-300"
                    }`}
                  >
                    {m === "card" ? "Card" : m === "crypto" ? "Crypto" : "PIX"}
                  </button>
                ))}
              </div>

              {/* What's included + trust signals — hidden on PIX */}
              {payMethod !== "pix" && (
                <div className="mt-5 mb-4 space-y-2">
                  {[...PLAN_FEATURES.map((s) => s)].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-[12px] text-neutral-500">
                      <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-white/15" /> {item}
                    </div>
                  ))}
                </div>
              )}

              {/* Card */}
              {payMethod === "card" && (
                <div className="mt-4 flex flex-1 flex-col">
                  <div className="flex-1 space-y-3">
                    <div>
                      <label className="mb-1.5 block text-[11px] text-neutral-500">Card number</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim())}
                          placeholder="1234 5678 9012 3456"
                          className="w-full rounded-xl border border-white/8 bg-white/2 px-4 py-3 pr-10 font-mono text-[13px] text-white placeholder:text-neutral-700 focus:border-white/20 focus:outline-none"
                        />
                        <CreditCard size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1.5 block text-[11px] text-neutral-500">Expiry</label>
                        <input
                          type="text"
                          value={expiry}
                          onChange={(e) => {
                            const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                            setExpiry(v.length > 2 ? `${v.slice(0, 2)}/${v.slice(2)}` : v);
                          }}
                          placeholder="MM/YY"
                          className="w-full rounded-xl border border-white/8 bg-white/2 px-4 py-3 font-mono text-[13px] text-white placeholder:text-neutral-700 focus:border-white/20 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-[11px] text-neutral-500">CVC</label>
                        <input
                          type="text"
                          value={cvc}
                          onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 3))}
                          placeholder="123"
                          className="w-full rounded-xl border border-white/8 bg-white/2 px-4 py-3 font-mono text-[13px] text-white placeholder:text-neutral-700 focus:border-white/20 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-auto pt-5 space-y-2">
                    <Btn variant="primary" className="w-full justify-center" onClick={confirmPurchase}>
                      {paying ? <Spinner /> : <><Lock size={13} /> Pay {selectedPlan?.price}</>}
                    </Btn>
                    <p className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-700">
                      <Lock size={10} /> Secured by Stripe · 256-bit encryption
                    </p>
                  </div>
                </div>
              )}

              {/* Crypto */}
              {payMethod === "crypto" && (
                <div className="mt-4 flex flex-1 flex-col">
                  <div className="flex-1 space-y-3">
                    <p className="text-[12px] text-neutral-500">
                      Send exactly <span className="font-mono text-white">{selectedPlan?.price === "$4" ? "1.82 USDC" : "13.18 USDC"}</span> to the address below on any EVM chain.
                    </p>
                    <div className="rounded-xl border border-white/8 bg-white/2 px-4 py-3">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-neutral-600 mb-1.5">Payment address</p>
                      <p className="font-mono text-[11px] text-neutral-300 break-all">0x71C7656EC7ab88b098defB751B7401B5f6d8976F</p>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl border border-white/6 bg-white/2 px-4 py-3 text-[12px] text-neutral-500">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                      Waiting for on-chain confirmation…
                    </div>
                  </div>
                  <div className="mt-auto pt-5 space-y-2">
                    <Btn variant="secondary" className="w-full justify-center" onClick={confirmPurchase}>
                      {paying ? <Spinner /> : "I've sent the payment"}
                    </Btn>
                    <p className="text-[11px] text-neutral-700 text-center">Accepts USDC · USDT · ETH · Any EVM chain</p>
                  </div>
                </div>
              )}

              {/* PIX */}
              {payMethod === "pix" && (() => {
                const pixValue = selectedPlan?.price === "$4" ? "R$ 20,00" : "R$ 145,00";
                const pixCode  = "00020126580014br.gov.bcb.pix0136a1b2c3d4-e5f6-7890-abcd-ef1234567890520400005303986540520.005802BR5916Cofano Pagamento6009Sao Paulo62140510cofano0001630412AB";
                const copyPix  = () => {
                  navigator.clipboard.writeText(pixCode);
                  setPixCopied(true);
                  setTimeout(() => setPixCopied(false), 2000);
                };
                return (
                  <div className="mt-4 flex flex-1 flex-col">
                    <div className="flex-1 space-y-3">
                      <p className="text-[12px] text-neutral-500">
                        Valor: <span className="font-mono text-white">{pixValue}</span> · Pagamento instantâneo.
                      </p>
                      <div className="flex items-center justify-center rounded-xl border border-white/8 bg-white p-5">
                        <QRCodeSVG
                          value={pixCode}
                          size={148}
                          bgColor="#ffffff"
                          fgColor="#0f0f0f"
                          level="M"
                        />
                      </div>
                      <div className="rounded-xl border border-white/8 bg-white/2 px-4 py-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-[10px] uppercase tracking-[0.18em] text-neutral-600">PIX copia e cola</p>
                          <button
                            onClick={copyPix}
                            className="flex items-center gap-1 text-[11px] transition-colors hover:text-white"
                            style={{ color: pixCopied ? "rgb(52,211,153)" : "rgb(115,115,115)" }}
                          >
                            {pixCopied ? <><CheckCheck size={11} /> Copiado</> : <><Copy size={11} /> Copiar</>}
                          </button>
                        </div>
                        <p className="font-mono text-[10px] text-neutral-500 break-all leading-4">{pixCode}</p>
                      </div>
                    </div>
                    <div className="mt-auto pt-5 space-y-2">
                      <Btn variant="primary" className="w-full justify-center" onClick={confirmPurchase}>
                        {paying ? <Spinner /> : <><Lock size={13} /> Já paguei</>}
                      </Btn>
                      <p className="text-[11px] text-neutral-700 text-center">O acesso é liberado automaticamente após confirmação</p>
                    </div>
                  </div>
                );
              })()}
            </>
          ) : view === "upgrade" ? (
            <>
              <button
                onClick={() => navigate("main")}
                className="mb-5 flex items-center gap-1.5 text-[12px] text-neutral-500 transition-colors hover:text-neutral-300"
              >
                ← Back
              </button>
              <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">Unlock full report</p>
              <h2 className="mt-2 text-[1.4rem] font-semibold leading-tight tracking-tight text-white">
                Choose a plan to continue
              </h2>
              <p className="mt-2 text-[13px] leading-6 text-neutral-400">
                Wallet scans require a plan. Pick pay-per-use or subscribe for unlimited access.
              </p>

              <div className="mt-6 space-y-3">
                {PLANS.map((plan) => (
                  <button
                    key={plan.name}
                    onClick={() => selectPlan(plan)}
                    className={`flex w-full items-start justify-between rounded-xl border px-4 py-4 text-left transition-colors ${
                      plan.highlight
                        ? "border-white/20 bg-white/6 hover:bg-white/8"
                        : "border-white/8 bg-white/2 hover:border-white/15 hover:bg-white/4"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        {plan.highlight && <Zap size={11} className="text-amber-400" />}
                        <span className="text-[13px] font-medium text-white">{plan.name}</span>
                      </div>
                      <p className="mt-0.5 text-[12px] text-neutral-500">{plan.description}</p>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <span className="font-mono text-[1.1rem] font-semibold text-white">{plan.price}</span>
                      <span className="ml-1 text-[11px] text-neutral-500">{plan.period}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-5 flex items-center gap-2 text-[11px] text-neutral-700">
                <Check size={11} className="text-emerald-600" /> Secure checkout · Cancel anytime
              </div>
            </>
          ) : view === "main" ? (
            <>
              <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                Portfolio Risk
              </p>
              <h2 className="mt-2 text-[1.4rem] font-semibold leading-tight tracking-tight text-white">
                Analyze your wallet
              </h2>
              <p className="mt-2 text-[13px] leading-6 text-neutral-400">
                Connect, paste an address, or enter your positions manually.
              </p>

              <div className="mt-6 space-y-2">
                <button
                  onClick={() => go(MOCK_ADDRESS)}
                  className="flex w-full items-center gap-3 rounded-xl border border-white/8 bg-white/2 px-4 py-3.5 text-left transition-colors hover:border-white/15 hover:bg-white/4"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/6">
                    <Wallet size={14} className="text-neutral-300" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[13px] font-medium text-white">WalletConnect</div>
                    <div className="text-[11px] text-neutral-500">MetaMask, Rainbow, Coinbase and more</div>
                  </div>
                  <ArrowRight size={13} className="text-neutral-600" />
                </button>

                <button
                  onClick={() => navigate("paste")}
                  className="flex w-full items-center gap-3 rounded-xl border border-white/8 bg-white/2 px-4 py-3.5 text-left transition-colors hover:border-white/15 hover:bg-white/4"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/6 font-mono text-[11px] text-neutral-400">
                    0x
                  </div>
                  <div className="flex-1">
                    <div className="text-[13px] font-medium text-white">Paste address</div>
                    <div className="text-[11px] text-neutral-500">Any public EVM wallet address</div>
                  </div>
                  <ArrowRight size={13} className="text-neutral-600" />
                </button>

                <div className="relative flex items-center gap-3 py-1">
                  <div className="h-px flex-1 bg-white/6" />
                  <span className="text-[11px] text-neutral-600">or</span>
                  <div className="h-px flex-1 bg-white/6" />
                </div>

                <button
                  onClick={() => go("manual")}
                  className="flex w-full items-center gap-3 rounded-xl border border-white/6 px-4 py-3 text-left transition-colors hover:border-white/12 hover:bg-white/2"
                >
                  <div className="flex-1 text-[13px] text-neutral-400">
                    Enter positions manually
                  </div>
                  <ChevronRight size={13} className="text-neutral-600" />
                </button>
              </div>

              <p className="mt-6 text-[11px] text-neutral-700">
                Read-only · No private key required
              </p>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("main")}
                className="mb-5 flex items-center gap-1.5 text-[12px] text-neutral-500 transition-colors hover:text-neutral-300"
              >
                ← Back
              </button>
              <h2 className="text-[1.4rem] font-semibold leading-tight tracking-tight text-white">
                Paste wallet address
              </h2>
              <p className="mt-1.5 text-[13px] text-neutral-400">
                Any public EVM address. Read-only, no key required.
              </p>
              <div className="mt-5 space-y-3">
                <input
                  type="text"
                  autoFocus
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && address.trim()) go(address.trim()); }}
                  placeholder="0x..."
                  className="w-full rounded-xl border border-white/8 bg-white/2 px-4 py-3 font-mono text-[13px] text-white placeholder:text-neutral-700 focus:border-white/20 focus:outline-none"
                />
                <Btn
                  variant="primary"
                  className="w-full justify-center"
                  onClick={() => { if (address.trim()) go(address.trim()); }}
                >
                  Analyze wallet <ArrowRight size={13} />
                </Btn>
              </div>

              <div className="mt-6">
                <p className="mb-2.5 text-[11px] text-neutral-600">Try with a known wallet</p>
                <div className="space-y-1.5">
                  {KNOWN_WALLETS.map((w) => (
                    <button
                      key={w.address}
                      onClick={() => setAddress(w.address)}
                      className="flex w-full items-center justify-between rounded-xl border border-white/6 px-3 py-2.5 text-left transition-colors hover:border-white/12 hover:bg-white/2"
                    >
                      <div>
                        <div className="text-[13px] font-medium text-neutral-300">{w.label}</div>
                        <div className="text-[11px] text-neutral-600">{w.desc}</div>
                      </div>
                      <ChevronRight size={13} className="shrink-0 text-neutral-700" />
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
          </motion.div>
          </AnimatePresence>
        </div>

        {/* Right — preview (desktop only, hidden on checkout) */}
        <div className={`hidden flex-1 flex-col justify-between border-l border-white/6 bg-white/2 p-8 ${view === "checkout" ? "" : "lg:flex"}`}>
          <div>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-neutral-500">
              <ShieldCheck size={12} className="text-neutral-600" />
              Portfolio preview
            </div>

            {/* Total value */}
            <div className="mt-6">
              <p className="text-[11px] text-neutral-600">Total value</p>
              <p className="mt-1 font-mono text-[2.4rem] font-semibold leading-none tracking-tight text-white">
                $15,470
              </p>
              <p className="mt-1.5 text-[12px] text-emerald-400">+2.4% this week</p>
            </div>

            {/* Protocol breakdown */}
            <div className="mt-7">
              <p className="mb-3 text-[11px] uppercase tracking-[0.18em] text-neutral-600">
                Protocol exposure
              </p>
              <div className="space-y-3">
                {PREVIEW_PROTOCOLS.map((p) => (
                  <div key={p.name}>
                    <div className="mb-1.5 flex items-center justify-between text-[12px]">
                      <div className="flex items-center gap-2">
                        <div className={`h-1.5 w-1.5 rounded-full ${p.color}`} />
                        <span className="text-neutral-300">{p.name}</span>
                        <span className="text-neutral-600">{p.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-neutral-400">{p.value}</span>
                        <span className="font-mono text-[11px] text-neutral-600">{p.pct}%</span>
                      </div>
                    </div>
                    <div className="h-0.5 w-full overflow-hidden rounded-full bg-white/6">
                      <div
                        className={`h-full rounded-full ${p.color} opacity-60`}
                        style={{ width: `${p.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alerts */}
            <div className="mt-7">
              <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-neutral-600">
                Alerts
              </p>
              <div className="space-y-1.5">
                {PREVIEW_ALERTS.map((a) => (
                  <div key={a.text} className="flex items-center gap-2 text-[12px] text-amber-400">
                    <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                    {a.text}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="mt-6 text-[11px] text-neutral-700">
            Sample data · Connect to see your actual portfolio
          </p>
        </div>
      </motion.div>
    </div>
  );
}
