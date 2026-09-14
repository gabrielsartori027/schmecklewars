import type { NationCode, Theater } from "@/lib/domain/types";

export interface TheaterMeta {
  code: Theater;
  label: string;
  color: string;
  coverage: string;
  /** [lonMin, latMin, lonMax, latMax] box drawn on the map (null for GLOBAL). */
  bounds: [number, number, number, number] | null;
  /** Label anchor [lon, lat] — a corner of the box, away from the markers */
  anchor: [number, number] | null;
}

/** Section 7.4 */
export const THEATER_META: Record<Theater, TheaterMeta> = {
  EASTERN_FRONT: {
    code: "EASTERN_FRONT",
    label: "Eastern Front",
    color: "#FFD700",
    coverage: "Russia–Ukraine, NATO–Russia friction",
    bounds: [21, 44, 46, 61],
    anchor: [22, 60],
  },
  MIDDLE_EAST: {
    code: "MIDDLE_EAST",
    label: "Middle East",
    color: "#FF4D00",
    coverage: "Israel–Iran, Gaza, Lebanon, Yemen / Red Sea",
    bounds: [30, 12, 63, 38],
    anchor: [31, 14],
  },
  INDO_PACIFIC: {
    code: "INDO_PACIFIC",
    label: "Indo-Pacific",
    color: "#FF6B00",
    coverage: "China–Taiwan, South China Sea",
    bounds: [105, 4, 134, 31],
    anchor: [106, 6.5],
  },
  KOREAN_PENINSULA: {
    code: "KOREAN_PENINSULA",
    label: "Korean Peninsula",
    color: "#BF40FF",
    coverage: "North Korea",
    bounds: [123.5, 33, 131.5, 43.5],
    anchor: [124.5, 43],
  },
  GLOBAL: {
    code: "GLOBAL",
    label: "Global / Cyber",
    color: "#9AA4AF",
    coverage: "Cyber without geography, unattributed",
    bounds: null,
    anchor: null,
  },
};

export const THEATER_LIST = Object.values(THEATER_META);

/** Fallback when the model does not return `th` (section 7.4). */
export function theaterOf(a: NationCode, t: NationCode): Theater {
  const pair = [a, t];
  if (pair.includes("NKOREA")) return "KOREAN_PENINSULA";
  if (pair.includes("ISRAEL") || pair.includes("IRAN")) return "MIDDLE_EAST";
  if (pair.includes("CHINA")) return "INDO_PACIFIC";
  if (pair.includes("RUSSIA") || pair.includes("UKRAINE")) return "EASTERN_FRONT";
  return "GLOBAL";
}

/** Heat decays 4 % per hour (half-life ≈ 17 h). */
export const HEAT_DECAY_PER_HOUR = 0.04;
/** `hn = min(100, heat / HEAT_FULL * 100)`; hn ≥ 70 is CRITICAL. */
export const HEAT_FULL = 25;
export const HEAT_CRITICAL_HN = 70;
