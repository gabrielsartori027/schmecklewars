"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ExternalLink, X } from "lucide-react";
import { DANGER_THREATS, NATIONS } from "@/config/nations";
import { STAT_KEYS } from "@/lib/domain/types";
import { searchUrlFor } from "@/lib/domain/attacks";
import { evolutionFor } from "@/lib/domain/evolution";
import { useWorld } from "@/store/world";
import { Badge } from "@/components/ui/Badge";
import { StatBar } from "@/components/ui/StatBar";
import { NationEmblem } from "./NationEmblem";

/** Sheet with stats, Ops/XP/Hits/Level grid and Battle History (mirrors the original modal). */
export function NationDrawer() {
  const selected = useWorld((s) => s.selected);
  const select = useWorld((s) => s.select);
  const nations = useWorld((s) => s.canonical.nations);
  const events = useWorld((s) => s.events);
  const n = selected ? NATIONS[selected] : null;
  const s = selected ? nations[selected] : null;
  const evo = s ? evolutionFor(s.xp) : null;
  const history = selected
    ? events.filter((e) => e.a === selected || e.t === selected).slice(0, 8)
    : [];
  return (
    <Dialog.Root open={Boolean(selected)} onOpenChange={(o) => !o && select(null)}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-[state=open]:animate-fade-up" />
        <Dialog.Content
          className="card fixed bottom-0 left-1/2 z-50 max-h-[88dvh] w-full max-w-lg -translate-x-1/2 overflow-y-auto rounded-b-none p-5 outline-none data-[state=open]:animate-fade-up sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:rounded-[var(--radius-xl)]"
          style={n ? { borderColor: `color-mix(in srgb, ${n.color} 35%, transparent)` } : undefined}
          aria-describedby={undefined}
        >
          {n && s && evo ? (
            <>
              <Dialog.Close
                className="absolute right-3 top-3 inline-flex size-10 items-center justify-center rounded-full border border-border-subtle text-fg-secondary hover:text-fg-primary"
                aria-label="Close"
              >
                <X size={16} strokeWidth={1.75} />
              </Dialog.Close>
              <div className="text-center">
                <NationEmblem code={n.code} size={72} xp={s.xp} className="mx-auto" />
                <Dialog.Title
                  className="mt-3 font-display text-2xl font-bold"
                  style={{ color: n.color }}
                >
                  {n.persona}
                </Dialog.Title>
                <div className="text-sm text-fg-secondary">
                  {n.flag} {n.name} · {n.role}
                </div>
                <div className="mt-2 flex flex-wrap justify-center gap-2">
                  <Badge
                    color={
                      DANGER_THREATS.has(n.threat) ? "var(--color-danger)" : "var(--color-warning)"
                    }
                  >
                    {n.threat}
                  </Badge>
                  <Badge color={evo.color}>
                    {evo.badge} {evo.title}
                  </Badge>
                  <Badge color="var(--color-fg-secondary)">XP {s.xp}</Badge>
                </div>
                <p className="mt-3 text-sm text-fg-secondary">{n.description}</p>
                <p className="mt-1 font-display text-xs italic text-fg-muted">“{n.quote}”</p>
              </div>
              <div className="mt-4 space-y-1.5">
                {STAT_KEYS.map((k) => (
                  <StatBar key={k} stat={k} value={s[k]} />
                ))}
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2">
                {[
                  { l: "Ops", v: s.kills, c: "var(--color-brand)" },
                  { l: "XP", v: s.xp, c: "var(--color-warning)" },
                  { l: "Hits", v: s.hits, c: "var(--color-danger)" },
                  { l: "Level", v: evo.title, c: evo.color },
                ].map((x) => (
                  <div
                    key={x.l}
                    className="rounded-[var(--radius-md)] border border-border-subtle bg-bg-surface-2 p-2 text-center"
                  >
                    <div
                      className="truncate font-display text-base font-bold"
                      style={{ color: x.c }}
                      title={String(x.v)}
                    >
                      {x.v}
                    </div>
                    <div className="mono-label text-fg-muted">{x.l}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <div className="mono-label mb-2 text-fg-muted">Battle history · click to read</div>
                {history.length === 0 ? (
                  <p className="text-xs text-fg-muted">No battles recorded yet in this session.</p>
                ) : (
                  <ul className="space-y-1">
                    {history.map((e) => (
                      <li key={e.id}>
                        <a
                          href={e.url ?? searchUrlFor(e.h)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded-[var(--radius-sm)] px-1 py-1.5 text-xs text-fg-secondary hover:bg-bg-surface-2 hover:text-fg-primary"
                        >
                          <span
                            style={{
                              color: e.a === n.code ? "var(--color-brand)" : "var(--color-danger)",
                            }}
                            aria-hidden
                          >
                            {e.a === n.code ? "⚡" : "💥"}
                          </span>
                          <span className="min-w-0 flex-1 truncate">{e.h}</span>
                          <ExternalLink size={12} className="shrink-0 text-fg-muted" aria-hidden />
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
