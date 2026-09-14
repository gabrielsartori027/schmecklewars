"use client";

import { ExternalLink } from "lucide-react";
import { NATIONS } from "@/config/nations";
import { THEATER_META } from "@/config/theaters";
import { searchUrlFor } from "@/lib/domain/attacks";
import { useWorld } from "@/store/world";
import { NationEmblem } from "@/components/nation/NationEmblem";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

export function LatestEvent() {
  const e = useWorld((s) => s.events[0]);
  const status = useWorld((s) => s.status);
  const nations = useWorld((s) => s.canonical.nations);
  if (!e) {
    return (
      <Card className="flex h-full min-h-[10.5rem] items-center justify-center text-center">
        <div>
          <div
            className="mx-auto mb-2 size-6 animate-spin-slow rounded-full border-2 border-brand/60 border-t-transparent"
            style={{ animationDuration: "2s" }}
            aria-hidden
          />
          <div className="font-display text-sm font-semibold text-fg-secondary">
            {status === "offline"
              ? "Shared world offline — the log is empty here."
              : "Scanning active war zones for current events..."}
          </div>
        </div>
      </Card>
    );
  }
  const a = NATIONS[e.a];
  const t = NATIONS[e.t];
  const th = THEATER_META[e.th];
  return (
    <Card className="h-full animate-fade-up" accent="var(--color-brand)" hover>
      <a
        href={e.url ?? searchUrlFor(e.h)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-full flex-col gap-3"
      >
        <div className="flex items-center gap-3">
          <NationEmblem code={e.a} size={36} xp={nations[e.a].xp} active="attacker" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
              <Badge color="var(--color-brand)">{e.simulated ? "SIMULATION" : "⚡ LIVE"}</Badge>
              <span className="font-display font-bold" style={{ color: a.color }}>
                {a.persona}
              </span>
              <span className="text-fg-muted">⚔️</span>
              <span className="font-display font-bold" style={{ color: t.color }}>
                {t.persona}
              </span>
            </div>
            <div className="mono-label mt-1 text-fg-muted">
              {e.d} · <span style={{ color: th.color }}>{th.label}</span> · sv {e.sv}
            </div>
          </div>
          <NationEmblem code={e.t} size={30} xp={nations[e.t].xp} active="target" />
        </div>
        <p className="line-clamp-2 text-sm text-fg-secondary">{e.h}</p>
        <div className="mt-auto flex items-center gap-1 font-mono text-[11px] text-fg-muted">
          <ExternalLink size={12} aria-hidden /> {e.url ? "Read the source" : "Search Google News"}
        </div>
      </a>
    </Card>
  );
}
