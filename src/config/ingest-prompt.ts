/**
 * Ingest prompt — based on the `schmeckle-wars-v2` news prompt ("military intelligence
 * analyst", ✅ ACCEPT / ❌ REJECT lists, today/yesterday rule), with three changes (prompt §9.1):
 *  1. codes include UKRAINE (and the "USA (Ukraine-related too)" note is gone);
 *  2. the JSON gains `th` (theater);
 *  3. `d` must be the real date of the event (today or yesterday), not fixed to today.
 *
 * `tp` keeps the original's four types (military|nuclear|cyber|intel): diplomacy/economy exist
 * in the weights and Zod accepts them, but the model is not asked for them — same as the original.
 */
export const INGEST_PROMPT_VERSION = "2.1.0";

export interface IngestPromptInput {
  query: string;
  today: string; // YYYY-MM-DD (UTC)
  yesterday: string; // YYYY-MM-DD (UTC)
}

export function buildIngestPrompt({ query, today, yesterday }: IngestPromptInput): string {
  return `You are a military intelligence analyst. Search the web RIGHT NOW for: "${query}"

⚠️ CRITICAL DATE REQUIREMENT: Today is ${today}. ONLY return events dated ${today} or ${yesterday}.
ANY event before ${yesterday} must be COMPLETELY IGNORED — zero tolerance for old news.

Find 2-4 CURRENT military events happening RIGHT NOW or in the last 24 hours ONLY.

✅ ACCEPT:
- Airstrikes, drone attacks, bombings with specific location — HAPPENING TODAY
- Ground combat, territorial changes reported TODAY
- Missile launches or interceptions from LAST 24 HOURS
- Military casualties confirmed TODAY
- Active naval confrontations happening NOW
- Nuclear developments announced TODAY
- Weapons arriving at frontline TODAY

❌ REJECT ABSOLUTELY:
- ANYTHING before ${yesterday} — even if it's important
- Political statements, speeches, diplomatic talks
- "Tensions" or "concerns" without a specific military event TODAY
- Historical context, background summaries
- Future plans, speculation, analysis

Each headline: WHO + WHAT military action + WHERE + must be from today/yesterday

Codes: USA, ISRAEL, IRAN (Hamas/Hezbollah/Houthis), FRANCE (NATO), RUSSIA, CHINA, NKOREA, UKRAINE
Theaters: EASTERN_FRONT (Russia–Ukraine, NATO–Russia), MIDDLE_EAST (Israel–Iran, Gaza, Lebanon, Yemen/Red Sea), INDO_PACIFIC (China–Taiwan, South China Sea), KOREAN_PENINSULA (North Korea), GLOBAL (cyber / no geography)

ONLY valid JSON:
[{"a":"ATTACKER","t":"TARGET","h":"specific current military action max 90 chars","tp":"military|nuclear|cyber|intel","sv":1-10,"d":"YYYY-MM-DD (the real date of the event: ${today} or ${yesterday})","th":"EASTERN_FRONT|MIDDLE_EAST|INDO_PACIFIC|KOREAN_PENINSULA|GLOBAL","url":"https://source.com/article"}]

url = real article URL. Prefer reuters.com, apnews.com, bbc.com.
JSON ONLY. Zero old news.`;
}
