import { publicEnv as env } from "@/lib/public-env";
import { ROBINHOOD_CHAIN_ID } from "@/lib/chain";

const explorer = env.NEXT_PUBLIC_EXPLORER_URL.replace(/\/$/, "");

export const TOKEN = {
  ca: env.NEXT_PUBLIC_TOKEN_CA ?? null,
  symbol: env.NEXT_PUBLIC_TOKEN_SYMBOL,
  name: env.NEXT_PUBLIC_TOKEN_NAME,
  network: "Robinhood Chain",
  chainId: ROBINHOOD_CHAIN_ID,
  launchpadName: env.NEXT_PUBLIC_LAUNCHPAD_NAME,
  launchpadUrl: env.NEXT_PUBLIC_LAUNCHPAD_URL ?? null,
  swapUrl:
    env.NEXT_PUBLIC_SWAP_URL ??
    (env.NEXT_PUBLIC_TOKEN_CA
      ? `https://app.uniswap.org/explore/tokens/robinhood/${env.NEXT_PUBLIC_TOKEN_CA}`
      : null),
  siteUrl: env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, ""),
} as const;

export const LINKS = {
  explorerAddress: (addr: string) => `${explorer}/address/${addr}`,
  explorerToken: (ca: string) => `${explorer}/token/${ca}`,
  explorerTx: (hash: string) => `${explorer}/tx/${hash}`,
  gecko: (pool: string) => `https://www.geckoterminal.com/robinhood/pools/${pool}`,
  geckoToken: (ca: string) => `https://www.geckoterminal.com/robinhood/tokens/${ca}`,
  /** EIP-681 payment link */
  donate: (addr: string) => `ethereum:${addr}@${ROBINHOOD_CHAIN_ID}`,
  repo: "https://github.com/gabrielsartori027/token",
  bridge: "https://portal.arbitrum.io/bridge?destinationChain=robinhood-chain&sourceChain=ethereum",
  safeApp: "https://app.safe.global",
  robinhoodDocs: "https://docs.robinhood.com/chain",
} as const;
