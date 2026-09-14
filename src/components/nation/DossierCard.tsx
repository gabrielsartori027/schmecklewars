"use client";

import { DANGER_THREATS, type Nation } from "@/config/nations";
import { evolutionFor, nextEvolution } from "@/lib/domain/evolution";
import { STAT_KEYS, type NationStats } from "@/lib/domain/types";
import { totalPower } from "@/lib/domain/attacks";
import { useWorld } from "@/store/world";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { StatBar } from "@/components/ui/StatBar";
import { NationEmblem } from "./NationEmblem";

export function DossierCard({
  nation,
  stats,
  index,
}: {
  nation: Nation;
  stats: NationStats;
  index: number;
}) {
  const select = useWorld((s) => s.select);
  const evo = evolutionFor(stats.xp);
  const next = nextEvolution(stats.xp);
  return (
    <Card
      className="animate-fade-up"
      accent={nation.color}
      hover
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="flex gap-4">
        <div className="flex shrink-0 flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => select(nation.code)}
            aria-label={`Open ${nation.persona}`}
            className="rounded-full"
          >
            <NationEmblem code={nation.code} size={72} xp={stats.xp} />
          </button>
          <Badge color={evo.color}>
            {evo.badge} {evo.title}
          </Badge>
          <div className="mono-label text-fg-muted">
            XP {stats.xp}
            {next ? ` / ${next.min}` : ""}
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-lg" aria-hidden>
              {nation.flag}
            </span>
            <h2 className="font-display text-lg font-bold" style={{ color: nation.color }}>
              {nation.persona}
            </h2>
            <Badge
              color={
                DANGER_THREATS.has(nation.threat) ? "var(--color-danger)" : "var(--color-warning)"
              }
            >
              {nation.threat}
            </Badge>
          </div>
          <div className="mono-label mt-0.5 text-fg-muted">
            {nation.name} · {nation.role} · power {totalPower(stats)}
          </div>
          <p className="mt-2 text-sm text-fg-secondary">{nation.description}</p>
          <p className="mt-1 font-display text-xs italic text-fg-muted">“{nation.quote}”</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {Object.entries(nation.resources).map(([k, v]) => (
              <span
                key={k}
                className="rounded-[var(--radius-sm)] border border-border-subtle bg-bg-surface-2 px-2 py-1 font-mono text-[11px]"
              >
                <span className="text-fg-muted">{k}: </span>
                <span className="font-semibold" style={{ color: nation.color }}>
                  {v}
                </span>
              </span>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-1 gap-x-5 gap-y-1.5 sm:grid-cols-2">
            {STAT_KEYS.map((k) => (
              <StatBar key={k} stat={k} value={stats[k]} />
            ))}
          </div>
          <div className="mono-label mt-3 text-fg-muted" title={nation.sourceNote}>
            Ops {stats.kills} · Hits {stats.hits} · editorial data 2024–25 (hover for source)
          </div>
        </div>
      </div>
    </Card>
  );
}
