import type { Tier } from "@/config/tiers";
import type { Shares } from "@/lib/domain/allocation";
import type { EpochWindow } from "@/lib/domain/epochs";
import type { TheaterReading } from "@/lib/domain/theaters";
import type { LogEntry, NationCode, NationStats, Theater, WorldState } from "@/lib/domain/types";

export interface NationView extends NationStats {
  code: NationCode;
  total: number;
  level: { title: string; badge: string; color: string; min: number };
}

export interface ChestView {
  configured: boolean;
  address: string | null;
  balanceEth: number | null;
  balanceStable: number | null;
  stableSymbol: string;
  balanceUsd: number | null;
  ethPriceUsd: number | null;
  aidLifetimeUsd: number;
  nextDropAt: number | null;
  stale: boolean;
}

export interface EpochView extends EpochWindow {
  /** Projected split of the aid pool if the epoch closed now (live share, floor applied). */
  projectedSplit: Shares | null;
  eligibleTheaters: Theater[];
  /** "balance" in Phase 0 (approximation), "inflows" in Phase 1 */
  inflowsMode: "balance" | "inflows";
  inflowsUsd: number | null;
}

/** GET /api/state */
export interface StateResponse {
  ok: true;
  world: "shared" | "offline";
  index: number;
  tier: Tier;
  theaters: Record<Theater, TheaterReading>;
  nations: Record<NationCode, NationView>;
  /** Canonical, un-projected state at `cursor` — what clients fold new events onto. */
  canonical: WorldState;
  epoch: EpochView;
  chest: ChestView;
  eventsToday: number;
  eventCount: number;
  latest: LogEntry[]; // newest first, attacks only, urls resolved
  cursor: string | null;
  generatedAt: number;
}

/** GET /api/events?since=&limit= */
export interface EventsResponse {
  ok: true;
  events: LogEntry[]; // oldest → newest
  cursor: string | null; // id of the last event returned (or the `since` given)
  hasMore: boolean;
  generatedAt: number;
}

export interface ErrorResponse {
  ok: false;
  error: string;
}
