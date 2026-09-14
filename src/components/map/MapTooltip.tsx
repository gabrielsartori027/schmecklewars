"use client";

import { DANGER_THREATS, NATIONS } from "@/config/nations";
import { evolutionFor } from "@/lib/domain/evolution";
import { STAT_KEYS, type NationCode } from "@/lib/domain/types";
import { useWorld } from "@/store/world";
import { NationEmblem } from "@/components/nation/NationEmblem";
import { StatBar } from "@/components/ui/StatBar";

export function MapTooltip({ code }: { code: NationCode }) {
  const n = NATIONS[code];
  const s = useWorld((st) => st.canonical.nations[code]);
  const evo = evolutionFor(s.xp);
  return (
    <div
      className="card pointer-events-none absolute right-2 top-2 z-10 hidden w-56 p-3 animate-fade-up sm:block"
      style={{ borderColor: `color-mix(in srgb, ${n.color} 40%, transparent)` }}
      role="tooltip"
    >
      <div className="mb-2 flex items-center gap-2">
        <NationEmblem code={code} size={32} xp={s.xp} showRank={false} />
        <div className="min-w-0">
          <div className="truncate font-display text-sm font-bold" style={{ color: n.color }}>
            {n.persona}
          </div>
          <div className="mono-label truncate text-fg-muted">
            {n.flag} {n.name} ·{" "}
            <span
              style={{
                color: DANGER_THREATS.has(n.threat)
                  ? "var(--color-danger)"
                  : "var(--color-warning)",
              }}
            >
              {n.threat}
            </span>
          </div>
          <div className="mono-label truncate text-fg-muted">
            {evo.badge} {evo.title} · XP {s.xp}
          </div>
        </div>
      </div>
      <div className="space-y-1">
        {STAT_KEYS.map((k) => (
          <StatBar key={k} stat={k} value={s[k]} compact />
        ))}
      </div>
    </div>
  );
}
