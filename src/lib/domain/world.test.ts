import { describe, expect, it } from "vitest";
import { makeEntry } from "@/tests/helpers";
import { fold, foldEntry, initialWorld, project, urlOf } from "./world";
import type { LogEntry } from "./types";

const T0 = Date.UTC(2026, 8, 15, 12, 0, 0);

function sampleLog(n: number): LogEntry[] {
  const pairs = [
    ["RUSSIA", "UKRAINE"],
    ["ISRAEL", "IRAN"],
    ["USA", "CHINA"],
    ["NKOREA", "USA"],
    ["USA", "USA"],
    ["FRANCE", "RUSSIA"],
  ] as const;
  const types = ["military", "nuclear", "cyber", "intel"] as const;
  const out: LogEntry[] = [];
  for (let i = 0; i < n; i++) {
    const [a, t] = pairs[i % pairs.length]!;
    out.push(
      makeEntry({
        a,
        t,
        tp: types[i % types.length],
        sv: (i % 10) + 1,
        receivedAt: T0 + i * 7 * 60_000 + (i % 3) * 1000,
      }),
    );
  }
  return out;
}

describe("world fold", () => {
  it("is deterministic", () => {
    const log = sampleLog(50);
    expect(fold(log)).toEqual(fold(log));
  });

  it("snapshot + tail == full fold (exact, for any split point)", () => {
    const log = sampleLog(60);
    const full = fold(log);
    for (const k of [0, 1, 7, 30, 59, 60]) {
      const head = fold(log.slice(0, k));
      const rest = fold(log.slice(k), head);
      expect(rest).toEqual(full);
    }
  });

  it("applies decay between events and projects to now", () => {
    const e1 = makeEntry({ a: "USA", t: "RUSSIA", tp: "military", sv: 10, receivedAt: T0 });
    const s1 = fold([e1]);
    expect(s1.index).toBe(21.1);
    expect(s1.at).toBe(T0);
    const p = project(s1, T0 + 10 * 60_000);
    expect(p.index).toBe(19.6);
    expect(project(s1, T0 + 60 * 60_000).index).toBe(19.5);
    // heat decays by hours
    expect(p.heat.EASTERN_FRONT).toBeCloseTo(10 * Math.pow(0.96, 10 / 60), 10);
    // projection never mutates the canonical state
    expect(s1.index).toBe(21.1);
  });

  it("does not decay before the first event", () => {
    const s = initialWorld();
    expect(project(s, T0).index).toBe(19.5);
    expect(project(s, T0).heat.GLOBAL).toBe(0);
  });

  it("source_upgrade only records the url override", () => {
    const e1 = makeEntry({ a: "ISRAEL", t: "IRAN", receivedAt: T0, url: "https://cnn.com/a" });
    const s1 = fold([e1]);
    const up = makeEntry({
      a: "ISRAEL",
      t: "IRAN",
      kind: "source_upgrade",
      receivedAt: T0 + 5 * 60_000,
      url: "https://reuters.com/b",
      upgrades: e1.id,
    });
    const { state: s2, effect } = foldEntry(s1, up);
    expect(effect).toBeNull();
    expect(s2.index).toBe(s1.index);
    expect(s2.at).toBe(s1.at);
    expect(s2.eventCount).toBe(1);
    expect(s2.cursor).toBe(up.id);
    expect(urlOf(e1, s2)).toBe("https://reuters.com/b");
    expect(urlOf(e1, s1)).toBe("https://cnn.com/a");
  });

  it("resolves self-attacks deterministically inside the fold", () => {
    const e = makeEntry({ a: "USA", t: "USA", receivedAt: T0, sv: 5 });
    const a = fold([e]);
    const b = fold([e]);
    expect(a).toEqual(b);
    expect(a.nations.USA.kills).toBe(1);
    const hits = Object.values(a.nations).reduce((s, n) => s + n.hits, 0);
    expect(hits).toBe(1);
    expect(a.nations.USA.hits).toBe(0);
  });
});
