import { describe, expect, it } from "vitest";
import { isTalkOnly, isWarRelevant } from "./relevance";

describe("relevance", () => {
  it("needs two war keywords", () => {
    expect(isWarRelevant("Russia launches missile strike on Kharkiv")).toBe(true);
    expect(isWarRelevant("Leaders meet in Geneva for climate summit")).toBe(false);
    expect(isWarRelevant("short")).toBe(false);
    // ICBM matches after normalization (fix of a latent bug in the original)
    expect(isWarRelevant("North Korea test-fires ICBM toward Sea of Japan, launch confirmed")).toBe(
      true,
    );
  });

  it("rejects talk-only headlines unless an action verb is present", () => {
    expect(isTalkOnly("Iran warns of response after Israeli statement")).toBe(true);
    expect(isTalkOnly("Iran warns of response after Israeli strike kills commander")).toBe(false);
    expect(isTalkOnly("Ukraine destroys Russian ammunition depot in Kursk")).toBe(false);
  });
});
