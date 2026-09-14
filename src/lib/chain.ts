import { defineChain } from "viem";

/**
 * Robinhood Chain — Ethereum L2 on the Arbitrum Orbit stack.
 * Values verified against https://docs.robinhood.com/chain/connecting (Sept 2026).
 */
export const ROBINHOOD_CHAIN_ID = 4663;
export const ROBINHOOD_CHAIN_ID_HEX = "0x1237";
export const ROBINHOOD_PUBLIC_RPC = "https://rpc.mainnet.chain.robinhood.com";
export const ROBINHOOD_EXPLORER = "https://robinhoodchain.blockscout.com";

export function robinhoodChain(rpcUrl?: string) {
  return defineChain({
    id: ROBINHOOD_CHAIN_ID,
    name: "Robinhood Chain",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: {
      default: { http: [rpcUrl ?? ROBINHOOD_PUBLIC_RPC] },
    },
    blockExplorers: {
      default: { name: "Blockscout", url: ROBINHOOD_EXPLORER },
    },
  });
}

/** Parameters for `wallet_addEthereumChain` (EIP-3085). Public RPC on purpose: it is what wallets should use. */
export const ADD_CHAIN_PARAMS = {
  chainId: ROBINHOOD_CHAIN_ID_HEX,
  chainName: "Robinhood Chain",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: [ROBINHOOD_PUBLIC_RPC],
  blockExplorerUrls: [ROBINHOOD_EXPLORER],
} as const;
