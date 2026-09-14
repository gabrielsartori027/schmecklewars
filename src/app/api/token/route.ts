import { cacheHeaders, clientIp, json } from "@/lib/server/http";
import { getKV } from "@/lib/server/kv";
import { checkRateLimit } from "@/lib/server/rate-limit";
import { readTokenData } from "@/lib/server/token-price";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GeckoTerminal (network `robinhood`) with DexScreener fallback; `indexed:false` until a pool exists. */
export async function GET(req: Request) {
  const kv = getKV();
  if (!(await checkRateLimit(kv, clientIp(req), "token"))) {
    return json(
      { ok: false, error: "rate-limited" },
      { status: 429, headers: { "Retry-After": "30" } },
    );
  }
  try {
    const t = await readTokenData(kv);
    return json({ ok: true, ...t }, { headers: cacheHeaders(10, 60) });
  } catch (err) {
    console.error("[token]", err);
    return json(
      { ok: false, error: "token-unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
