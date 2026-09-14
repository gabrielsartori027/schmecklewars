import { SPLIT, THEATER_FLOOR } from "@/config/epochs";
import type { Theater } from "./types";
import { THEATERS } from "./types";

export type Shares = Record<Theater, number>;

/**
 * Allocate an aid pool across eligible theaters from heat shares:
 * ineligible shares are redistributed, a floor is applied to every eligible theater and
 * the result is renormalized. Returns null when no theater is eligible (funds carry over).
 * Pure and deterministic — the same function will run at epoch close (Phase 1).
 */
export function allocateShares(
  share: Shares,
  eligible: ReadonlySet<Theater>,
  floor = THEATER_FLOOR,
): Shares | null {
  const elig = THEATERS.filter((th) => eligible.has(th));
  if (elig.length === 0) return null;
  const total = elig.reduce((s, th) => s + Math.max(0, share[th]), 0);
  // No heat anywhere: split equally.
  let out: Shares = zeroShares();
  if (total <= 0) {
    for (const th of elig) out[th] = 1 / elig.length;
    return out;
  }
  for (const th of elig) out[th] = Math.max(0, share[th]) / total;
  if (floor * elig.length >= 1) {
    for (const th of elig) out[th] = 1 / elig.length;
    return out;
  }
  // Water-filling: raise everything below the floor, take the excess from the rest, repeat.
  for (let i = 0; i < 10; i++) {
    const below = elig.filter((th) => out[th] < floor);
    if (below.length === 0) break;
    const above = elig.filter((th) => out[th] >= floor);
    const deficit = below.reduce((s, th) => s + (floor - out[th]), 0);
    const aboveExcess = above.reduce((s, th) => s + (out[th] - floor), 0);
    const next: Shares = { ...out };
    for (const th of below) next[th] = floor;
    for (const th of above) {
      const take = aboveExcess > 0 ? ((out[th] - floor) / aboveExcess) * deficit : 0;
      next[th] = out[th] - take;
    }
    out = next;
  }
  const sum = elig.reduce((s, th) => s + out[th], 0);
  for (const th of elig) out[th] = out[th] / sum;
  return out;
}

export function zeroShares(): Shares {
  return { EASTERN_FRONT: 0, MIDDLE_EAST: 0, INDO_PACIFIC: 0, KOREAN_PENINSULA: 0, GLOBAL: 0 };
}

/** 70 / 20 / 10 of the epoch's inflows. */
export function splitInflows(inflowsUsd: number) {
  const aid = Math.round(inflowsUsd * SPLIT.aid * 100) / 100;
  const ops = Math.round(inflowsUsd * SPLIT.ops * 100) / 100;
  const reserve = Math.round((inflowsUsd - aid - ops) * 100) / 100;
  return { aid, ops, reserve };
}
