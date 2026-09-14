import { EVOLUTIONS, type EvolutionLevel } from "@/config/evolution";

export function evolutionFor(xp: number): EvolutionLevel {
  let current: EvolutionLevel = EVOLUTIONS[0]!;
  for (const e of EVOLUTIONS) if (xp >= e.min) current = e;
  return current;
}

export function nextEvolution(xp: number): EvolutionLevel | null {
  return EVOLUTIONS.find((e) => e.min > xp) ?? null;
}
