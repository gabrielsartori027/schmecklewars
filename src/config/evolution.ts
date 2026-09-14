export interface EvolutionLevel {
  min: number;
  title: string;
  badge: string;
  color: string;
}

/**
 * Copied from the original `EVOLUTIONS`. The two grays were #555 / #888 in the original; they are
 * lifted here because they are used as text (WCAG AA ≥ 4.5:1 on the dark surfaces).
 */
export const EVOLUTIONS: readonly EvolutionLevel[] = [
  { min: 0, title: "Recruit", badge: "🔰", color: "#8A96A2" },
  { min: 50, title: "Soldier", badge: "⭐", color: "#B3BCC6" },
  { min: 120, title: "Commander", badge: "🎖️", color: "#FFD700" },
  { min: 200, title: "War Lord", badge: "👑", color: "#FF6B00" },
  { min: 350, title: "Dimension Breaker", badge: "🌀", color: "#39FF14" },
  { min: 500, title: "Multiverse Conqueror", badge: "💀", color: "#FF073A" },
] as const;

/** Level Up overlay: shown 800 ms after the attack, for 3 500 ms (original timings). */
export const LEVEL_UP_DELAY_MS = 800;
export const LEVEL_UP_DURATION_MS = 3500;
