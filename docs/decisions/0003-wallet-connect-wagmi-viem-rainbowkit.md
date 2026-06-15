# ADR 0003: Wallet connect — wagmi + viem + RainbowKit

**Date:** 2026-06-11
**Status:** Accepted

## Decision

Use **wagmi** as the React hooks layer for wallet state, **viem** as the low-level EVM interaction library, and **RainbowKit** as the wallet connection UI.

## Rationale

| Concern | Choice | Why |
|---|---|---|
| EVM reads and writes | viem | Type-safe, tree-shakeable, actively maintained, de facto standard for new EVM tooling |
| React state management | wagmi | Built on top of viem + TanStack Query, provides hooks for balance, account, chain, contract reads |
| Connection UI | RainbowKit | Built on wagmi, good UX defaults, supports 300+ wallets, customizable theme |

### Why not alternatives

- **web3.js** — legacy, large bundle, being phased out across the ecosystem
- **ethers.js** — still widely used but viem has better TypeScript ergonomics and is lighter
- **Web3Modal (WalletConnect)** — valid alternative to RainbowKit but more opinionated about WalletConnect specifically; RainbowKit is more flexible and has better DX
- **ConnectKit** — alternative to RainbowKit, fewer wallet options, less community adoption

## Integration notes

- wagmi requires a `WagmiConfig` provider wrapping the app — goes in `app/layout.tsx`
- RainbowKit requires `RainbowKitProvider` inside `WagmiConfig`
- Both providers are client-side only — wrap in a `"use client"` component before placing in the layout
- Wallet reads (balances, positions) are always read-only — no signing required for Portfolio Risk scans
- `viem` is used directly for any raw RPC calls not covered by wagmi hooks

## Supported chains at launch

To be decided in a future ADR alongside the on-chain data source decision. Start with Ethereum mainnet and expand.

## Dependencies to add

```bash
npm install wagmi viem @rainbow-me/rainbowkit @tanstack/react-query
```
