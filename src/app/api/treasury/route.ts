import { cacheHeaders, clientIp, json } from "@/lib/server/http";
import { getKV } from "@/lib/server/kv";
import { checkRateLimit } from "@/lib/server/rate-limit";
import { readTreasury } from "@/lib/server/treasury";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Vault balances (ETH + stable) via viem, ETH price, cached 30 s. */
export async function GET(req: Request) {
  const kv = getKV();
  if (!(await checkRateLimit(kv, clientIp(req), "treasury"))) {
    return json(
      { ok: false, error: "rate-limited" },
      { status: 429, headers: { "Retry-After": "30" } },
    );
  }
  try {
    const t = await readTreasury(kv);
    return json({ ok: true, ...t }, { headers: cacheHeaders(30, 120) });
  } catch (err) {
    console.error("[treasury]", err);
    return json(
      { ok: false, error: "treasury-unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
