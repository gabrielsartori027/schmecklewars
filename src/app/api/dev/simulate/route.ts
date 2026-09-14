import { NATIONS } from "@/config/nations";
import { theaterOf } from "@/config/theaters";
import { NATION_CODES, STAT_KEYS, type LogEntry, type NationCode } from "@/lib/domain/types";
import { appendEntries, newEntryId } from "@/lib/server/event-log";
import { json } from "@/lib/server/http";
import { getKV } from "@/lib/server/kv";
import { recomputeSnapshot } from "@/lib/server/snapshot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HEADLINES = [
  "SIMULATION — {A} launches missile strike on {T} air base near the border",
  "SIMULATION — {A} drone attack hits {T} ammunition depot, troops deployed",
  "SIMULATION — {A} navy intercepts {T} warship convoy in contested waters",
  "SIMULATION — {A} cyber attack disrupts {T} military infrastructure",
];

/**
 * DEV ONLY. Appends fake, clearly-labelled events to the in-memory world so the
 * choreography can be tested. Answers 404 on Vercel production and refuses to touch Upstash.
 */
export async function POST(req: Request) {
  const kv = getKV();
  // Never on Vercel production, never against the real (Upstash-backed) world.
  if (process.env.VERCEL_ENV === "production" || !kv || kv.kind !== "memory") {
    return json({ ok: false, error: "not-found" }, { status: 404 });
  }
  const url = new URL(req.url);
  const n = Math.min(20, Math.max(1, Number(url.searchParams.get("n") ?? 3) || 3));
  const now = Date.now();
  const entries: LogEntry[] = [];
  for (let i = 0; i < n; i++) {
    const a = NATION_CODES[Math.floor(Math.random() * NATION_CODES.length)]!;
    let t: NationCode = NATION_CODES[Math.floor(Math.random() * NATION_CODES.length)]!;
    if (t === a) t = NATION_CODES[(NATION_CODES.indexOf(a) + 1) % NATION_CODES.length]!;
    const tp = STAT_KEYS[Math.floor(Math.random() * 4)]!; // military|economy|nuclear|cyber
    const sv = 1 + Math.floor(Math.random() * 10);
    const receivedAt = now + i;
    const h = HEADLINES[i % HEADLINES.length]!.replace("{A}", NATIONS[a].name)
      .replace("{T}", NATIONS[t].name)
      .slice(0, 90);
    entries.push({
      id: newEntryId(receivedAt),
      kind: "attack",
      receivedAt,
      a,
      t,
      h,
      tp,
      sv,
      d: new Date(receivedAt).toISOString().slice(0, 10),
      th: theaterOf(a, t),
      sourceQuality: 5,
      query: "simulation",
      modelId: "simulation",
      simulated: true,
    });
  }
  await appendEntries(kv, entries);
  const state = await recomputeSnapshot(kv);
  return json({ ok: true, appended: entries.length, cursor: state.cursor, index: state.index });
}
