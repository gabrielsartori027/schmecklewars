import type { NationCode } from "@/lib/domain/types";
import { WW3_BASELINE } from "./ww3";

export interface RiskFactor {
  factor: string;
  rationale: string;
  pct: number;
  color: string;
}

/** Copied verbatim from the original "Active Risk Factors" list. */
export const RISK_FACTORS: readonly RiskFactor[] = [
  {
    factor: "Russia-Ukraine War",
    rationale:
      "Full-scale conventional war between nuclear power and NATO-backed state. 1000+ days active. Russia updated nuclear doctrine Nov 2024. Oreshnik hypersonic IRBM deployed.",
    pct: 35,
    color: "#FFD700",
  },
  {
    factor: "Israel-Iran Direct Exchanges",
    rationale:
      "Two direct missile exchanges in 2024 (Apr & Oct). Iran pursuing nuclear weapons capability. Could draw in USA and trigger regional nuclear war.",
    pct: 28,
    color: "#FF4D00",
  },
  {
    factor: "China-Taiwan Flashpoint",
    rationale:
      "PLA encirclement drills (Joint Sword 2024A & B). 370+ warship fleet. USA committed to Taiwan defense. Nuclear powers on collision course.",
    pct: 22,
    color: "#FF6B00",
  },
  {
    factor: "North Korea Arsenal",
    rationale:
      "50+ warheads. ICBM capability proven. 12K troops fighting in Russia. Unpredictable regime with nothing to lose.",
    pct: 12,
    color: "#BF40FF",
  },
  {
    factor: "Nuclear Doctrine Escalation",
    rationale:
      "Russia: 'Any attack backed by nuclear state = nuclear response.' Multiple nations lowering thresholds for nuclear use.",
    pct: 40,
    color: "#FF073A",
  },
  {
    factor: "Doomsday Clock Position",
    rationale:
      "90 seconds to midnight — closest in history. Set Jan 2024. Reflects judgment of nuclear scientists worldwide.",
    pct: 22,
    color: "#FFD700",
  },
];

export interface ArsenalEntry {
  code: NationCode;
  warheads: string;
  posture: string;
}

/** Copied verbatim from the original "Global Nuclear Arsenal" grid. */
export const ARSENAL_TITLE = "Global Nuclear Arsenal — 12,100+ warheads";
export const ARSENAL: readonly ArsenalEntry[] = [
  { code: "RUSSIA", warheads: "6,255", posture: "Active" },
  { code: "USA", warheads: "5,550", posture: "Active" },
  { code: "CHINA", warheads: "500+", posture: "Growing fast" },
  { code: "FRANCE", warheads: "290", posture: "Submarine" },
  { code: "ISRAEL", warheads: "90*", posture: "Undeclared" },
  { code: "NKOREA", warheads: "50+", posture: "Expanding" },
  { code: "IRAN", warheads: "0†", posture: "Threshold" },
];
export const ARSENAL_NOTE = "*estimated †threshold state • Source: FAS/SIPRI 2024";

export interface MethodologyParagraph {
  lead: string;
  color: string;
  text: string;
}

/** Four paragraphs copied from the original + a fifth new one (prompt §8.4). */
export const METHODOLOGY: readonly MethodologyParagraph[] = [
  {
    lead: `Baseline: ${WW3_BASELINE}%`,
    color: "#39FF14",
    text: "— Based on Bulletin of Atomic Scientists Doomsday Clock at 90 seconds to midnight (closest ever). Multiple active wars between nuclear-aligned states. Updated nuclear doctrines.",
  },
  {
    lead: "Live adjustments:",
    color: "#FF6B00",
    text: "Each real military event adjusts the index based on: event severity (1-10), event type (nuclear events weighted 2.8x, military 1x, cyber 0.8x), and which countries are involved (USA-Russia direct = 2.5x multiplier, Israel-Iran = 1.8x).",
  },
  {
    lead: "De-escalation:",
    color: "#00D4FF",
    text: `Index slowly decays toward baseline (${WW3_BASELINE}%) when no new escalation events occur, simulating diplomatic cooling periods. It never drops below baseline while active wars continue.`,
  },
  {
    lead: "Diminishing returns:",
    color: "#FF073A",
    text: "The higher the index, the harder each event pushes it further — reflecting that each additional escalation step requires exponentially more provocation.",
  },
  {
    lead: "Shared world:",
    color: "#BF40FF",
    text: "computed on the server from a public, append-only event log. Every visitor sees the same number.",
  },
];
