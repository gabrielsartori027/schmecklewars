/**
 * Public (NEXT_PUBLIC_*) configuration for client and server code — plain parsing, no zod, so the
 * validation library never ships to the browser. Next.js inlines these at build time.
 * Server-only variables live in `@/lib/env` (zod-validated, never imported by client code).
 */

const str = (v: string | undefined, fallback: string): string => {
  const t = v?.trim();
  return t ? t : fallback;
};
const opt = (v: string | undefined): string | undefined => {
  const t = v?.trim();
  return t ? t : undefined;
};
const num = (v: string | undefined, fallback: number): number => {
  const n = Number(v);
  return Number.isFinite(n) && v?.trim() ? n : fallback;
};
const ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;
const address = (v: string | undefined): `0x${string}` | undefined => {
  const t = v?.trim();
  return t && ADDRESS_RE.test(t) ? (t as `0x${string}`) : undefined;
};
const url = (v: string | undefined): string | undefined => {
  const t = v?.trim();
  if (!t) return undefined;
  try {
    new URL(t);
    return t;
  } catch {
    return undefined;
  }
};

export const publicEnv = {
  NEXT_PUBLIC_CHAIN_ID: num(process.env.NEXT_PUBLIC_CHAIN_ID, 4663),
  NEXT_PUBLIC_EXPLORER_URL: str(
    process.env.NEXT_PUBLIC_EXPLORER_URL,
    "https://robinhoodchain.blockscout.com",
  ),
  NEXT_PUBLIC_STABLE_ADDRESS: address(process.env.NEXT_PUBLIC_STABLE_ADDRESS),
  NEXT_PUBLIC_STABLE_SYMBOL: str(process.env.NEXT_PUBLIC_STABLE_SYMBOL, "USDG"),
  NEXT_PUBLIC_STABLE_DECIMALS: num(process.env.NEXT_PUBLIC_STABLE_DECIMALS, 6),
  NEXT_PUBLIC_TOKEN_CA: address(process.env.NEXT_PUBLIC_TOKEN_CA),
  NEXT_PUBLIC_TOKEN_SYMBOL: str(process.env.NEXT_PUBLIC_TOKEN_SYMBOL, "$CHMCO"),
  NEXT_PUBLIC_TOKEN_NAME: str(process.env.NEXT_PUBLIC_TOKEN_NAME, "Schmeckle Coin"),
  NEXT_PUBLIC_LAUNCHPAD_URL: url(process.env.NEXT_PUBLIC_LAUNCHPAD_URL),
  NEXT_PUBLIC_LAUNCHPAD_NAME: str(process.env.NEXT_PUBLIC_LAUNCHPAD_NAME, "Pons"),
  NEXT_PUBLIC_SWAP_URL: url(process.env.NEXT_PUBLIC_SWAP_URL),
  NEXT_PUBLIC_SITE_URL: str(process.env.NEXT_PUBLIC_SITE_URL, "https://schmecklewars.com"),
  NEXT_PUBLIC_WAR_CHEST_ADDRESS: address(process.env.NEXT_PUBLIC_WAR_CHEST_ADDRESS),
  NEXT_PUBLIC_CREATOR_WALLET: address(process.env.NEXT_PUBLIC_CREATOR_WALLET),
  NEXT_PUBLIC_OPS_ADDRESS: address(process.env.NEXT_PUBLIC_OPS_ADDRESS),
  NEXT_PUBLIC_RESERVE_ADDRESS: address(process.env.NEXT_PUBLIC_RESERVE_ADDRESS),
  NEXT_PUBLIC_SIMULATION: opt(process.env.NEXT_PUBLIC_SIMULATION) === "true",
} as const;

/** Simulation is a dev-only toy: never on Vercel production, whatever the env says. */
const vercelEnv = process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.VERCEL_ENV;
export const simulationEnabled = publicEnv.NEXT_PUBLIC_SIMULATION && vercelEnv !== "production";
