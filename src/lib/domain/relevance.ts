import { ACTION_RE, MIN_WAR_HITS, TALK_ONLY_RE, WAR_KEYWORDS } from "@/config/keywords";

/** ≥ 2 war keywords in the headline (original `isWarRelevant`). */
export function isWarRelevant(headline: string | undefined | null): boolean {
  if (!headline || headline.length < 15) return false;
  const words = headline
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .split(/\s+/);
  let hits = 0;
  for (const w of words) if (WAR_KEYWORDS.has(w)) hits++;
  return hits >= MIN_WAR_HITS;
}

/** Matches the talk-only regex and none of the action verbs → discard. */
export function isTalkOnly(headline: string): boolean {
  const low = headline.toLowerCase();
  return TALK_ONLY_RE.test(low) && !ACTION_RE.test(low);
}
