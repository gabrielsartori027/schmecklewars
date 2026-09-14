import "server-only";
import { encodeTime, monotonicFactory } from "ulid";
import type { LogEntry } from "@/lib/domain/types";
import { KEYS, type KV } from "./kv";

const SEP = "#";
const ulid = monotonicFactory();

/** Members are `${ulid}#${json}` so lexicographic order == chronological order. */
export function encodeEntry(entry: LogEntry): string {
  return `${entry.id}${SEP}${JSON.stringify(entry)}`;
}

export function decodeEntry(member: string): LogEntry | null {
  const i = member.indexOf(SEP);
  if (i <= 0) return null;
  try {
    return JSON.parse(member.slice(i + 1)) as LogEntry;
  } catch {
    return null;
  }
}

export function newEntryId(at = Date.now()): string {
  return ulid(at);
}

/** ULID that sorts before every id created at or after `at` (used as a time cursor). */
export function cursorAt(at: number): string {
  return `${encodeTime(at, 10)}0000000000000000`;
}

export async function appendEntries(kv: KV, entries: LogEntry[]): Promise<void> {
  for (const e of entries) await kv.zaddLex(KEYS.log, encodeEntry(e));
}

export async function readAfter(kv: KV, after: string | null, limit: number): Promise<LogEntry[]> {
  const members = await kv.zrangeLexAfter(KEYS.log, after, limit);
  return members.map(decodeEntry).filter((e): e is LogEntry => e !== null);
}

/** Reads the whole log after a cursor in pages (used to rebuild snapshots). */
export async function readAllAfter(
  kv: KV,
  after: string | null,
  pageSize = 500,
): Promise<LogEntry[]> {
  const out: LogEntry[] = [];
  let cursor = after;
  for (;;) {
    const page = await readAfter(kv, cursor, pageSize);
    out.push(...page);
    if (page.length < pageSize) break;
    cursor = page[page.length - 1]!.id;
  }
  return out;
}

export async function readLast(kv: KV, n: number): Promise<LogEntry[]> {
  const members = await kv.zrangeLast(KEYS.log, n);
  return members.map(decodeEntry).filter((e): e is LogEntry => e !== null);
}

export async function countAfter(kv: KV, after: string): Promise<number> {
  return kv.zcountLexAfter(KEYS.log, after);
}

export async function logSize(kv: KV): Promise<number> {
  return kv.zcard(KEYS.log);
}
