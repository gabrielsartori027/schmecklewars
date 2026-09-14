import "server-only";
import { createPublicClient, erc20Abi, http, type Address } from "viem";
import { robinhoodChain, ROBINHOOD_PUBLIC_RPC } from "@/lib/chain";
import { env } from "@/lib/env";
import { KEYS, type KV } from "./kv";

export interface TreasurySnapshot {
  configured: boolean;
  address: Address | null;
  chainId: number;
  balanceWei: string | null; // bigint as string
  balanceEth: number | null;
  stable: {
    symbol: string;
    address: Address | null;
    decimals: number;
    raw: string | null;
    amount: number | null;
  };
  ethPriceUsd: number | null;
  balanceUsd: number | null;
  /** Phase 0: nothing has been sent yet; Phase 1 sums Verified aid drops. */
  aidLifetimeUsd: number;
  fetchedAt: number;
  stale: boolean;
  error?: string;
}

const CACHE_TTL_S = 30;

function client() {
  const url = env.RPC_URL ?? ROBINHOOD_PUBLIC_RPC;
  return createPublicClient({
    chain: robinhoodChain(url),
    transport: http(url, { timeout: 8_000 }),
  });
}

async function fetchEthPriceUsd(): Promise<number | null> {
  // Primary: CoinGecko simple price. Fallback: GeckoTerminal WETH on Robinhood Chain.
  try {
    const r = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd",
      {
        headers: { accept: "application/json" },
        signal: AbortSignal.timeout(6_000),
        cache: "no-store",
      },
    );
    if (r.ok) {
      const j = (await r.json()) as { ethereum?: { usd?: number } };
      if (typeof j.ethereum?.usd === "number") return j.ethereum.usd;
    }
  } catch {
    /* fall through */
  }
  try {
    const r = await fetch(
      "https://api.geckoterminal.com/api/v2/networks/robinhood/tokens/0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73",
      {
        headers: { accept: "application/json" },
        signal: AbortSignal.timeout(6_000),
        cache: "no-store",
      },
    );
    if (r.ok) {
      const j = (await r.json()) as { data?: { attributes?: { price_usd?: string } } };
      const p = Number(j.data?.attributes?.price_usd);
      if (Number.isFinite(p) && p > 0) return p;
    }
  } catch {
    /* give up: price unknown, never invented */
  }
  return null;
}

export async function readTreasury(kv: KV | null, force = false): Promise<TreasurySnapshot> {
  const address = (env.NEXT_PUBLIC_WAR_CHEST_ADDRESS ?? null) as Address | null;
  const stableAddress = (env.NEXT_PUBLIC_STABLE_ADDRESS ?? null) as Address | null;
  const base: TreasurySnapshot = {
    configured: address !== null,
    address,
    chainId: env.NEXT_PUBLIC_CHAIN_ID,
    balanceWei: null,
    balanceEth: null,
    stable: {
      symbol: env.NEXT_PUBLIC_STABLE_SYMBOL,
      address: stableAddress,
      decimals: env.NEXT_PUBLIC_STABLE_DECIMALS,
      raw: null,
      amount: null,
    },
    ethPriceUsd: null,
    balanceUsd: null,
    aidLifetimeUsd: 0,
    fetchedAt: Date.now(),
    stale: false,
  };
  if (!address) return base;

  if (!force && kv) {
    const cached = await kv.get<TreasurySnapshot>(KEYS.treasury);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_S * 1000) return cached;
  }

  const c = client();
  let balanceWei: bigint | null = null;
  let stableRaw: bigint | null = null;
  let error: string | undefined;
  try {
    balanceWei = await c.getBalance({ address });
    if (stableAddress) {
      stableRaw = await c.readContract({
        address: stableAddress,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [address],
      });
    }
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }
  const ethPriceUsd = await fetchEthPriceUsd();

  if (balanceWei === null) {
    // RPC failed: serve the last known values, flagged stale — never a made-up number.
    const cached = kv ? await kv.get<TreasurySnapshot>(KEYS.treasury) : null;
    if (cached) return { ...cached, stale: true, error };
    return { ...base, stale: true, error };
  }

  const balanceEth = Number(balanceWei) / 1e18;
  const stableAmount =
    stableRaw === null ? null : Number(stableRaw) / 10 ** env.NEXT_PUBLIC_STABLE_DECIMALS;
  const balanceUsd = ethPriceUsd === null ? null : balanceEth * ethPriceUsd + (stableAmount ?? 0);
  const snap: TreasurySnapshot = {
    ...base,
    balanceWei: balanceWei.toString(),
    balanceEth,
    stable: { ...base.stable, raw: stableRaw?.toString() ?? null, amount: stableAmount },
    ethPriceUsd,
    balanceUsd,
    fetchedAt: Date.now(),
    stale: false,
    error,
  };
  if (kv) await kv.set(KEYS.treasury, snap, { ex: 3600 });
  return snap;
}
