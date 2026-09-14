import { z } from "zod";
import { NATION_CODES, STAT_KEYS, THEATERS } from "@/lib/domain/types";

/** Section 7.5 item 2 — Zod schema for one model item. */
export const RawItemSchema = z.object({
  a: z.enum(NATION_CODES),
  t: z.enum(NATION_CODES),
  h: z.string().trim().min(15).max(90),
  tp: z.enum(STAT_KEYS),
  sv: z.number().int().min(1).max(10),
  d: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  url: z.string().url().optional().nullable(),
  th: z.enum(THEATERS).optional().nullable(),
});
export type RawItem = z.infer<typeof RawItemSchema>;

/** Tolerant pre-normalization: trims a headline that is slightly too long, coerces numeric strings. */
function normalize(x: unknown): unknown {
  if (!x || typeof x !== "object") return x;
  const o = { ...(x as Record<string, unknown>) };
  if (typeof o.h === "string" && o.h.length > 90) o.h = o.h.slice(0, 90).trim();
  if (typeof o.sv === "string" && /^\d+$/.test(o.sv)) o.sv = Number(o.sv);
  if (typeof o.sv === "number") o.sv = Math.round(o.sv);
  if (typeof o.a === "string") o.a = o.a.toUpperCase().replace(/\s+/g, "");
  if (typeof o.t === "string") o.t = o.t.toUpperCase().replace(/\s+/g, "");
  if (typeof o.th === "string") o.th = o.th.toUpperCase().replace(/[\s-]+/g, "_");
  if (typeof o.tp === "string") o.tp = o.tp.toLowerCase();
  if (o.url === "") o.url = undefined;
  return o;
}

/**
 * Extracts the LAST JSON array from a text (model output), ignoring code fences and any
 * prose around it. Scans for balanced brackets so nested arrays/objects are handled.
 */
export function extractLastJsonArray(text: string): unknown[] | null {
  const cleaned = text.replace(/```(?:json)?/gi, "");
  const candidates: string[] = [];
  let depth = 0;
  let start = -1;
  let inString = false;
  let escape = false;
  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i]!;
    if (inString) {
      if (escape) escape = false;
      else if (ch === "\\") escape = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === "[" || ch === "{") {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === "]" || ch === "}") {
      depth--;
      if (depth === 0 && start >= 0) {
        if (cleaned[start] === "[") candidates.push(cleaned.slice(start, i + 1));
        start = -1;
      }
      if (depth < 0) {
        depth = 0;
        start = -1;
      }
    }
  }
  for (let i = candidates.length - 1; i >= 0; i--) {
    try {
      const parsed: unknown = JSON.parse(candidates[i]!);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      /* try the previous candidate */
    }
  }
  return null;
}

export interface ParseResult {
  items: RawItem[];
  invalid: number;
}

export function parseItems(raw: unknown[]): ParseResult {
  const items: RawItem[] = [];
  let invalid = 0;
  for (const x of raw) {
    const r = RawItemSchema.safeParse(normalize(x));
    if (r.success) items.push(r.data);
    else invalid++;
  }
  return { items, invalid };
}

export function utcDay(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}
