import { describe, expect, it } from "vitest";
import { WW3_BASELINE, WW3_MAX, pairMultiplier } from "@/config/ww3";
import { applyIndexEvent, decayIndex, rawImpact, tierFor } from "./ww3";

describe("WW3 index", () => {
  it("decays 0.15 per minute toward the baseline and never below it", () => {
    expect(decayIndex(25, 10)).toBe(23.5);
    expect(decayIndex(20, 60)).toBe(WW3_BASELINE);
    expect(decayIndex(WW3_BASELINE, 5)).toBe(WW3_BASELINE);
    expect(decayIndex(10, 0)).toBe(WW3_BASELINE);
  });

  it("raw impact = (sv/10)*type*pair*cap", () => {
    expect(rawImpact(10, "military", "USA", "RUSSIA")).toBeCloseTo(1 * 1 * 2.5 * 0.8, 10);
    expect(rawImpact(5, "nuclear", "ISRAEL", "IRAN")).toBeCloseTo(0.5 * 2.8 * 1.8 * 0.8, 10);
    expect(rawImpact(5, "cyber", "FRANCE", "CHINA")).toBeCloseTo(0.5 * 0.8 * 1 * 0.8, 10);
  });

  it("pair multipliers are symmetric and default to 1.0", () => {
    expect(pairMultiplier("USA", "RUSSIA")).toBe(2.5);
    expect(pairMultiplier("RUSSIA", "USA")).toBe(2.5);
    expect(pairMultiplier("RUSSIA", "UKRAINE")).toBe(1.2);
    expect(pairMultiplier("FRANCE", "CHINA")).toBe(1.0);
  });

  it("applies resistance and rounds to one decimal, capped at MAX", () => {
    // prev 19.5, raw = 2.0, resistance = 0.805 → 19.5 + 1.61 = 21.11 → 21.1
    expect(applyIndexEvent(19.5, { sv: 10, tp: "military", a: "USA", t: "RUSSIA" })).toBe(21.1);
    expect(
      applyIndexEvent(94.99, { sv: 10, tp: "nuclear", a: "USA", t: "RUSSIA" }),
    ).toBeLessThanOrEqual(WW3_MAX);
    // resistance floor at 0.1
    expect(applyIndexEvent(94, { sv: 10, tp: "nuclear", a: "USA", t: "RUSSIA" })).toBe(94.6);
  });

  it("maps values to tiers", () => {
    expect(tierFor(19.5).label).toBe("ELEVATED");
    expect(tierFor(5).label).toBe("PEACETIME");
    expect(tierFor(5.1).label).toBe("LOW RISK");
    expect(tierFor(95).label).toBe("EXTINCTION");
  });
});
