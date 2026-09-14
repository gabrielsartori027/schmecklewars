import { STAT_MAX, STAT_MIN } from "@/config/stats";
import { NATIONS } from "@/config/nations";
import { fnv1a } from "@/lib/utils";
import { NATION_CODES, STAT_KEYS, type NationCode, type NationStats, type StatKey } from "./types";

export interface AttackInput {
  id: string;
  a: NationCode;
  t: NationCode;
  tp: StatKey;
  sv: number;
}

export interface AttackEffect {
  a: NationCode;
  t: NationCode; // resolved target (never equal to `a`)
  stat: StatKey;
  boost: number;
  dmg: number;
  xpGain: number;
}

/** `se a === t → target aleatório diferente (determinístico: seed = id do evento)` */
export function resolveTarget(id: string, a: NationCode, t: NationCode): NationCode {
  if (a !== t) return t;
  const others = NATION_CODES.filter((k) => k !== a);
  return others[fnv1a(id) % others.length]!;
}

/** `boost = floor(sv*0.6)+2 ; dmg = floor(sv*0.5)+2 ; xpGain = floor(sv*2)+5` */
export function attackEffect(ev: AttackInput): AttackEffect {
  const t = resolveTarget(ev.id, ev.a, ev.t);
  const stat: StatKey = (STAT_KEYS as readonly string[]).includes(ev.tp) ? ev.tp : "military";
  return {
    a: ev.a,
    t,
    stat,
    boost: Math.floor(ev.sv * 0.6) + 2,
    dmg: Math.floor(ev.sv * 0.5) + 2,
    xpGain: Math.floor(ev.sv * 2) + 5,
  };
}

export function initialNationStats(code: NationCode): NationStats {
  return { ...NATIONS[code].base, xp: 0, kills: 0, hits: 0 };
}

export function initialNations(): Record<NationCode, NationStats> {
  const out = {} as Record<NationCode, NationStats>;
  for (const code of NATION_CODES) out[code] = initialNationStats(code);
  return out;
}

/**
 * Pure: returns a new nations record with the attack applied.
 * attacker[stat] = min(120, +boost) ; target[stat] = max(1, −dmg)
 * attacker.kills++ ; attacker.xp += xpGain ; target.hits++ ; target.xp += floor(xpGain/3)
 */
export function applyAttack(
  nations: Record<NationCode, NationStats>,
  ev: AttackInput,
): { nations: Record<NationCode, NationStats>; effect: AttackEffect } {
  const effect = attackEffect(ev);
  const atk = { ...nations[effect.a] };
  const tgt = { ...nations[effect.t] };
  atk[effect.stat] = Math.min(STAT_MAX, atk[effect.stat] + effect.boost);
  tgt[effect.stat] = Math.max(STAT_MIN, tgt[effect.stat] - effect.dmg);
  atk.kills += 1;
  atk.xp += effect.xpGain;
  tgt.hits += 1;
  tgt.xp += Math.floor(effect.xpGain / 3);
  return { nations: { ...nations, [effect.a]: atk, [effect.t]: tgt }, effect };
}

/** Power Ranking total = sum of the 6 stats. */
export function totalPower(s: NationStats): number {
  return STAT_KEYS.reduce((sum, k) => sum + s[k], 0);
}

export function searchUrlFor(headline: string): string {
  return `https://news.google.com/search?q=${encodeURIComponent(headline.slice(0, 60))}&hl=en`;
}
