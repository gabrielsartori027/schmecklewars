export interface Tier {
  /** inclusive upper bound: the tier applies while `index <= max` */
  max: number;
  label: string;
  description: string;
  color: string;
  icon: string;
}

/**
 * WW3 probability tiers — copied from the original `DOOM` (Bulletin of the Atomic Scientists
 * methodology; "90 seconds to midnight" baseline).
 */
export const TIERS: readonly Tier[] = [
  {
    max: 5,
    label: "PEACETIME",
    description: "No active major conflicts between nuclear powers",
    color: "#39FF14",
    icon: "🕊️",
  },
  {
    max: 12,
    label: "LOW RISK",
    description: "Regional proxy conflicts only. Nuclear powers not directly involved",
    color: "#7FFF00",
    icon: "🟢",
  },
  {
    max: 22,
    label: "ELEVATED",
    description: "Multiple active wars. 90 seconds to midnight. Current baseline.",
    color: "#FFD700",
    icon: "🟡",
  },
  {
    max: 35,
    label: "HIGH RISK",
    description: "Nuclear-armed states in direct confrontation. Doctrines updated.",
    color: "#FF8C00",
    icon: "🟠",
  },
  {
    max: 50,
    label: "SEVERE",
    description: "Direct military exchanges between nuclear powers. Red lines crossed.",
    color: "#FF4500",
    icon: "🔴",
  },
  {
    max: 70,
    label: "CRITICAL",
    description: "Nuclear weapons deployed to forward positions. Launch drills active.",
    color: "#FF073A",
    icon: "🚨",
  },
  {
    max: 90,
    label: "IMMINENT",
    description: "Nuclear first-strike considered. DEFCON 1. Evacuations ordered.",
    color: "#FF0000",
    icon: "☢️",
  },
  {
    max: 100,
    label: "EXTINCTION",
    description: "Strategic nuclear exchange initiated. Civilization collapse.",
    color: "#CC0000",
    icon: "💀",
  },
] as const;
