import { EPOCH_DAYS_DEFAULT } from "@/config/epochs";

export interface EpochWindow {
  /** 1-based epoch number; 0 before genesis */
  n: number;
  start: number; // ms UTC
  end: number; // ms UTC (exclusive)
  /** ms until the epoch closes (negative before genesis means "opens in") */
  closesInMs: number;
  genesis: number | null;
}

const DAY_MS = 86_400_000;

/**
 * Epochs are fixed-length windows starting at GENESIS_TS (UTC boundaries follow genesis).
 * Before genesis (or without it) the site shows "The Chest opens at launch".
 */
export function epochAt(
  now: number,
  genesisIso: string | undefined | null,
  epochDays = EPOCH_DAYS_DEFAULT,
): EpochWindow {
  const genesis = genesisIso ? Date.parse(genesisIso) : NaN;
  const len = epochDays * DAY_MS;
  if (Number.isNaN(genesis)) {
    return { n: 0, start: 0, end: 0, closesInMs: 0, genesis: null };
  }
  if (now < genesis) {
    return { n: 0, start: genesis, end: genesis + len, closesInMs: genesis - now, genesis };
  }
  const idx = Math.floor((now - genesis) / len);
  const start = genesis + idx * len;
  return { n: idx + 1, start, end: start + len, closesInMs: start + len - now, genesis };
}
