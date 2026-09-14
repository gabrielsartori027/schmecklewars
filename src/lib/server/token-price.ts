import "server-only";
import { env } from "@/lib/env";
import { KEYS, type KV } from "./kv";

export interface TokenData {
  configured: boolean;
  indexed: boolean;
  source: "geckoterminal" | "dexscreener" | null;
  price: number | null;
  marketCap: number | null; // market cap or FDV
  fdv: number | null;
  volume24h: number | null;
  liquidity: number | null;
  poolAddress: string | null;
  poolUrl: string | null;
  change5m: number | null;
  change1h: number | null;
  change24h: number | null;
  totalSupply: number | null;
  fetchedAt: number;
}

const CACHE_TTL_S = 10;

const num = (v: unknown): number | null => {
  const n = typeof v === "string" ? Number(v) : typeof v === "number" ? v : NaN;
  return Number.isFinite(n) ? n : null;
};

async function fromGeckoTerminal(ca: string): Promise<TokenData | null> {
  const base = `https://api.geckoterminal.com/api/v2/networks/robinhood/tokens/${ca}`;
  const headers = { accept: "application/json;version=20230302" };
  const [tokRes, poolRes] = await Promise.all([
    fetch(base, { headers, signal: AbortSignal.timeout(6_000), cache: "no-store" }),
    fetch(`${base}/pools?page=1`, {
      headers,
      signal: AbortSignal.timeout(6_000),
      cache: "no-store",
    }),
  ]);
  if (!tokRes.ok) return null;
  const tok = (await tokRes.json()) as { data?: { attributes?: Record<string, unknown> } };
  const a = tok.data?.attributes ?? {};
  const price = num(a.price_usd);
  if (price === null) return null;
  let pool: Record<string, unknown> | null = null;
  let poolAddress: string | null = null;
  if (poolRes.ok) {
    const pools = (await poolRes.json()) as { data?: { attributes?: Record<string, unknown> }[] };
    const first = pools.data?.[0];
    pool = first?.attributes ?? null;
    poolAddress = typeof pool?.address === "string" ? pool.address : null;
  }
  const change = (pool?.price_change_percentage ?? {}) as Record<string, unknown>;
  const vol = (pool?.volume_usd ?? {}) as Record<string, unknown>;
  const totalSupply = num(a.total_supply);
  const decimals = num(a.decimals) ?? 18;
  return {
    configured: true,
    indexed: true,
    source: "geckoterminal",
    price,
    marketCap: num(a.market_cap_usd) ?? num(a.fdv_usd),
    fdv: num(a.fdv_usd),
    volume24h: num(a.volume_usd && (a.volume_usd as Record<string, unknown>).h24) ?? num(vol.h24),
    liquidity: num(a.total_reserve_in_usd) ?? num(pool?.reserve_in_usd),
    poolAddress,
    poolUrl: poolAddress ? `https://www.geckoterminal.com/robinhood/pools/${poolAddress}` : null,
    change5m: num(change.m5),
    change1h: num(change.h1),
    change24h: num(change.h24),
    totalSupply: totalSupply === null ? null : totalSupply / 10 ** decimals,
    fetchedAt: Date.now(),
  };
}

async function fromDexScreener(ca: string): Promise<TokenData | null> {
  const r = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${ca}`, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(6_000),
    cache: "no-store",
  });
  if (!r.ok) return null;
  const j = (await r.json()) as { pairs?: Record<string, unknown>[] | null };
  const pairs = (j.pairs ?? []).filter(
    (p) => p.chainId === "robinhood" || p.chainId === "robinhoodchain",
  );
  const list = pairs.length ? pairs : (j.pairs ?? []);
  if (!list.length) return null;
  const best = [...list].sort(
    (x, y) =>
      (num((y.liquidity as Record<string, unknown>)?.usd) ?? 0) -
      (num((x.liquidity as Record<string, unknown>)?.usd) ?? 0),
  )[0]!;
  const price = num(best.priceUsd);
  if (price === null) return null;
  const pc = (best.priceChange ?? {}) as Record<string, unknown>;
  const vol = (best.volume ?? {}) as Record<string, unknown>;
  const fdv = num(best.fdv);
  return {
    configured: true,
    indexed: true,
    source: "dexscreener",
    price,
    marketCap: num(best.marketCap) ?? fdv,
    fdv,
    volume24h: num(vol.h24),
    liquidity: num((best.liquidity as Record<string, unknown>)?.usd),
    poolAddress: typeof best.pairAddress === "string" ? best.pairAddress : null,
    poolUrl: typeof best.url === "string" ? best.url : null,
    change5m: num(pc.m5),
    change1h: num(pc.h1),
    change24h: num(pc.h24),
    totalSupply: fdv !== null && price > 0 ? Math.round(fdv / price) : null,
    fetchedAt: Date.now(),
  };
}

export async function readTokenData(kv: KV | null): Promise<TokenData> {
  const ca = env.NEXT_PUBLIC_TOKEN_CA;
  const empty: TokenData = {
    configured: Boolean(ca),
    indexed: false,
    source: null,
    price: null,
    marketCap: null,
    fdv: null,
    volume24h: null,
    liquidity: null,
    poolAddress: null,
    poolUrl: null,
    change5m: null,
    change1h: null,
    change24h: null,
    totalSupply: null,
    fetchedAt: Date.now(),
  };
  if (!ca) return empty;
  if (kv) {
    const cached = await kv.get<TokenData>(KEYS.token);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_S * 1000) return cached;
  }
  let data: TokenData | null = null;
  try {
    data = await fromGeckoTerminal(ca);
  } catch {
    data = null;
  }
  if (!data) {
    try {
      data = await fromDexScreener(ca);
    } catch {
      data = null;
    }
  }
  const out = data ?? empty; // not indexed yet → "Price feed connecting…"
  if (kv) await kv.set(KEYS.token, out, { ex: 120 });
  return out;
}
