import "server-only";
import { PARTNERS } from "@/config/partners";
import { env } from "@/lib/env";
import type { EpochView, NationView, StateResponse } from "@/lib/api-types";
import { allocateShares } from "@/lib/domain/allocation";
import { totalPower } from "@/lib/domain/attacks";
import { epochAt } from "@/lib/domain/epochs";
import { evolutionFor } from "@/lib/domain/evolution";
import { theaterReadings } from "@/lib/domain/theaters";
import { NATION_CODES, type Theater, type WorldState } from "@/lib/domain/types";
import { project, urlOf } from "@/lib/domain/world";
import { tierFor } from "@/lib/domain/ww3";
import { countAfter, cursorAt, readLast } from "./event-log";
import type { KV } from "./kv";
import { loadCanonical } from "./snapshot";
import { readTreasury } from "./treasury";

export function eligibleTheaters(): Theater[] {
  const set = new Set<Theater>();
  for (const p of PARTNERS)
    if (p.status === "Confirmed" && p.confirmationUrl) for (const th of p.theaters) set.add(th);
  return [...set];
}

export function buildEpochView(
  state: WorldState,
  now: number,
  balanceUsd: number | null,
): EpochView {
  const window = epochAt(now, env.GENESIS_TS, env.EPOCH_DAYS);
  const readings = theaterReadings(project(state, now).heat);
  const share = {
    EASTERN_FRONT: readings.EASTERN_FRONT.share,
    MIDDLE_EAST: readings.MIDDLE_EAST.share,
    INDO_PACIFIC: readings.INDO_PACIFIC.share,
    KOREAN_PENINSULA: readings.KOREAN_PENINSULA.share,
    GLOBAL: readings.GLOBAL.share,
  };
  const eligible = eligibleTheaters();
  return {
    ...window,
    projectedSplit: allocateShares(share, new Set(eligible)),
    eligibleTheaters: eligible,
    inflowsMode: "balance",
    inflowsUsd: balanceUsd,
  };
}

export async function buildState(kv: KV | null, now = Date.now()): Promise<StateResponse> {
  const state = kv ? await loadCanonical(kv) : null;
  const canonical: WorldState = state ?? (await import("@/lib/domain/world")).initialWorld();
  const proj = project(canonical, now);
  const theaters = theaterReadings(proj.heat);

  const nations = {} as StateResponse["nations"];
  for (const code of NATION_CODES) {
    const s = canonical.nations[code];
    const view: NationView = { ...s, code, total: totalPower(s), level: evolutionFor(s.xp) };
    nations[code] = view;
  }

  const treasury = await readTreasury(kv);
  const epoch = buildEpochView(canonical, now, treasury.balanceUsd);
  const midnight = Date.UTC(
    new Date(now).getUTCFullYear(),
    new Date(now).getUTCMonth(),
    new Date(now).getUTCDate(),
  );
  const eventsToday = kv ? await countAfter(kv, cursorAt(midnight)) : 0;
  const recent = kv ? await readLast(kv, 40) : [];
  const latest = recent
    .filter((e) => e.kind === "attack")
    .map((e) => ({ ...e, url: urlOf(e, canonical) }))
    .reverse()
    .slice(0, 20);

  return {
    ok: true,
    world: kv ? "shared" : "offline",
    index: proj.index,
    tier: tierFor(proj.index),
    theaters,
    nations,
    canonical,
    epoch,
    chest: {
      configured: treasury.configured,
      address: treasury.address,
      balanceEth: treasury.balanceEth,
      balanceStable: treasury.stable.amount,
      stableSymbol: treasury.stable.symbol,
      balanceUsd: treasury.balanceUsd,
      ethPriceUsd: treasury.ethPriceUsd,
      aidLifetimeUsd: treasury.aidLifetimeUsd,
      nextDropAt: epoch.genesis ? epoch.end : null,
      stale: treasury.stale,
    },
    eventsToday,
    eventCount: canonical.eventCount,
    latest,
    cursor: canonical.cursor,
    generatedAt: now,
  };
}
