import "server-only";
import { fold, initialWorld } from "@/lib/domain/world";
import type { WorldState } from "@/lib/domain/types";
import { readAllAfter } from "./event-log";
import { KEYS, type KV } from "./kv";

interface StoredSnapshot {
  version: 1;
  state: WorldState;
  savedAt: number;
}

const SNAPSHOT_VERSION = 1 as const;

/**
 * Canonical world = stored snapshot (state at its cursor) + fold of the log tail.
 * Reading never persists; `recomputeSnapshot` persists after ingest/heartbeat.
 * Because the fold is exact under chunking (see world.ts), both paths agree bit for bit.
 */
export async function loadCanonical(kv: KV): Promise<WorldState> {
  const stored = await kv.get<StoredSnapshot>(KEYS.snapshot);
  const seed = stored?.version === SNAPSHOT_VERSION ? stored.state : initialWorld();
  const tail = await readAllAfter(kv, seed.cursor);
  return tail.length ? fold(tail, seed) : seed;
}

export async function recomputeSnapshot(kv: KV): Promise<WorldState> {
  const state = await loadCanonical(kv);
  const payload: StoredSnapshot = { version: SNAPSHOT_VERSION, state, savedAt: Date.now() };
  await kv.set(KEYS.snapshot, payload);
  return state;
}

/** Full rebuild from the first entry (operator tool; never needed in normal operation). */
export async function rebuildSnapshotFromScratch(kv: KV): Promise<WorldState> {
  const all = await readAllAfter(kv, null);
  const state = fold(all);
  await kv.set(KEYS.snapshot, {
    version: SNAPSHOT_VERSION,
    state,
    savedAt: Date.now(),
  } satisfies StoredSnapshot);
  return state;
}
