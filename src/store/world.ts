"use client";

import { create } from "zustand";
import { DEFAULT_RICK_LINE, RICK_LINES } from "@/config/rick-lines";
import type { EvolutionLevel } from "@/config/evolution";
import type { ChestView, EpochView, StateResponse } from "@/lib/api-types";
import { attackEffect, type AttackEffect } from "@/lib/domain/attacks";
import { evolutionFor } from "@/lib/domain/evolution";
import type { LogEntry, NationCode, WorldState } from "@/lib/domain/types";
import { foldEntry, initialWorld, urlOf } from "@/lib/domain/world";
import { fnv1a } from "@/lib/utils";

export const ATTACK_DURATION_MS = 6000;
export const ATTACK_GAP_MS = 800;
export const QUEUE_MAX = 15;
/** When a burst arrives, only the N newest are animated; the rest are folded instantly. */
export const ANIMATE_NEWEST = 3;
export const EVENTS_KEEP = 120;

export interface ActiveAttack {
  key: string;
  entry: LogEntry;
  effect: AttackEffect;
  rickLine: string;
  startedAt: number;
}

export interface LevelUp {
  code: NationCode;
  level: EvolutionLevel;
}

export type WorldStatus = "loading" | "shared" | "offline" | "error";

interface WorldStore {
  status: WorldStatus;
  canonical: WorldState;
  chest: ChestView | null;
  epoch: EpochView | null;
  eventsToday: number;
  /** newest first, attacks only, url resolved */
  events: LogEntry[];
  queue: LogEntry[];
  current: ActiveAttack | null;
  levelUp: LevelUp | null;
  selected: NationCode | null;
  hovered: NationCode | null;
  lastSyncAt: number | null;
  lastEventsAt: number | null;
  fetching: boolean;
  /** cursor for /api/events polling (last id seen, queued or folded) */
  cursor: string | null;
  /** Re-sync with the server now (wired by useWorldSync). */
  syncNow: () => Promise<void>;

  bootstrap: (s: StateResponse) => void;
  setStatus: (s: WorldStatus) => void;
  setFetching: (f: boolean) => void;
  receive: (entries: LogEntry[]) => void;
  startNext: () => ActiveAttack | null;
  finishCurrent: () => void;
  showLevelUp: (lv: LevelUp | null) => void;
  select: (code: NationCode | null) => void;
  hover: (code: NationCode | null) => void;
}

const rickLineFor = (id: string) => RICK_LINES[fnv1a(id) % RICK_LINES.length] ?? DEFAULT_RICK_LINE;

function withUrl(e: LogEntry, state: WorldState): LogEntry {
  const url = urlOf(e, state);
  return url === e.url ? e : { ...e, url };
}

function applyUpgradesToList(events: LogEntry[], state: WorldState): LogEntry[] {
  let changed = false;
  const next = events.map((e) => {
    const u = withUrl(e, state);
    if (u !== e) changed = true;
    return u;
  });
  return changed ? next : events;
}

export const useWorld = create<WorldStore>()((set, get) => ({
  status: "loading",
  canonical: initialWorld(),
  chest: null,
  epoch: null,
  eventsToday: 0,
  events: [],
  queue: [],
  current: null,
  levelUp: null,
  selected: null,
  hovered: null,
  lastSyncAt: null,
  lastEventsAt: null,
  fetching: false,
  cursor: null,
  syncNow: async () => {},

  bootstrap: (s) => {
    const { queue, events, current } = get();
    // The server is the truth: adopt its canonical state; keep queued entries only for animation.
    const known = new Set(events.map((e) => e.id));
    const merged = [...events, ...s.latest.filter((e) => !known.has(e.id))]
      .sort((a, b) => (a.id < b.id ? 1 : -1))
      .slice(0, EVENTS_KEEP);
    const cursor =
      [s.cursor, get().cursor, queue.at(-1)?.id ?? null]
        .filter((c): c is string => c !== null)
        .sort()
        .at(-1) ?? null;
    set({
      status: s.world === "shared" ? "shared" : "offline",
      canonical: s.canonical,
      chest: s.chest,
      epoch: s.epoch,
      eventsToday: s.eventsToday,
      events: applyUpgradesToList(merged, s.canonical),
      lastSyncAt: s.generatedAt,
      cursor,
      queue: queue.filter((q) => q.id !== current?.entry.id),
    });
  },

  setStatus: (status) => set({ status }),
  setFetching: (fetching) => set({ fetching }),

  receive: (entries) => {
    if (!entries.length) return;
    const { canonical, queue, events, current } = get();
    const knownIds = new Set([
      ...events.map((e) => e.id),
      ...queue.map((e) => e.id),
      current?.entry.id ?? "",
    ]);
    const fresh = entries.filter(
      (e) => !knownIds.has(e.id) && (canonical.cursor === null || e.id > canonical.cursor),
    );
    if (!fresh.length) {
      set({ cursor: entries[entries.length - 1]!.id, lastEventsAt: Date.now() });
      return;
    }
    let state = canonical;
    let list = events;
    let eventsToday = get().eventsToday;
    const attacks = fresh.filter((e) => e.kind === "attack");
    const upgrades = fresh.filter((e) => e.kind === "source_upgrade");
    // Upgrades never animate: fold immediately.
    for (const u of upgrades) state = foldEntry(state, u).state;
    // Burst: fold everything but the newest N right away.
    const toAnimate = attacks.slice(-ANIMATE_NEWEST);
    const toFold = attacks.slice(0, Math.max(0, attacks.length - ANIMATE_NEWEST));
    for (const e of toFold) {
      state = foldEntry(state, e).state;
      list = [withUrl(e, state), ...list];
      eventsToday += 1;
    }
    const room = Math.max(0, QUEUE_MAX - queue.length);
    const nextQueue = [...queue, ...toAnimate.slice(0, room)];
    // Anything that did not fit the queue is folded silently.
    for (const e of toAnimate.slice(room)) {
      state = foldEntry(state, e).state;
      list = [withUrl(e, state), ...list];
      eventsToday += 1;
    }
    set({
      canonical: state,
      events: applyUpgradesToList(list, state).slice(0, EVENTS_KEEP),
      queue: nextQueue,
      eventsToday,
      cursor: entries[entries.length - 1]!.id,
      lastEventsAt: Date.now(),
    });
  },

  startNext: () => {
    const { queue, current, canonical } = get();
    if (current || queue.length === 0) return null;
    const [entry, ...rest] = queue;
    if (!entry) return null;
    const before = canonical.nations[entry.a].xp;
    // Fold now (stats, index, heat move at attack start; the map plays the 6 s choreography).
    const alreadyFolded = canonical.cursor !== null && entry.id <= canonical.cursor;
    const { state, effect } = alreadyFolded
      ? { state: canonical, effect: attackEffect(entry) }
      : foldEntry(canonical, entry);
    const eff = effect ?? attackEffect(entry);
    const active: ActiveAttack = {
      key: entry.id,
      entry,
      effect: eff,
      rickLine: rickLineFor(entry.id),
      startedAt: Date.now(),
    };
    const events = alreadyFolded
      ? get().events
      : [withUrl(entry, state), ...get().events].slice(0, EVENTS_KEEP);
    set({
      canonical: state,
      queue: rest,
      current: active,
      events,
      eventsToday: alreadyFolded ? get().eventsToday : get().eventsToday + 1,
    });
    if (!alreadyFolded) {
      const after = state.nations[entry.a].xp;
      const lvBefore = evolutionFor(before);
      const lvAfter = evolutionFor(after);
      if (lvAfter.min > lvBefore.min) {
        window.setTimeout(() => get().showLevelUp({ code: entry.a, level: lvAfter }), 800);
      }
    }
    return active;
  },

  finishCurrent: () => set({ current: null }),
  showLevelUp: (levelUp) => set({ levelUp }),
  select: (selected) => set({ selected }),
  hover: (hovered) => set({ hovered }),
}));
