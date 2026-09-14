import { describe, expect, it } from "vitest";
import { applyAttack, attackEffect, initialNations, resolveTarget, totalPower } from "./attacks";

describe("attacks", () => {
  it("computes boost / dmg / xp from severity", () => {
    const e = attackEffect({ id: "x", a: "USA", t: "IRAN", tp: "military", sv: 7 });
    expect(e).toMatchObject({ boost: 6, dmg: 5, xpGain: 19, stat: "military" });
    const e10 = attackEffect({ id: "x", a: "USA", t: "IRAN", tp: "nuclear", sv: 10 });
    expect(e10).toMatchObject({ boost: 8, dmg: 7, xpGain: 25, stat: "nuclear" });
  });

  it("resolves a self-attack to a deterministic other nation", () => {
    const t1 = resolveTarget("01J0000000000000000000000A", "USA", "USA");
    const t2 = resolveTarget("01J0000000000000000000000A", "USA", "USA");
    expect(t1).toBe(t2);
    expect(t1).not.toBe("USA");
    expect(resolveTarget("id", "USA", "IRAN")).toBe("IRAN");
  });

  it("applies stats with clamps and xp", () => {
    const n0 = initialNations();
    const { nations, effect } = applyAttack(n0, {
      id: "1",
      a: "USA",
      t: "NKOREA",
      tp: "diplomacy",
      sv: 10,
    });
    expect(effect.stat).toBe("diplomacy");
    expect(nations.USA.diplomacy).toBe(75 + 8);
    expect(nations.NKOREA.diplomacy).toBe(1); // 3 - 7 clamped to 1
    expect(nations.USA.kills).toBe(1);
    expect(nations.USA.xp).toBe(25);
    expect(nations.NKOREA.hits).toBe(1);
    expect(nations.NKOREA.xp).toBe(8);
    // immutability
    expect(n0.USA.kills).toBe(0);
    // cap at 120
    let n = nations;
    for (let i = 0; i < 10; i++)
      n = applyAttack(n, { id: `${i}`, a: "USA", t: "IRAN", tp: "intel", sv: 10 }).nations;
    expect(n.USA.intel).toBe(120);
  });

  it("totalPower sums the 6 stats", () => {
    expect(totalPower(initialNations().USA)).toBe(95 + 94 + 88 + 96 + 75 + 97);
  });
});
