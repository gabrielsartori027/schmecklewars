import { WW3_BASELINE } from "@/config/ww3";
import { applyAttack, initialNations, type AttackEffect } from "./attacks";
import { applyHeatEvent, decayHeat, emptyHeat } from "./theaters";
import type { LogEntry, WorldState } from "./types";
import { applyIndexEvent, decayIndex } from "./ww3";

/**
 * The world is a deterministic fold over the append-only log.
 *
 * Invariant (tested): fold(all) === fold(tail, seed = fold(head)).
 * To keep it exact, a state's `index`/`heat` always refer to `at` = the time of the LAST
 * ATTACK folded — never to "now". Projection to the present (`project`) is a separate,
 * non-persisted step. `source_upgrade` entries touch neither numbers nor `at`.
 */
export function initialWorld(): WorldState {
  return {
    nations: initialNations(),
    index: WW3_BASELINE,
    heat: emptyHeat(),
    at: 0,
    cursor: null,
    eventCount: 0,
    urlOverrides: {},
  };
}

export interface FoldStep {
  state: WorldState;
  effect: AttackEffect | null;
}

export function foldEntry(state: WorldState, entry: LogEntry): FoldStep {
  if (entry.kind === "source_upgrade") {
    if (!entry.upgrades || !entry.url)
      return { state: { ...state, cursor: entry.id }, effect: null };
    return {
      state: {
        ...state,
        cursor: entry.id,
        urlOverrides: { ...state.urlOverrides, [entry.upgrades]: entry.url },
      },
      effect: null,
    };
  }

  const elapsedMs = state.at > 0 ? Math.max(0, entry.receivedAt - state.at) : 0;
  const minutes = elapsedMs / 60_000;
  const hours = elapsedMs / 3_600_000;

  const decayedIndex = decayIndex(state.index, minutes);
  const decayedHeat = decayHeat(state.heat, hours);

  const { nations, effect } = applyAttack(state.nations, entry);
  const index = applyIndexEvent(decayedIndex, { ...entry, t: effect.t });
  const heat = applyHeatEvent(decayedHeat, entry.th, entry.sv, entry.tp);

  return {
    state: {
      nations,
      index,
      heat,
      at: entry.receivedAt,
      cursor: entry.id,
      eventCount: state.eventCount + 1,
      urlOverrides: state.urlOverrides,
    },
    effect,
  };
}

export function fold(entries: readonly LogEntry[], seed: WorldState = initialWorld()): WorldState {
  let state = seed;
  for (const e of entries) state = foldEntry(state, e).state;
  return state;
}

export interface Projection {
  index: number;
  heat: WorldState["heat"];
  at: number;
}

/** Decay-only projection of a canonical state to `now`. Never persist the result. */
export function project(state: WorldState, now: number): Projection {
  if (state.at <= 0) return { index: state.index, heat: state.heat, at: now };
  const elapsedMs = Math.max(0, now - state.at);
  return {
    index: decayIndex(state.index, elapsedMs / 60_000),
    heat: decayHeat(state.heat, elapsedMs / 3_600_000),
    at: now,
  };
}

/** Resolve the best-known URL of an attack after source upgrades. */
export function urlOf(
  entry: LogEntry,
  state: Pick<WorldState, "urlOverrides">,
): string | undefined {
  return state.urlOverrides[entry.id] ?? entry.url;
}
