import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { INGEST_PROMPT_VERSION, buildIngestPrompt } from "@/config/ingest-prompt";
import { QUERIES } from "@/config/queries";
import { sourceQuality } from "@/config/sources";
import { theaterOf } from "@/config/theaters";
import { checkDuplicate, type SeenEvent } from "@/lib/domain/dedup";
import { isTalkOnly, isWarRelevant } from "@/lib/domain/relevance";
import type { LogEntry } from "@/lib/domain/types";
import { env } from "@/lib/env";
import { appendEntries, newEntryId, readLast } from "./event-log";
import { extractLastJsonArray, parseItems, utcDay, type RawItem } from "./ingest-parse";
import { KEYS, type KV } from "./kv";
import { recomputeSnapshot } from "./snapshot";

export interface RejectCounts {
  invalid: number;
  irrelevant: number;
  talkOnly: number;
  oldDate: number;
  duplicate: number;
}

export interface ProcessResult {
  entries: LogEntry[];
  appended: number;
  upgraded: number;
  rejected: RejectCounts;
}

/**
 * Pure pipeline (section 7.5): Zod → relevance → talk-only → date → dedup vs the last 200.
 * Produces `attack` entries and `source_upgrade` entries (log is append-only).
 */
export function processItems(
  rawItems: unknown[],
  recent: readonly LogEntry[],
  ctx: { now: number; query: string; modelId: string },
): ProcessResult {
  const { items, invalid } = parseItems(rawItems);
  const rejected: RejectCounts = { invalid, irrelevant: 0, talkOnly: 0, oldDate: 0, duplicate: 0 };
  const today = utcDay(ctx.now);
  const yesterday = utcDay(ctx.now - 86_400_000);

  // Dedup context: attacks from the recent window, with their best-known urls applied.
  const overrides = new Map<string, string>();
  for (const e of recent)
    if (e.kind === "source_upgrade" && e.upgrades && e.url) overrides.set(e.upgrades, e.url);
  const seen: SeenEvent[] = recent
    .filter((e) => e.kind === "attack")
    .map((e) => {
      const url = overrides.get(e.id) ?? e.url;
      return { id: e.id, a: e.a, t: e.t, h: e.h, url, quality: sourceQuality(url) };
    });

  const entries: LogEntry[] = [];
  let appended = 0;
  let upgraded = 0;
  let tick = 0;

  for (const item of items) {
    if (!isWarRelevant(item.h)) {
      rejected.irrelevant++;
      continue;
    }
    if (isTalkOnly(item.h)) {
      rejected.talkOnly++;
      continue;
    }
    if (item.d !== today && item.d !== yesterday) {
      rejected.oldDate++;
      continue;
    }
    const url = item.url ?? undefined;
    const dup = checkDuplicate({ a: item.a, t: item.t, h: item.h, url }, seen);
    const receivedAt = ctx.now + tick++; // strictly increasing inside one run
    if (dup.isDupe) {
      rejected.duplicate++;
      if (dup.upgrade) {
        const target = seen.find((s) => s.id === dup.upgrade!.targetId);
        const entry: LogEntry = {
          id: newEntryId(receivedAt),
          kind: "source_upgrade",
          receivedAt,
          a: target?.a ?? item.a,
          t: target?.t ?? item.t,
          h: target?.h ?? item.h,
          tp: item.tp,
          sv: item.sv,
          d: item.d,
          th: item.th ?? theaterOf(item.a, item.t),
          url: dup.upgrade.newUrl,
          sourceQuality: dup.upgrade.newQuality,
          query: ctx.query,
          modelId: ctx.modelId,
          upgrades: dup.upgrade.targetId,
        };
        entries.push(entry);
        if (target) {
          target.url = dup.upgrade.newUrl;
          target.quality = dup.upgrade.newQuality;
        }
        upgraded++;
      }
      continue;
    }
    const entry = toAttackEntry(item, receivedAt, ctx);
    entries.push(entry);
    seen.push({
      id: entry.id,
      a: entry.a,
      t: entry.t,
      h: entry.h,
      url: entry.url,
      quality: entry.sourceQuality,
    });
    appended++;
  }

  return { entries, appended, upgraded, rejected };
}

function toAttackEntry(
  item: RawItem,
  receivedAt: number,
  ctx: { query: string; modelId: string },
): LogEntry {
  const url = item.url ?? undefined;
  return {
    id: newEntryId(receivedAt),
    kind: "attack",
    receivedAt,
    a: item.a,
    t: item.t,
    h: item.h,
    tp: item.tp,
    sv: item.sv,
    d: item.d,
    th: item.th ?? theaterOf(item.a, item.t),
    url,
    sourceQuality: sourceQuality(url),
    query: ctx.query,
    modelId: ctx.modelId,
  };
}

export interface ModelCall {
  text: string;
  modelId: string;
  searches: number;
  inputTokens: number;
  outputTokens: number;
}

/** Calls the Messages API with the server-side web search tool. Retries 429/529 via the SDK. */
export async function callModel(query: string, now: number): Promise<ModelCall> {
  const client = new Anthropic({
    apiKey: env.ANTHROPIC_API_KEY,
    maxRetries: 3,
    timeout: 50_000,
  });
  const prompt = buildIngestPrompt({
    query,
    today: utcDay(now),
    yesterday: utcDay(now - 86_400_000),
  });
  const res = await client.messages.create({
    model: env.ANTHROPIC_MODEL,
    max_tokens: 1500,
    tools: [
      {
        type: "web_search_20250305",
        name: "web_search",
        max_uses: env.ANTHROPIC_WEB_SEARCH_MAX_USES,
      },
    ],
    messages: [{ role: "user", content: prompt }],
  });
  // Only text blocks; tool blocks (server_tool_use / web_search_tool_result) are ignored.
  const text = res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");
  return {
    text,
    modelId: res.model,
    searches: res.usage.server_tool_use?.web_search_requests ?? 0,
    inputTokens: res.usage.input_tokens,
    outputTokens: res.usage.output_tokens,
  };
}

export type IngestOutcome =
  | { skipped: "no-key" | "locked" | "no-kv" }
  | {
      ok: true;
      query: string;
      modelId: string;
      searches: number;
      parsed: number;
      appended: number;
      upgraded: number;
      rejected: RejectCounts;
      cursor: string | null;
      index: number;
      ms: number;
    }
  | { ok: false; error: string; query: string; ms: number };

/** GET /api/cron/ingest body. Lock (SET NX EX 55) → round-robin query → model → pipeline → append → snapshot. */
export async function runIngest(kv: KV | null, now = Date.now()): Promise<IngestOutcome> {
  if (!kv) return { skipped: "no-kv" };
  if (!env.ANTHROPIC_API_KEY) return { skipped: "no-key" };
  const locked = await kv.set(KEYS.ingestLock, now, { nx: true, ex: 55 });
  if (!locked) return { skipped: "locked" };
  const started = Date.now();
  const round = await kv.incr(KEYS.ingestRound);
  const query = QUERIES[(round - 1) % QUERIES.length]!;
  try {
    const call = await callModel(query, now);
    const raw = extractLastJsonArray(call.text) ?? [];
    const recent = await readLast(kv, 200);
    const result = processItems(raw, recent, { now, query, modelId: call.modelId });
    if (result.entries.length) await appendEntries(kv, result.entries);
    const state = await recomputeSnapshot(kv);
    await kv.hincrby(KEYS.ingestMetrics, "runs", 1);
    await kv.hincrby(KEYS.ingestMetrics, "appended", result.appended);
    await kv.hincrby(KEYS.ingestMetrics, "upgraded", result.upgraded);
    await kv.hincrby(KEYS.ingestMetrics, "searches", call.searches);
    await kv.hincrby(KEYS.ingestMetrics, "inputTokens", call.inputTokens);
    await kv.hincrby(KEYS.ingestMetrics, "outputTokens", call.outputTokens);
    await kv.hset(KEYS.ingestMetrics, {
      lastRunAt: now,
      lastQuery: query,
      lastModelId: call.modelId,
      lastParsed: raw.length,
      lastAppended: result.appended,
      lastError: "",
      promptVersion: INGEST_PROMPT_VERSION,
    });
    return {
      ok: true,
      query,
      modelId: call.modelId,
      searches: call.searches,
      parsed: raw.length,
      appended: result.appended,
      upgraded: result.upgraded,
      rejected: result.rejected,
      cursor: state.cursor,
      index: state.index,
      ms: Date.now() - started,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await kv.hincrby(KEYS.ingestMetrics, "errors", 1);
    await kv.hset(KEYS.ingestMetrics, {
      lastRunAt: now,
      lastQuery: query,
      lastError: message.slice(0, 300),
    });
    return { ok: false, error: message, query, ms: Date.now() - started };
  } finally {
    await kv.del(KEYS.ingestLock);
  }
}
