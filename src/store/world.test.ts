import { beforeEach, describe, expect, it } from "vitest";
import type { StateResponse } from "@/lib/api-types";
import { initialWorld } from "@/lib/domain/world";
import { makeEntry } from "@/tests/helpers";
import { useWorld } from "./world";

const T0 = Date.UTC(2026, 8, 15, 12, 0, 0);

function bootstrapEmpty() {
  const s: StateResponse = {
    ok: true,
    world: "shared",
    index: 19.5,
    tier: { max: 22, label: "ELEVATED", description: "", color: "#FFD700", icon: "🟡" },
    theaters: {} as StateResponse["theaters"],
    nations: {} as StateResponse["nations"],
    canonical: initialWorld(),
    epoch: {
      n: 0,
      start: 0,
      end: 0,
      closesInMs: 0,
      genesis: null,
      projectedSplit: null,
      eligibleTheaters: [],
      inflowsMode: "balance",
      inflowsUsd: null,
    },
    chest: {
      configured: false,
      address: null,
      balanceEth: null,
      balanceStable: null,
      stableSymbol: "USDG",
      balanceUsd: null,
      ethPriceUsd: null,
      aidLifetimeUsd: 0,
      nextDropAt: null,
      stale: false,
    },
    eventsToday: 0,
    eventCount: 0,
    latest: [],
    cursor: null,
    generatedAt: T0,
  };
  useWorld.getState().bootstrap(s);
}

describe("world store", () => {
  beforeEach(() => {
    useWorld.setState(useWorld.getInitialState());
    bootstrapEmpty();
  });

  it("queues up to three fresh attacks and folds the rest of a burst", () => {
    const entries = [0, 1, 2, 3, 4].map((i) =>
      makeEntry({ a: "USA", t: "IRAN", receivedAt: T0 + i * 1000 }),
    );
    useWorld.getState().receive(entries);
    const s = useWorld.getState();
    expect(s.queue.map((e) => e.id)).toEqual(entries.slice(2).map((e) => e.id));
    expect(s.canonical.eventCount).toBe(2); // two folded silently
    expect(s.events).toHaveLength(2);
    expect(s.cursor).toBe(entries[4]!.id);
  });

  it("startNext folds the entry, sets current and advances the queue", () => {
    const entries = [0, 1].map((i) =>
      makeEntry({ a: "RUSSIA", t: "UKRAINE", receivedAt: T0 + i * 1000, sv: 10 }),
    );
    useWorld.getState().receive(entries);
    const active = useWorld.getState().startNext();
    expect(active?.key).toBe(entries[0]!.id);
    const s = useWorld.getState();
    expect(s.current?.key).toBe(entries[0]!.id);
    expect(s.queue).toHaveLength(1);
    expect(s.canonical.eventCount).toBe(1);
    expect(s.canonical.nations.RUSSIA.kills).toBe(1);
    expect(s.events[0]!.id).toBe(entries[0]!.id);
    // a second call while one is active is a no-op
    expect(useWorld.getState().startNext()).toBeNull();
    useWorld.getState().finishCurrent();
    expect(useWorld.getState().current).toBeNull();
  });

  it("ignores entries already covered by the canonical cursor", () => {
    const e = makeEntry({ a: "CHINA", t: "USA", receivedAt: T0 });
    useWorld.getState().receive([e]);
    useWorld.getState().startNext();
    useWorld.getState().finishCurrent();
    useWorld.getState().receive([e]);
    expect(useWorld.getState().queue).toHaveLength(0);
    expect(useWorld.getState().canonical.eventCount).toBe(1);
  });
});
