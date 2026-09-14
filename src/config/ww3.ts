import type { NationCode, StatKey } from "@/lib/domain/types";

/** Section 7.3 — canonical WW3 Probability Index constants (identical to the original). */
export const WW3_BASELINE = 19.5;
export const WW3_MAX = 95;
/** % decay per minute toward baseline (de-escalation). */
export const WW3_DECAY_PER_MINUTE = 0.15;
/** Max % a single event can add (before resistance). */
export const WW3_EVENT_CAP = 0.8;

/** Nuclear events are disproportionately dangerous. */
export const TYPE_WEIGHT: Record<StatKey, number> = {
  nuclear: 2.8,
  military: 1.0,
  cyber: 0.8,
  intel: 0.6,
  diplomacy: 0.3,
  economy: 0.2,
};

/**
 * Country-pair escalation multipliers (symmetric). Everything else is 1.0.
 * RUSSIA-UKRAINE is new (prompt §7.3); the rest is the original `ESCALATION_PAIRS`.
 */
export const PAIR_MULT: ReadonlyArray<[NationCode, NationCode, number, string]> = [
  ["USA", "RUSSIA", 2.5, "Direct superpower confrontation"],
  ["USA", "CHINA", 2.2, "Pacific nuclear flashpoint"],
  ["ISRAEL", "IRAN", 1.8, "Could draw in USA/Russia"],
  ["RUSSIA", "FRANCE", 1.6, "NATO Article 5 trigger"],
  ["USA", "IRAN", 1.4, "Gulf escalation"],
  ["NKOREA", "USA", 1.5, "Nuclear wildcard"],
  ["CHINA", "NKOREA", 0.8, "Aligned neighbours"],
  ["RUSSIA", "UKRAINE", 1.2, "Active full-scale war"],
];

export function pairMultiplier(a: NationCode, t: NationCode): number {
  for (const [x, y, m] of PAIR_MULT) {
    if ((x === a && y === t) || (x === t && y === a)) return m;
  }
  return 1.0;
}
