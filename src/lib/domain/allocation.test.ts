import { describe, expect, it } from "vitest";
import { allocateShares, splitInflows, zeroShares } from "./allocation";

describe("allocation", () => {
  it("returns null with no eligible theaters (carry-over)", () => {
    expect(allocateShares({ ...zeroShares(), MIDDLE_EAST: 1 }, new Set())).toBeNull();
  });

  it("redistributes ineligible shares and applies the 10 % floor, summing to 100 %", () => {
    const share = {
      EASTERN_FRONT: 0.5,
      MIDDLE_EAST: 0.45,
      INDO_PACIFIC: 0.03,
      KOREAN_PENINSULA: 0.02,
      GLOBAL: 0,
    };
    const out = allocateShares(share, new Set(["EASTERN_FRONT", "MIDDLE_EAST", "INDO_PACIFIC"]))!;
    expect(out.KOREAN_PENINSULA).toBe(0);
    expect(out.GLOBAL).toBe(0);
    expect(out.INDO_PACIFIC).toBeCloseTo(0.1, 10);
    expect(out.EASTERN_FRONT).toBeGreaterThan(out.MIDDLE_EAST);
    const sum = Object.values(out).reduce((s, v) => s + v, 0);
    expect(sum).toBeCloseTo(1, 10);
  });

  it("splits equally when the world is cold", () => {
    const out = allocateShares(zeroShares(), new Set(["EASTERN_FRONT", "MIDDLE_EAST"]))!;
    expect(out.EASTERN_FRONT).toBeCloseTo(0.5);
    expect(out.MIDDLE_EAST).toBeCloseTo(0.5);
  });

  it("70 / 20 / 10 in cents", () => {
    expect(splitInflows(1000)).toEqual({ aid: 700, ops: 200, reserve: 100 });
    const s = splitInflows(123.45);
    expect(s.aid + s.ops + s.reserve).toBeCloseTo(123.45, 10);
  });
});
