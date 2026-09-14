import { describe, expect, it } from "vitest";
import { theaterOf } from "@/config/theaters";
import { applyHeatEvent, decayHeat, emptyHeat, theaterReadings } from "./theaters";

describe("theaters", () => {
  it("falls back to the right theater per pair", () => {
    expect(theaterOf("NKOREA", "USA")).toBe("KOREAN_PENINSULA");
    expect(theaterOf("USA", "IRAN")).toBe("MIDDLE_EAST");
    expect(theaterOf("CHINA", "USA")).toBe("INDO_PACIFIC");
    expect(theaterOf("RUSSIA", "UKRAINE")).toBe("EASTERN_FRONT");
    expect(theaterOf("FRANCE", "USA")).toBe("GLOBAL");
    // priority: NKOREA before ISRAEL/IRAN before CHINA before RUSSIA
    expect(theaterOf("ISRAEL", "NKOREA")).toBe("KOREAN_PENINSULA");
    expect(theaterOf("CHINA", "IRAN")).toBe("MIDDLE_EAST");
  });

  it("adds sv * TYPE_WEIGHT and decays 4 %/h", () => {
    let heat = applyHeatEvent(emptyHeat(), "MIDDLE_EAST", 10, "nuclear");
    expect(heat.MIDDLE_EAST).toBe(28);
    heat = decayHeat(heat, 1);
    expect(heat.MIDDLE_EAST).toBeCloseTo(28 * 0.96, 10);
    heat = decayHeat(heat, 16);
    // half-life ≈ 17 h
    expect(heat.MIDDLE_EAST / 28).toBeCloseTo(Math.pow(0.96, 17), 10);
    expect(Math.pow(0.96, 17)).toBeGreaterThan(0.49);
    expect(Math.pow(0.96, 17)).toBeLessThan(0.51);
  });

  it("computes share and hn", () => {
    let heat = applyHeatEvent(emptyHeat(), "EASTERN_FRONT", 10, "military"); // 10
    heat = applyHeatEvent(heat, "MIDDLE_EAST", 10, "nuclear"); // 28
    const r = theaterReadings(heat);
    expect(r.EASTERN_FRONT.share).toBeCloseTo(10 / 38, 10);
    expect(r.MIDDLE_EAST.hn).toBe(100);
    expect(r.MIDDLE_EAST.tier).toBe("CRITICAL");
    expect(r.GLOBAL.share).toBe(0);
    const cold = theaterReadings(emptyHeat());
    expect(cold.GLOBAL.share).toBe(0);
    expect(cold.GLOBAL.tier).toBe("COLD");
  });
});
