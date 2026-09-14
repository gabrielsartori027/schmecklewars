import { describe, expect, it } from "vitest";
import { epochAt } from "./epochs";

describe("epochs", () => {
  const genesis = "2026-09-15T15:00:00Z";
  const g = Date.parse(genesis);
  it("is epoch 0 before genesis and without genesis", () => {
    expect(epochAt(g - 1000, genesis).n).toBe(0);
    expect(epochAt(g, undefined).genesis).toBeNull();
  });
  it("counts 14-day epochs from genesis", () => {
    expect(epochAt(g, genesis)).toMatchObject({ n: 1, start: g, end: g + 14 * 86_400_000 });
    expect(epochAt(g + 14 * 86_400_000, genesis).n).toBe(2);
    expect(epochAt(g + 13 * 86_400_000, genesis).closesInMs).toBe(86_400_000);
  });
});
