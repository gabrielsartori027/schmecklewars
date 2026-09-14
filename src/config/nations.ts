import type { NationCode, StatKey } from "@/lib/domain/types";

export type ThreatLevel = "OMEGA" | "LETHAL" | "HIGH" | "MODERATE" | "CRITICAL" | "WILDCARD";

export type EmblemKind =
  "flask" | "crosshair" | "skull" | "feather" | "eye" | "hive" | "robot" | "sunflower";

export interface Nation {
  code: NationCode;
  name: string;
  persona: string;
  flag: string;
  color: string;
  role: string;
  threat: ThreatLevel;
  quote: string;
  base: Record<StatKey, number>;
  description: string;
  resources: Record<string, string>;
  emblem: EmblemKind;
  /** [lon, lat] used for the map marker (label point, not necessarily the centroid). */
  marker: [number, number];
  /** ISO 3166-1 numeric id in world-atlas. */
  iso: number;
  /** Editorial numbers (2024–25). Review periodically (SIPRI/FAS, Bulletin). Do not "fix" alone. */
  sourceNote: string;
}

/** Data copied verbatim from the original `N` object (2024–25 editorial numbers). */
export const NATIONS: Record<NationCode, Nation> = {
  USA: {
    code: "USA",
    name: "USA",
    persona: "Rick C-137",
    flag: "🇺🇸",
    color: "#39FF14",
    role: "Scientific Superpower",
    threat: "OMEGA",
    quote: "Wubba Lubba Dub Dub!",
    base: { military: 95, economy: 94, nuclear: 88, cyber: 96, diplomacy: 75, intel: 97 },
    description: "5,550 warheads · 11 carriers · $886B budget",
    resources: { Troops: "1.39M", Budget: "$886B", Nukes: "5,550" },
    emblem: "flask",
    marker: [-98.5, 39.5],
    iso: 840,
    sourceNote: "FAS/SIPRI 2024 warhead estimate; FY2024 budget.",
  },
  ISRAEL: {
    code: "ISRAEL",
    name: "Israel",
    persona: "Krombopulos Michael",
    flag: "🇮🇱",
    color: "#FF4D00",
    role: "Precision Assassin",
    threat: "LETHAL",
    quote: "Oh boy, here I go killing again!",
    base: { military: 82, economy: 62, nuclear: 80, cyber: 92, diplomacy: 28, intel: 98 },
    description: "Iron Dome 97% · Mossad · Unit 8200 · At war since Oct 7",
    resources: { Troops: "634K", Budget: "$23B", Nukes: "90*" },
    emblem: "crosshair",
    marker: [34.9, 31.4],
    iso: 376,
    sourceNote: "*estimated, undeclared arsenal (FAS 2024).",
  },
  IRAN: {
    code: "IRAN",
    name: "Iran",
    persona: "Evil Rick",
    flag: "🇮🇷",
    color: "#FF073A",
    role: "Absolute Nemesis",
    threat: "HIGH",
    quote: "I'm the real deal, baby.",
    base: { military: 58, economy: 35, nuclear: 52, cyber: 55, diplomacy: 30, intel: 62 },
    description: "IRGC · Hezbollah · Hamas · Houthis · 60% enriched uranium",
    resources: { Troops: "610K", Budget: "$6.8B", U235: "60%" },
    emblem: "skull",
    marker: [53.7, 32.4],
    iso: 364,
    sourceNote: "IAEA reporting on 60% enrichment (2024–25).",
  },
  FRANCE: {
    code: "FRANCE",
    name: "France",
    persona: "Birdperson",
    flag: "🇫🇷",
    color: "#00D4FF",
    role: "Honor Diplomat",
    threat: "MODERATE",
    quote: "It has been a challenging mating season for Birdperson.",
    base: { military: 65, economy: 70, nuclear: 68, cyber: 60, diplomacy: 85, intel: 68 },
    description: "290 warheads · Charles de Gaulle carrier · SCALP missiles",
    resources: { Troops: "205K", Budget: "$54B", Nukes: "290" },
    emblem: "feather",
    marker: [2.2, 46.6],
    iso: 250,
    sourceNote: "FAS/SIPRI 2024.",
  },
  RUSSIA: {
    code: "RUSSIA",
    name: "Russia",
    persona: "Evil Morty",
    flag: "🇷🇺",
    color: "#FFD700",
    role: "Supreme Strategist",
    threat: "CRITICAL",
    quote: "I'm done being a sidekick.",
    base: { military: 82, economy: 40, nuclear: 98, cyber: 78, diplomacy: 25, intel: 80 },
    description: "6,255 warheads · Full invasion since Feb 2022 · 500K+ casualties",
    resources: { Troops: "1.33M", Budget: "$109B", Nukes: "6,255" },
    emblem: "eye",
    marker: [60, 58],
    iso: 643,
    sourceNote: "FAS/SIPRI 2024; casualty figures are open-source estimates.",
  },
  CHINA: {
    code: "CHINA",
    name: "China",
    persona: "Unity",
    flag: "🇨🇳",
    color: "#FF6B00",
    role: "Hivemind Collective",
    threat: "CRITICAL",
    quote: "We are one.",
    base: { military: 88, economy: 92, nuclear: 75, cyber: 90, diplomacy: 52, intel: 82 },
    description: "2M troops · 500+ warheads · 370+ ships · Taiwan escalation",
    resources: { Troops: "2.0M", Budget: "$296B", Nukes: "500+" },
    emblem: "hive",
    marker: [103.5, 35.5],
    iso: 156,
    sourceNote: "DoD China Military Power Report 2024; SIPRI.",
  },
  NKOREA: {
    code: "NKOREA",
    name: "N.Korea",
    persona: "Scary Terry",
    flag: "🇰🇵",
    color: "#BF40FF",
    role: "Existential Artillery",
    threat: "WILDCARD",
    quote: "You can run but you can't hide, bitch!",
    base: { military: 40, economy: 6, nuclear: 38, cyber: 25, diplomacy: 3, intel: 28 },
    description: "50+ warheads · Hwasong-18 ICBM · 12K troops in Russia",
    resources: { Troops: "1.28M", Budget: "$3.6B", Nukes: "50+" },
    emblem: "robot",
    marker: [127.2, 40.2],
    iso: 408,
    sourceNote: "FAS 2024; troop deployment per ROK/US reporting (late 2024).",
  },
  UKRAINE: {
    code: "UKRAINE",
    name: "Ukraine",
    persona: "Mr. Meeseeks",
    flag: "🇺🇦",
    color: "#0EA5E9",
    role: "Drone Warfare Pioneer",
    threat: "HIGH",
    quote: "I'm Mr. Meeseeks, look at me!",
    base: { military: 60, economy: 25, nuclear: 5, cyber: 72, diplomacy: 80, intel: 75 },
    description: "Drone warfare pioneer · 1,000+ days of full-scale war · NATO-backed",
    resources: { Troops: "900K", Budget: "$65B", Drones: "1M+/yr" },
    emblem: "sunflower",
    marker: [31.5, 49],
    iso: 804,
    sourceNote: "Drone production target per Ukrainian MoD (2024–25); budget incl. aid.",
  },
};

export const NATION_LIST: Nation[] = Object.values(NATIONS);

/** Threats painted with --danger; everything else with --warning (as in the original). */
export const DANGER_THREATS: ReadonlySet<ThreatLevel> = new Set(["OMEGA", "CRITICAL", "LETHAL"]);

export const isNationCode = (v: unknown): v is NationCode =>
  typeof v === "string" && Object.prototype.hasOwnProperty.call(NATIONS, v);
