/** Source quality ranking — copied verbatim from the original `SOURCE_RANK` (higher = better). */
export const SOURCE_RANK: Readonly<Record<string, number>> = {
  "reuters.com": 100,
  "apnews.com": 95,
  "bbc.com": 90,
  "bbc.co.uk": 90,
  "aljazeera.com": 85,
  "theguardian.com": 82,
  "nytimes.com": 80,
  "washingtonpost.com": 78,
  "france24.com": 76,
  "dw.com": 74,
  "timesofisrael.com": 73,
  "jpost.com": 72,
  "haaretz.com": 71,
  "cnn.com": 70,
  "foxnews.com": 65,
  "nbcnews.com": 65,
  "cbsnews.com": 65,
  "sky.com": 62,
  "independent.co.uk": 60,
  "telegraph.co.uk": 60,
  "economist.com": 58,
  "foreignpolicy.com": 56,
  "politico.com": 55,
  "bloomberg.com": 54,
  "ft.com": 53,
  "wsj.com": 52,
  "ukrinform.net": 50,
  "pravda.com.ua": 48,
  "kyivindependent.com": 48,
  "tass.com": 40,
  "rt.com": 30,
  "presstv.ir": 25,
  "news.google.com": 15,
};

export const UNKNOWN_SOURCE_QUALITY = 20;
export const NO_URL_QUALITY = 5;

export function sourceQuality(url: string | undefined | null): number {
  if (!url) return NO_URL_QUALITY;
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    const exact = SOURCE_RANK[host];
    if (exact !== undefined) return exact;
    for (const [domain, score] of Object.entries(SOURCE_RANK)) {
      if (host.includes(domain) || domain.includes(host)) return score;
    }
    return UNKNOWN_SOURCE_QUALITY;
  } catch {
    return NO_URL_QUALITY;
  }
}

/** Indicator: ≥ 80 green · ≥ 50 yellow · ≥ 20 orange · else gray. */
export function sourceQualityColor(q: number): string {
  if (q >= 80) return "#39FF14";
  if (q >= 50) return "#FFD700";
  if (q >= 20) return "#FF6B00";
  return "#6B7681";
}
