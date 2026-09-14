import { cacheHeaders, clientIp, json, options, PUBLIC_CORS } from "@/lib/server/http";
import { getKV } from "@/lib/server/kv";
import { checkRateLimit } from "@/lib/server/rate-limit";
import { buildState } from "@/lib/server/state";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function OPTIONS() {
  return options();
}

/** Canonical world, projected to now. Public, read-only, CORS open for audit. */
export async function GET(req: Request) {
  const kv = getKV();
  if (!(await checkRateLimit(kv, clientIp(req), "state"))) {
    return json(
      { ok: false, error: "rate-limited" },
      { status: 429, headers: { "Retry-After": "30", ...PUBLIC_CORS } },
    );
  }
  try {
    const state = await buildState(kv);
    return json(state, { headers: { ...cacheHeaders(30, 120), ...PUBLIC_CORS } });
  } catch (err) {
    console.error("[state]", err);
    return json(
      { ok: false, error: "state-unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store", ...PUBLIC_CORS } },
    );
  }
}
