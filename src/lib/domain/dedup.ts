import { STOP_WORDS } from "@/config/stop-words";
import { sourceQuality } from "@/config/sources";
import type { NationCode } from "./types";

export interface SeenEvent {
  id: string;
  a: NationCode;
  t: NationCode;
  h: string;
  url?: string;
  quality: number;
}

export function extractKeywords(text: string | undefined | null): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

/** `sim = |A∩B| / min(|A|,|B|)` over keyword sets. */
export function keywordSimilarity(kw1: string[], kw2: string[]): number {
  if (!kw1.length || !kw2.length) return 0;
  const s1 = new Set(kw1);
  const s2 = new Set(kw2);
  let overlap = 0;
  for (const w of s1) if (s2.has(w)) overlap++;
  return overlap / Math.min(s1.size, s2.size);
}

export type DedupResult =
  | { isDupe: false }
  | { isDupe: true; upgrade: null }
  | { isDupe: true; upgrade: { targetId: string; newUrl: string; newQuality: number } };

/**
 * Duplicate if: first 40 chars equal OR (sim > 0.55 and same pair, either direction) OR sim > 0.70.
 * When the new source is better, report an upgrade (log stays append-only: a `source_upgrade` entry).
 */
export function checkDuplicate(
  item: { a: NationCode; t: NationCode; h: string; url?: string },
  seen: readonly SeenEvent[],
): DedupResult {
  const kw = extractKeywords(item.h);
  const newQuality = sourceQuality(item.url);
  const head = item.h.toLowerCase().slice(0, 40);
  for (const ex of seen) {
    const sameActors = (item.a === ex.a && item.t === ex.t) || (item.a === ex.t && item.t === ex.a);
    const sim = keywordSimilarity(kw, extractKeywords(ex.h));
    const exact = head === ex.h.toLowerCase().slice(0, 40);
    if (exact || (sim > 0.55 && sameActors) || sim > 0.7) {
      if (item.url && newQuality > ex.quality) {
        return { isDupe: true, upgrade: { targetId: ex.id, newUrl: item.url, newQuality } };
      }
      return { isDupe: true, upgrade: null };
    }
  }
  return { isDupe: false };
}
