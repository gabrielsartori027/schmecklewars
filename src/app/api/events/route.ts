import type { EventsResponse } from "@/lib/api-types";
import { readAfter } from "@/lib/server/event-log";
import { cacheHeaders, clientIp, json, options, PUBLIC_CORS } from "@/lib/server/http";
import { getKV } from "@/lib/server/kv";
import { checkRateLimit } from "@/lib/server/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ULID_RE = /^[0-9A-HJKMNP-TV-Z]{26}$/;

export function OPTIONS() {
  return options();
}

/** `GET /api/events?since=<ulid>&limit=100` — the public, append-only log (oldest → newest). */
export async function GET(req: Request) {
  const kv = getKV();
  if (!(await checkRateLimit(kv, clientIp(req), "events"))) {
    return json(
      { ok: false, error: "rate-limited" },
      { status: 429, headers: { "Retry-After": "30", ...PUBLIC_CORS } },
    );
  }
  const url = new URL(req.url);
  const sinceRaw = url.searchParams.get("since");
  const since = sinceRaw && ULID_RE.test(sinceRaw) ? sinceRaw : null;
  const limit = Math.min(200, Math.max(1, Number(url.searchParams.get("limit") ?? 100) || 100));
  if (sinceRaw && !since)
    return json({ ok: false, error: "bad-cursor" }, { status: 400, headers: PUBLIC_CORS });
  if (!kv) {
    const body: EventsResponse = {
      ok: true,
      events: [],
      cursor: since,
      hasMore: false,
      generatedAt: Date.now(),
    };
    return json(body, { headers: { "Cache-Control": "no-store", ...PUBLIC_CORS } });
  }
  try {
    const events = await readAfter(kv, since, limit + 1);
    const hasMore = events.length > limit;
    const page = hasMore ? events.slice(0, limit) : events;
    const body: EventsResponse = {
      ok: true,
      events: page,
      cursor: page.length ? page[page.length - 1]!.id : since,
      hasMore,
      generatedAt: Date.now(),
    };
    return json(body, { headers: { ...cacheHeaders(15, 60), ...PUBLIC_CORS } });
  } catch (err) {
    console.error("[events]", err);
    return json(
      { ok: false, error: "events-unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store", ...PUBLIC_CORS } },
    );
  }
}
