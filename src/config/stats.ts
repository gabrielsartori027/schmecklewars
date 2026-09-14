import type { StatKey } from "@/lib/domain/types";

export interface StatMeta {
  key: StatKey;
  label: string; // MIL / ECO / …
  name: string;
  color: string;
  /** lucide icon name, rendered by <StatIcon/> */
  icon: "Swords" | "Coins" | "Radiation" | "Cpu" | "Handshake" | "Eye";
}

/** Order and colors are the original's `SM`; emojis replaced by lucide icons (prompt §7.2). */
export const STATS: Record<StatKey, StatMeta> = {
  military: { key: "military", label: "MIL", name: "Military", color: "#FF073A", icon: "Swords" },
  economy: { key: "economy", label: "ECO", name: "Economy", color: "#FFD700", icon: "Coins" },
  nuclear: { key: "nuclear", label: "NUK", name: "Nuclear", color: "#FF6B00", icon: "Radiation" },
  cyber: { key: "cyber", label: "CYB", name: "Cyber", color: "#00D4FF", icon: "Cpu" },
  diplomacy: {
    key: "diplomacy",
    label: "DIP",
    name: "Diplomacy",
    color: "#39FF14",
    icon: "Handshake",
  },
  intel: { key: "intel", label: "INT", name: "Intel", color: "#BF40FF", icon: "Eye" },
};

export const STAT_LIST = Object.values(STATS);

export const STAT_MIN = 1;
export const STAT_MAX = 120;
