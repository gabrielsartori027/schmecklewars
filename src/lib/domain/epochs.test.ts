import { describe, expect, it } from "vitest";
import { EPOCH_DAYS_DEFAULT } from "@/config/epochs";
import { epochAt } from "./epochs";

describe("epochs", () => {
  const genesis = "2026-09-15T15:00:00Z";
  const g = Date.parse(genesis);
  const day = 86_400_000;
  it("is epoch 0 before genesis and without genesis", () => {
    expect(epochAt(g - 1000, genesis).n).toBe(0);
    expect(epochAt(g, undefined).genesis).toBeNull();
  });
  // Explicit length: the cadence is a published rule that can change, so the maths is
  // asserted against a length passed in, not against whatever the default happens to be.
  it.each([2, 7, 14])("counts %i-day epochs from genesis", (days) => {
    expect(epochAt(g, genesis, days)).toMatchObject({ n: 1, start: g, end: g + days * day });
    expect(epochAt(g + days * day, genesis, days).n).toBe(2);
    expect(epochAt(g + (days - 1) * day, genesis, days).closesInMs).toBe(day);
  });
  it("falls back to the configured default length", () => {
    expect(epochAt(g, genesis).end).toBe(g + EPOCH_DAYS_DEFAULT * day);
  });
});
