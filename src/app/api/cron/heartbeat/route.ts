import { theaterReadings } from "@/lib/domain/theaters";
import { project } from "@/lib/domain/world";
import { isAuthorizedCron } from "@/lib/server/cron-auth";
import { json } from "@/lib/server/http";
import { getKV, KEYS } from "@/lib/server/kv";
import { recomputeSnapshot } from "@/lib/server/snapshot";
import { readTreasury } from "@/lib/server/treasury";

export const runtime = "nodejs";
export const maxDuration = 30;
export const dynamic = "force-dynamic";

/**
 * Hourly. Phase 0: recompute the snapshot, refresh the vault balance cache and record an
 * hourly heat sample (Phase 1 charts need history from day one — it cannot be backfilled).
 */
export async function GET(req: Request) {
  if (!isAuthorizedCron(req)) return json({ ok: false, error: "unauthorized" }, { status: 401 });
  const kv = getKV();
  if (!kv) return json({ skipped: "no-kv" });
  const now = Date.now();
  const state = await recomputeSnapshot(kv);
  const treasury = await readTreasury(kv, true);
  const proj = project(state, now);
  const readings = theaterReadings(proj.heat);
  const hour = Math.floor(now / 3_600_000) * 3_600_000;
  const sample = {
    t: hour,
    index: proj.index,
    heat: proj.heat,
    share: Object.fromEntries(Object.values(readings).map((r) => [r.code, r.share])),
    balanceUsd: treasury.balanceUsd,
  };
  await kv.zaddScore(KEYS.heatHistory, hour, JSON.stringify(sample));
  return json(
    {
      ok: true,
      cursor: state.cursor,
      index: proj.index,
      eventCount: state.eventCount,
      balanceUsd: treasury.balanceUsd,
      sampledAt: hour,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
