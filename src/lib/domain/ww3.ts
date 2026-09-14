import {
  TYPE_WEIGHT,
  WW3_BASELINE,
  WW3_DECAY_PER_MINUTE,
  WW3_EVENT_CAP,
  WW3_MAX,
  pairMultiplier,
} from "@/config/ww3";
import { TIERS, type Tier } from "@/config/tiers";
import { round1 } from "@/lib/utils";
import type { NationCode, StatKey } from "./types";

/** `decay(prev, minutes) = max(BASELINE, prev − DECAY*minutes)` — deterministic in time. */
export function decayIndex(prev: number, minutes: number): number {
  if (minutes <= 0) return Math.max(WW3_BASELINE, prev);
  return round1(Math.max(WW3_BASELINE, prev - WW3_DECAY_PER_MINUTE * minutes));
}

export function rawImpact(sv: number, tp: StatKey, a: NationCode, t: NationCode): number {
  return (sv / 10) * (TYPE_WEIGHT[tp] ?? 1.0) * pairMultiplier(a, t) * WW3_EVENT_CAP;
}

/**
 * `raw = (sv/10)*TYPE_WEIGHT[tp]*PAIR_MULT[a-t]*EVENT_CAP ; resistance = max(0.1, 1 − prev/100)`
 * `next = min(MAX, round1(prev + raw*resistance))`
 */
export function applyIndexEvent(
  prev: number,
  ev: { sv: number; tp: StatKey; a: NationCode; t: NationCode },
): number {
  const raw = rawImpact(ev.sv, ev.tp, ev.a, ev.t);
  const resistance = Math.max(0.1, 1 - prev / 100);
  return Math.min(WW3_MAX, round1(prev + raw * resistance));
}

export function tierFor(index: number): Tier {
  return TIERS.find((t) => index <= t.max) ?? TIERS[TIERS.length - 1]!;
}
