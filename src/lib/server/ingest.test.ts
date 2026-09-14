import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeEntry } from "@/tests/helpers";
import { MemoryKV } from "./kv";
import { appendEntries, cursorAt, countAfter, readAfter, readLast } from "./event-log";
import { extractLastJsonArray, parseItems } from "./ingest-parse";
import { loadCanonical, recomputeSnapshot } from "./snapshot";
import { fold } from "@/lib/domain/world";

const NOW = Date.UTC(2026, 8, 15, 18, 0, 0);
const today = "2026-09-15";
const yesterday = "2026-09-14";

const sampleText = `Here is what I found.
\`\`\`json
[{"a":"RUSSIA","t":"UKRAINE","h":"Russia launches overnight missile strike on Kyiv, air defenses intercept","tp":"military","sv":7,"d":"${today}","th":"EASTERN_FRONT","url":"https://www.reuters.com/x"},
 {"a":"ISRAEL","t":"IRAN","h":"Israeli jets strike drone factory near Isfahan, explosions reported","tp":"military","sv":8,"d":"${yesterday}","url":"https://apnews.com/y"},
 {"a":"IRAN","t":"ISRAEL","h":"Iran warns troops and navy of imminent escalation, says commander","tp":"military","sv":5,"d":"${today}"},
 {"a":"CHINA","t":"USA","h":"China says it will consider talks","tp":"intel","sv":2,"d":"${today}"},
 {"a":"NKOREA","t":"USA","h":"North Korea fires ballistic missile toward the sea, launch confirmed by Seoul","tp":"nuclear","sv":6,"d":"2026-09-01","url":"https://bbc.com/z"},
 {"a":"NOWHERE","t":"USA","h":"Invalid attacker code strikes something with missiles","tp":"military","sv":5,"d":"${today}"}]
\`\`\``;

const { mockCreate, envState } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
  envState: {
    ANTHROPIC_API_KEY: "test-key" as string | undefined,
    ANTHROPIC_MODEL: "claude-sonnet-5",
    ANTHROPIC_WEB_SEARCH_MAX_USES: 2,
    NODE_ENV: "test",
    NEXT_PUBLIC_CHAIN_ID: 4663,
    NEXT_PUBLIC_STABLE_SYMBOL: "USDG",
    NEXT_PUBLIC_STABLE_DECIMALS: 6,
    EPOCH_DAYS: 14,
  },
}));
vi.mock("@/lib/env", () => ({ env: envState, simulationEnabled: false }));
vi.mock("@anthropic-ai/sdk", () => {
  class Anthropic {
    messages = { create: mockCreate };
  }
  return { default: Anthropic, Anthropic };
});

describe("ingest parsing", () => {
  it("extracts the last JSON array, ignoring fences and prose", () => {
    const arr = extractLastJsonArray(
      `Some thoughts [not json] then \`\`\`json\n[{"a":1}]\n\`\`\` and finally [{"b":"x]y"}]`,
    );
    expect(arr).toEqual([{ b: "x]y" }]);
    expect(extractLastJsonArray("no arrays here")).toBeNull();
    expect(extractLastJsonArray("[]")).toEqual([]);
  });

  it("validates items with Zod and normalizes lightly", () => {
    const { items, invalid } = parseItems([
      {
        a: "usa",
        t: "Iran",
        h: "USA strikes Iranian missile site in Yemen",
        tp: "MILITARY",
        sv: "7",
        d: today,
      },
      { a: "USA", t: "IRAN", h: "too short", tp: "military", sv: 7, d: today },
      { a: "USA", t: "IRAN", h: "x".repeat(20), tp: "military", sv: 11, d: today },
    ]);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ a: "USA", t: "IRAN", tp: "military", sv: 7 });
    expect(invalid).toBe(2);
  });
});

describe("ingest pipeline (SDK mocked)", () => {
  let kv: MemoryKV;
  beforeEach(() => {
    kv = new MemoryKV();
    mockCreate.mockReset();
    envState.ANTHROPIC_API_KEY = "test-key";
  });

  it("filters, dedups, appends and recomputes the snapshot", async () => {
    mockCreate.mockResolvedValue({
      model: "claude-sonnet-5",
      content: [
        { type: "server_tool_use", id: "s1", name: "web_search", input: { query: "x" } },
        { type: "web_search_tool_result", tool_use_id: "s1", content: [] },
        { type: "text", text: sampleText },
      ],
      usage: {
        input_tokens: 1000,
        output_tokens: 300,
        server_tool_use: { web_search_requests: 2 },
      },
    });
    const { runIngest } = await import("./ingest");
    const out = await runIngest(kv, NOW);
    expect(out).toMatchObject({ ok: true, appended: 2, upgraded: 0, searches: 2 });
    if (!("ok" in out) || !out.ok) throw new Error("expected ok");
    expect(out.rejected).toMatchObject({ invalid: 1, talkOnly: 1, oldDate: 1, duplicate: 0 });
    // "China says it will consider talks" fails relevance (only 0 war keywords)
    expect(out.rejected.irrelevant).toBe(1);

    const log = await readAfter(kv, null, 100);
    expect(log).toHaveLength(2);
    expect(log[0]!.a).toBe("RUSSIA");
    expect(log[0]!.sourceQuality).toBe(100);
    expect(log[1]!.th).toBe("MIDDLE_EAST"); // fallback theaterOf when th missing
    expect(log[0]!.id < log[1]!.id).toBe(true);

    const canonical = await loadCanonical(kv);
    expect(canonical).toEqual(fold(log));
    expect(canonical.eventCount).toBe(2);
    expect(canonical.cursor).toBe(log[1]!.id);

    // second run: same stories from a better/worse source → duplicates, one upgrade
    mockCreate.mockResolvedValue({
      model: "claude-sonnet-5",
      content: [
        {
          type: "text",
          text: `[{"a":"ISRAEL","t":"IRAN","h":"Israeli jets strike drone factory near Isfahan, explosions reported","tp":"military","sv":8,"d":"${today}","url":"https://www.reuters.com/better"},
                 {"a":"RUSSIA","t":"UKRAINE","h":"Russia launches overnight missile strike on Kyiv, air defenses intercept","tp":"military","sv":7,"d":"${today}","url":"https://rt.com/worse"}]`,
        },
      ],
      usage: { input_tokens: 10, output_tokens: 10, server_tool_use: { web_search_requests: 1 } },
    });
    const out2 = await runIngest(kv, NOW + 600_000);
    expect(out2).toMatchObject({ ok: true, appended: 0, upgraded: 1 });
    const log2 = await readAfter(kv, null, 100);
    expect(log2).toHaveLength(3);
    expect(log2[2]!.kind).toBe("source_upgrade");
    expect(log2[2]!.upgrades).toBe(log[1]!.id);
    const c2 = await loadCanonical(kv);
    expect(c2.eventCount).toBe(2);
    expect(c2.urlOverrides[log[1]!.id]).toBe("https://www.reuters.com/better");
    expect(c2.index).toBe(canonical.index); // upgrades never move the index
  });

  it("skips without a key and honours the lock", async () => {
    envState.ANTHROPIC_API_KEY = undefined;
    const { runIngest } = await import("./ingest");
    expect(await runIngest(kv, NOW)).toEqual({ skipped: "no-key" });
    envState.ANTHROPIC_API_KEY = "k";
    await kv.set("sw:lock:ingest", 1, { nx: true, ex: 55 });
    expect(await runIngest(kv, NOW)).toEqual({ skipped: "locked" });
  });

  it("records the error and releases the lock when the model call fails", async () => {
    mockCreate.mockRejectedValue(new Error("529 overloaded"));
    const { runIngest } = await import("./ingest");
    const out = await runIngest(kv, NOW);
    expect(out).toMatchObject({ ok: false, error: "529 overloaded" });
    expect(await kv.get("sw:lock:ingest")).toBeNull();
    const m = await kv.hgetall("sw:metrics:ingest");
    expect(Number(m?.errors)).toBe(1);
  });
});

describe("event log", () => {
  it("pages after a cursor and counts by time", async () => {
    const kv = new MemoryKV();
    const entries = [0, 1, 2, 3, 4].map((i) =>
      makeEntry({ a: "USA", t: "CHINA", receivedAt: NOW + i * 60_000 }),
    );
    await appendEntries(kv, entries);
    const first = await readAfter(kv, null, 2);
    expect(first.map((e) => e.id)).toEqual(entries.slice(0, 2).map((e) => e.id));
    const rest = await readAfter(kv, first[1]!.id, 10);
    expect(rest).toHaveLength(3);
    expect(await countAfter(kv, cursorAt(NOW + 2 * 60_000 + 1))).toBe(2);
    expect(await countAfter(kv, cursorAt(NOW))).toBe(5);
    expect((await readLast(kv, 2)).map((e) => e.id)).toEqual(entries.slice(3).map((e) => e.id));
    await recomputeSnapshot(kv);
    const late = makeEntry({ a: "IRAN", t: "ISRAEL", receivedAt: NOW + 10 * 60_000 });
    await appendEntries(kv, [late]);
    expect(await loadCanonical(kv)).toEqual(fold([...entries, late]));
  });
});
