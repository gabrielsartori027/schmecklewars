import { publicEnv as env } from "@/lib/public-env";

/** Section 7.8 — addresses come from env; the Safe is the ONLY address called "War Chest". */
export const TREASURY = {
  warChest: env.NEXT_PUBLIC_WAR_CHEST_ADDRESS ?? null,
  creatorWallet: env.NEXT_PUBLIC_CREATOR_WALLET ?? null,
  ops: env.NEXT_PUBLIC_OPS_ADDRESS ?? null,
  reserve: env.NEXT_PUBLIC_RESERVE_ADDRESS ?? null,
  stable: {
    address: env.NEXT_PUBLIC_STABLE_ADDRESS ?? null,
    symbol: env.NEXT_PUBLIC_STABLE_SYMBOL,
    decimals: env.NEXT_PUBLIC_STABLE_DECIMALS,
  },
} as const;

/** Pons v2 escrow where the creator share accrues (verified Sept 2026 — see README). */
export const PONS_FEE_ESCROW = "0xd3AFEB2a57f70eF218Aa82451c51B2fb0416Ac9e";
