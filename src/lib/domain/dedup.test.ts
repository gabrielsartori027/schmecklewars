import { describe, expect, it } from "vitest";
import { checkDuplicate, extractKeywords, keywordSimilarity } from "./dedup";

describe("dedup", () => {
  it("extracts keywords without stop words", () => {
    expect(extractKeywords("The Russian army strikes at the Kyiv power grid")).toEqual([
      "russian",
      "army",
      "strikes",
      "kyiv",
      "power",
      "grid",
    ]);
  });

  it("similarity = overlap / min size", () => {
    expect(keywordSimilarity(["a1", "b1", "c1"], ["a1", "b1"])).toBe(1);
    expect(keywordSimilarity(["a1", "b1", "c1"], ["a1", "x1", "y1"])).toBeCloseTo(1 / 3);
    expect(keywordSimilarity([], ["a1"])).toBe(0);
  });

  it("flags duplicates and upgrades to better sources", () => {
    const seen = [
      {
        id: "e1",
        a: "RUSSIA" as const,
        t: "UKRAINE" as const,
        h: "Russia launches overnight drone attack on Kyiv energy sites",
        url: "https://rt.com/x",
        quality: 30,
      },
    ];
    const r = checkDuplicate(
      {
        a: "RUSSIA",
        t: "UKRAINE",
        h: "Russia launches drone attack on Kyiv energy sites overnight",
        url: "https://reuters.com/y",
      },
      seen,
    );
    expect(r.isDupe).toBe(true);
    expect(r.isDupe && r.upgrade?.targetId).toBe("e1");
    expect(r.isDupe && r.upgrade?.newQuality).toBe(100);
    const worse = checkDuplicate(
      {
        a: "RUSSIA",
        t: "UKRAINE",
        h: "Russia launches drone attack on Kyiv energy sites overnight",
        url: "https://presstv.ir/z",
      },
      seen,
    );
    expect(worse).toEqual({ isDupe: true, upgrade: null });
    const fresh = checkDuplicate(
      {
        a: "ISRAEL",
        t: "IRAN",
        h: "Israeli jets strike missile depot near Isfahan",
        url: "https://apnews.com/q",
      },
      seen,
    );
    expect(fresh.isDupe).toBe(false);
  });

  it("exact 40-char prefix match is a duplicate regardless of actors", () => {
    const h = "Russia launches overnight drone attack on Kyiv energy sites";
    const seen = [{ id: "e1", a: "RUSSIA" as const, t: "UKRAINE" as const, h, quality: 5 }];
    expect(checkDuplicate({ a: "USA", t: "CHINA", h }, seen).isDupe).toBe(true);
  });
});
