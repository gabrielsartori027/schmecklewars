/**
 * Shared domain types. Field names of events deliberately mirror the original
 * (`a`, `t`, `h`, `tp`, `sv`, `d`, `url`, `th`) so the model prompt and the log stay compact.
 */

export const NATION_CODES = [
  "USA",
  "ISRAEL",
  "IRAN",
  "FRANCE",
  "RUSSIA",
  "CHINA",
  "NKOREA",
  "UKRAINE",
] as const;
export type NationCode = (typeof NATION_CODES)[number];

export const STAT_KEYS = ["military", "economy", "nuclear", "cyber", "diplomacy", "intel"] as const;
export type StatKey = (typeof STAT_KEYS)[number];

export const THEATERS = [
  "EASTERN_FRONT",
  "MIDDLE_EAST",
  "INDO_PACIFIC",
  "KOREAN_PENINSULA",
  "GLOBAL",
] as const;
export type Theater = (typeof THEATERS)[number];

export type EventKind = "attack" | "source_upgrade";

/** Immutable line of the append-only event log (section 7.5 item 7). */
export interface LogEntry {
  id: string; // ULID — lexicographic order == chronological order
  kind: EventKind;
  receivedAt: number; // ms since epoch, UTC
  a: NationCode;
  t: NationCode;
  h: string; // headline (15–90 chars)
  tp: StatKey;
  sv: number; // severity 1–10 (integer)
  d: string; // YYYY-MM-DD, real date of the event (today or yesterday UTC at ingest time)
  th: Theater;
  url?: string;
  sourceQuality: number;
  query: string;
  modelId: string;
  /** For `source_upgrade`: id of the attack entry whose source is being upgraded. */
  upgrades?: string;
  /** Dev-only. Never produced by the server. */
  simulated?: boolean;
}

export interface NationStats {
  military: number;
  economy: number;
  nuclear: number;
  cyber: number;
  diplomacy: number;
  intel: number;
  xp: number;
  kills: number;
  hits: number;
}

export type TheaterHeat = Record<Theater, number>;

/** Canonical world state = result of folding the log up to `cursor`, projected to `at`. */
export interface WorldState {
  nations: Record<NationCode, NationStats>;
  index: number; // WW3 probability, 1 decimal
  heat: TheaterHeat;
  /** timestamp (ms) the index/heat values refer to — decay is computed from here */
  at: number;
  cursor: string | null; // id of the last folded entry
  eventCount: number; // attacks folded
  /** attack ids → best url after source upgrades */
  urlOverrides: Record<string, string>;
}
