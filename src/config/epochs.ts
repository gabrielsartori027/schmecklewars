/** Section 7.6 — epoch & allocation constants (values are public rules; do not change silently). */
export const RULES_VERSION = "1.1.0";
export const EPOCH_DAYS_DEFAULT = 1;
/** Split of the epoch's INFLOWS (USD at the time of each tx). */
export const SPLIT = { aid: 0.7, ops: 0.2, reserve: 0.1 } as const;
export const THEATER_FLOOR = 0.1;
export const MIN_DROP_USD = 10;
/** Emergency drop trigger: theater hn ≥ 70 for ≥ 6 h (Phase 2). */
export const EMERGENCY_HN = 70;
export const EMERGENCY_HOURS = 6;
export const EMERGENCY_RESERVE = 0.5;
