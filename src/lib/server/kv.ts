import "server-only";
import { Redis } from "@upstash/redis";
import { env } from "@/lib/env";

/**
 * Minimal key-value contract used by the shared world. Backed by Upstash Redis in
 * production; an in-memory implementation exists for local development / tests only.
 */
export interface KV {
  readonly kind: "upstash" | "memory";
  /** ZSET with all scores 0 → lexicographic order. Member must start with a ULID. */
  zaddLex(key: string, member: string): Promise<void>;
  /** Members strictly after `after` (a ULID prefix) in lex order, limited to `count`. */
  zrangeLexAfter(key: string, after: string | null, count: number): Promise<string[]>;
  /** Last `n` members in lex order (oldest → newest). */
  zrangeLast(key: string, n: number): Promise<string[]>;
  zcard(key: string): Promise<number>;
  /** Number of members strictly after `after`. */
  zcountLexAfter(key: string, after: string): Promise<number>;
  /** ZSET with numeric score (for hourly samples). */
  zaddScore(key: string, score: number, member: string): Promise<void>;
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown, opts?: { ex?: number; nx?: boolean }): Promise<boolean>;
  del(key: string): Promise<void>;
  incr(key: string, opts?: { ex?: number }): Promise<number>;
  hincrby(key: string, field: string, by: number): Promise<void>;
  hset(key: string, fields: Record<string, string | number>): Promise<void>;
  hgetall(key: string): Promise<Record<string, string | number> | null>;
}

/** Lex upper bound that is > every member of `id` and < every member of a greater id. */
const afterBound = (id: string): `(${string}` => `(${id}#~`;

class UpstashKV implements KV {
  readonly kind = "upstash" as const;
  constructor(private readonly r: Redis) {}
  async zaddLex(key: string, member: string) {
    await this.r.zadd(key, { score: 0, member });
  }
  async zrangeLexAfter(key: string, after: string | null, count: number) {
    const min: `(${string}` | "-" = after ? afterBound(after) : "-";
    return (await this.r.zrange<string[]>(key, min, "+", { byLex: true, offset: 0, count })) ?? [];
  }
  async zrangeLast(key: string, n: number) {
    if (n <= 0) return [];
    return (await this.r.zrange<string[]>(key, -n, -1)) ?? [];
  }
  async zcard(key: string) {
    return (await this.r.zcard(key)) ?? 0;
  }
  async zcountLexAfter(key: string, after: string) {
    return (await this.r.zlexcount(key, afterBound(after), "+")) ?? 0;
  }
  async zaddScore(key: string, score: number, member: string) {
    await this.r.zadd(key, { score, member });
  }
  async get<T>(key: string) {
    return (await this.r.get<T>(key)) ?? null;
  }
  async set(key: string, value: unknown, opts?: { ex?: number; nx?: boolean }) {
    const res =
      opts?.ex && opts?.nx
        ? await this.r.set(key, value, { ex: opts.ex, nx: true })
        : opts?.ex
          ? await this.r.set(key, value, { ex: opts.ex })
          : opts?.nx
            ? await this.r.set(key, value, { nx: true })
            : await this.r.set(key, value);
    return res === "OK";
  }
  async del(key: string) {
    await this.r.del(key);
  }
  async incr(key: string, opts?: { ex?: number }) {
    const v = await this.r.incr(key);
    if (v === 1 && opts?.ex) await this.r.expire(key, opts.ex);
    return v;
  }
  async hincrby(key: string, field: string, by: number) {
    await this.r.hincrby(key, field, by);
  }
  async hset(key: string, fields: Record<string, string | number>) {
    await this.r.hset(key, fields);
  }
  async hgetall(key: string) {
    return (await this.r.hgetall<Record<string, string | number>>(key)) ?? null;
  }
}

/** Dev-only. Not durable, not shared between serverless instances. */
export class MemoryKV implements KV {
  readonly kind = "memory" as const;
  private zsets = new Map<string, string[]>();
  private scored = new Map<string, { score: number; member: string }[]>();
  private values = new Map<string, { v: unknown; exp: number | null }>();
  private hashes = new Map<string, Record<string, string>>();

  private live(key: string) {
    const e = this.values.get(key);
    if (!e) return null;
    if (e.exp !== null && e.exp < Date.now()) {
      this.values.delete(key);
      return null;
    }
    return e;
  }
  async zaddLex(key: string, member: string) {
    const arr = this.zsets.get(key) ?? [];
    if (!arr.includes(member)) {
      arr.push(member);
      arr.sort();
    }
    this.zsets.set(key, arr);
  }
  async zrangeLexAfter(key: string, after: string | null, count: number) {
    const arr = this.zsets.get(key) ?? [];
    const filtered = after === null ? arr : arr.filter((m) => m.slice(0, after.length) > after);
    return filtered.slice(0, count);
  }
  async zrangeLast(key: string, n: number) {
    const arr = this.zsets.get(key) ?? [];
    return n <= 0 ? [] : arr.slice(-n);
  }
  async zcard(key: string) {
    return (this.zsets.get(key) ?? []).length;
  }
  async zcountLexAfter(key: string, after: string) {
    return (this.zsets.get(key) ?? []).filter((m) => m.slice(0, after.length) > after).length;
  }
  async zaddScore(key: string, score: number, member: string) {
    const arr = this.scored.get(key) ?? [];
    arr.push({ score, member });
    arr.sort((a, b) => a.score - b.score);
    this.scored.set(key, arr);
  }
  async get<T>(key: string) {
    return (this.live(key)?.v as T | undefined) ?? null;
  }
  async set(key: string, value: unknown, opts?: { ex?: number; nx?: boolean }) {
    if (opts?.nx && this.live(key)) return false;
    this.values.set(key, { v: value, exp: opts?.ex ? Date.now() + opts.ex * 1000 : null });
    return true;
  }
  async del(key: string) {
    this.values.delete(key);
  }
  async incr(key: string, opts?: { ex?: number }) {
    const cur = (this.live(key)?.v as number | undefined) ?? 0;
    const next = cur + 1;
    const exp = this.live(key)?.exp ?? (opts?.ex ? Date.now() + opts.ex * 1000 : null);
    this.values.set(key, { v: next, exp });
    return next;
  }
  async hincrby(key: string, field: string, by: number) {
    const h = this.hashes.get(key) ?? {};
    h[field] = String(Number(h[field] ?? 0) + by);
    this.hashes.set(key, h);
  }
  async hset(key: string, fields: Record<string, string | number>) {
    const h = this.hashes.get(key) ?? {};
    for (const [k, v] of Object.entries(fields)) h[k] = String(v);
    this.hashes.set(key, h);
  }
  async hgetall(key: string) {
    const h = this.hashes.get(key);
    return h ? { ...h } : null;
  }
}

declare global {
  var __schmeckleMemoryKV: MemoryKV | undefined;
}

let upstash: UpstashKV | null = null;

/** Returns the configured store, or null in production when Upstash is missing. */
export function getKV(): KV | null {
  if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
    upstash ??= new UpstashKV(
      new Redis({ url: env.UPSTASH_REDIS_REST_URL, token: env.UPSTASH_REDIS_REST_TOKEN }),
    );
    return upstash;
  }
  if (env.NODE_ENV === "production" && process.env.VERCEL) return null;
  // Local dev / tests: shared in-memory world (survives HMR via globalThis).
  globalThis.__schmeckleMemoryKV ??= new MemoryKV();
  return globalThis.__schmeckleMemoryKV;
}

export const KEYS = {
  log: "sw:log",
  snapshot: "sw:snapshot",
  ingestRound: "sw:ingest:round",
  ingestLock: "sw:lock:ingest",
  ingestMetrics: "sw:metrics:ingest",
  treasury: "sw:treasury",
  token: "sw:token",
  heatHistory: "sw:heat:history",
  rateLimit: (ip: string, minute: number) => `sw:rl:${ip}:${minute}`,
} as const;
