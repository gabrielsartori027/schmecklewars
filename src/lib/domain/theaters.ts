import { HEAT_CRITICAL_HN, HEAT_DECAY_PER_HOUR, HEAT_FULL } from "@/config/theaters";
import { TYPE_WEIGHT } from "@/config/ww3";
import type { StatKey, Theater, TheaterHeat } from "./types";
import { THEATERS } from "./types";

export const emptyHeat = (): TheaterHeat => ({
  EASTERN_FRONT: 0,
  MIDDLE_EAST: 0,
  INDO_PACIFIC: 0,
  KOREAN_PENINSULA: 0,
  GLOBAL: 0,
});

/** `heat *= (1 − 0.04)^hours` (half-life ≈ 17 h). */
export function decayHeat(heat: TheaterHeat, hours: number): TheaterHeat {
  if (hours <= 0) return { ...heat };
  const f = Math.pow(1 - HEAT_DECAY_PER_HOUR, hours);
  const out = emptyHeat();
  for (const th of THEATERS) out[th] = heat[th] * f;
  return out;
}

/** `heat[th] += sv * TYPE_WEIGHT[tp]` */
export function applyHeatEvent(
  heat: TheaterHeat,
  th: Theater,
  sv: number,
  tp: StatKey,
): TheaterHeat {
  const out = { ...heat };
  out[th] = out[th] + sv * (TYPE_WEIGHT[tp] ?? 1.0);
  return out;
}

export interface TheaterReading {
  code: Theater;
  heat: number;
  /** share of total heat, 0–1 (0 when the world is cold) */
  share: number;
  /** normalized heat 0–100 */
  hn: number;
  tier: "COLD" | "WARM" | "HOT" | "CRITICAL";
}

export function theaterReadings(heat: TheaterHeat): Record<Theater, TheaterReading> {
  const total = THEATERS.reduce((s, th) => s + heat[th], 0);
  const out = {} as Record<Theater, TheaterReading>;
  for (const th of THEATERS) {
    const h = heat[th];
    const hn = Math.min(100, (h / HEAT_FULL) * 100);
    out[th] = {
      code: th,
      heat: h,
      share: total > 0 ? h / total : 0,
      hn,
      tier: hn >= HEAT_CRITICAL_HN ? "CRITICAL" : hn >= 40 ? "HOT" : hn >= 12 ? "WARM" : "COLD",
    };
  }
  return out;
}
