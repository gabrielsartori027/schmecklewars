"use client";

import { ARSENAL, ARSENAL_NOTE, ARSENAL_TITLE, METHODOLOGY, RISK_FACTORS } from "@/config/doomsday";
import { NATIONS, NATION_LIST } from "@/config/nations";
import { TIERS } from "@/config/tiers";
import { PAIR_MULT } from "@/config/ww3";
import { useProjected } from "@/hooks/useProjected";
import { totalPower } from "@/lib/domain/attacks";
import { evolutionFor } from "@/lib/domain/evolution";
import { NATION_CODES } from "@/lib/domain/types";
import { useFlip } from "@/hooks/useFlip";
import { useWorld } from "@/store/world";
import { NationEmblem } from "@/components/nation/NationEmblem";
import { Card, SectionTitle } from "@/components/ui/Card";

export function TierLadder() {
  const { tier } = useProjected();
  return (
    <Card>
      <SectionTitle as="h2">Tier ladder</SectionTitle>
      <ol className="space-y-1">
        {TIERS.map((t, i) => {
          const from = i === 0 ? 0 : TIERS[i - 1]!.max;
          const active = t.label === tier.label;
          return (
            <li
              key={t.label}
              className="flex items-center gap-3 rounded-[var(--radius-sm)] px-2 py-1.5"
              style={
                active
                  ? {
                      background: `color-mix(in srgb, ${t.color} 12%, transparent)`,
                      outline: `1px solid color-mix(in srgb, ${t.color} 40%, transparent)`,
                    }
                  : undefined
              }
            >
              <span className="w-5 text-center" aria-hidden>
                {t.icon}
              </span>
              <span className="w-14 shrink-0 font-mono text-[11px] tabular text-fg-secondary">
                {from}–{t.max}%
              </span>
              <span
                className="w-24 shrink-0 font-display text-xs font-bold"
                style={{ color: `color-mix(in srgb, ${t.color} 68%, white)` }}
              >
                {t.label}
              </span>
              <span className="min-w-0 flex-1 truncate text-xs text-fg-secondary">
                {t.description}
              </span>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}

export function Methodology() {
  return (
    <Card>
      <SectionTitle as="h2">How This Is Calculated</SectionTitle>
      <div className="space-y-2 text-sm leading-relaxed text-fg-secondary">
        {METHODOLOGY.map((m) => (
          <p key={m.lead}>
            <span className="font-semibold" style={{ color: m.color }}>
              {m.lead}
            </span>{" "}
            {m.text}
          </p>
        ))}
      </div>
    </Card>
  );
}

export function RiskFactors() {
  return (
    <Card accent="var(--color-danger)">
      <SectionTitle as="h2" sub="editorial · 2024–25">
        Active Risk Factors
      </SectionTitle>
      <ul className="divide-y divide-border-subtle">
        {RISK_FACTORS.map((rf) => (
          <li key={rf.factor} className="flex gap-3 py-2.5">
            <div
              className="w-1 shrink-0 self-stretch rounded-full"
              style={{ background: rf.color }}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-display text-sm font-bold" style={{ color: rf.color }}>
                  {rf.factor}
                </span>
                <span
                  className="font-display text-sm font-bold tabular"
                  style={{ color: rf.color }}
                >
                  {rf.pct}%
                </span>
              </div>
              <p className="mt-0.5 text-xs leading-relaxed text-fg-secondary">{rf.rationale}</p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function Arsenal() {
  return (
    <Card accent="var(--color-orange)">
      <SectionTitle as="h2">{ARSENAL_TITLE}</SectionTitle>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {ARSENAL.map((a) => {
          const n = NATIONS[a.code];
          return (
            <li
              key={a.code}
              className="rounded-[var(--radius-md)] border border-border-subtle bg-bg-surface-2 p-2.5 text-center"
            >
              <div className="mono-label text-fg-muted">
                {n.flag} {n.name}
              </div>
              <div
                className="mt-1 font-display text-xl font-bold tabular"
                style={{ color: n.color }}
              >
                {a.warheads}
              </div>
              <div className="mono-label text-fg-muted">{a.posture}</div>
            </li>
          );
        })}
      </ul>
      <p className="mono-label mt-3 text-center text-fg-muted">{ARSENAL_NOTE}</p>
    </Card>
  );
}

/** All unique pairs (fixes original bug #8, which showed only six). */
export function Multipliers() {
  return (
    <Card>
      <SectionTitle as="h2" sub="how event pairs affect the index">
        Escalation Multipliers
      </SectionTitle>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {PAIR_MULT.map(([a, b, m, why]) => {
          const color =
            m > 2
              ? "var(--color-danger)"
              : m > 1.5
                ? "#FF8C00"
                : m >= 1
                  ? "var(--color-warning)"
                  : "var(--color-fg-secondary)";
          return (
            <li
              key={`${a}-${b}`}
              className="rounded-[var(--radius-md)] border border-border-subtle bg-bg-surface-2 p-2.5 text-center"
              title={why}
            >
              <div className="mono-label text-fg-muted">
                {NATIONS[a].flag} ↔ {NATIONS[b].flag}
              </div>
              <div className="font-display text-xl font-bold tabular" style={{ color }}>
                {m.toFixed(1)}×
              </div>
              <div className="truncate text-[11px] text-fg-muted">{why}</div>
            </li>
          );
        })}
        <li className="rounded-[var(--radius-md)] border border-dashed border-border-subtle p-2.5 text-center">
          <div className="mono-label text-fg-muted">any other pair</div>
          <div className="font-display text-xl font-bold tabular text-fg-secondary">1.0×</div>
          <div className="text-[11px] text-fg-muted">baseline</div>
        </li>
      </ul>
    </Card>
  );
}

export function PowerRanking() {
  const nations = useWorld((s) => s.canonical.nations);
  const ranked = [...NATION_CODES]
    .map((c) => ({ code: c, total: totalPower(nations[c]), xp: nations[c].xp }))
    .sort((a, b) => b.total - a.total);
  const medal = ["linear-gradient(135deg,#FFD700,#FF8800)", "#8a8f96", "#8B6914"];
  const listRef = useFlip<HTMLOListElement>([ranked.map((r) => r.code).join(",")]);
  return (
    <Card>
      <SectionTitle as="h2" sub="sum of the six stats">
        Power Ranking
      </SectionTitle>
      <ol ref={listRef} className="space-y-1.5">
        {ranked.map((r, i) => {
          const n = NATIONS[r.code];
          const evo = evolutionFor(r.xp);
          return (
            <li
              key={r.code}
              data-flip-key={r.code}
              className="flex items-center gap-3 rounded-[var(--radius-md)] border border-border-subtle bg-bg-surface-2 px-3 py-2"
            >
              <span
                className="flex size-7 shrink-0 items-center justify-center rounded-full font-display text-xs font-bold text-black"
                style={{ background: medal[i] ?? "#2a3138", color: i < 3 ? "#000" : "#9AA4AF" }}
              >
                {i + 1}
              </span>
              <NationEmblem code={r.code} size={28} xp={r.xp} showRank={false} />
              <span
                className="min-w-0 flex-1 truncate font-display text-sm font-bold"
                style={{ color: n.color }}
              >
                {n.flag} {n.persona} <span className="mono-label text-fg-muted">{evo.badge}</span>
              </span>
              <span className="font-display text-base font-bold tabular text-warning">
                {r.total}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="mono-label mt-2 text-fg-muted">
        {NATION_LIST.length} nations · stats move with every real event
      </p>
    </Card>
  );
}
