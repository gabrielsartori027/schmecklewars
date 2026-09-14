"use client";

import { NATIONS } from "@/config/nations";
import { searchUrlFor } from "@/lib/domain/attacks";
import { useWorld } from "@/store/world";

/** CSS ticker (45 s loop, pauses on hover) with the 10 latest events. Verified aid drops get 💚 (Phase 1). */
export function Ticker() {
  const events = useWorld((s) => s.events);
  const status = useWorld((s) => s.status);
  if (events.length === 0) {
    // Same height as the live ticker so nothing shifts when the first events arrive.
    return (
      <div
        className="overflow-hidden border-b border-border-subtle"
        aria-label="Latest events ticker"
      >
        <div className="flex h-8 items-center px-4 font-mono text-[11px] text-fg-muted">
          {status === "loading"
            ? "● connecting to the shared world…"
            : status === "shared"
              ? "● monitoring active theaters — events appear here as they are ingested"
              : "● shared world offline"}
        </div>
      </div>
    );
  }
  const items = events.slice(0, 10);
  const loop = [...items, ...items];
  return (
    <div
      className="overflow-hidden border-b border-danger/15 bg-danger/[0.04]"
      aria-label="Latest events ticker"
    >
      <div className="flex h-8 w-max animate-ticker items-center whitespace-nowrap">
        {loop.map((e, i) => {
          const a = NATIONS[e.a];
          const t = NATIONS[e.t];
          const link = e.url ?? searchUrlFor(e.h);
          return (
            <a
              key={`${e.id}-${i}`}
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="mx-4 inline-flex items-center gap-1.5 font-mono text-[11px] text-fg-secondary hover:text-fg-primary"
              aria-hidden={i >= items.length}
              tabIndex={i >= items.length ? -1 : 0}
            >
              <span className="text-brand" aria-hidden>
                ●
              </span>
              <span className="text-fg-muted">[{e.d}]</span>
              <span style={{ color: a.color }}>{a.persona}</span>
              <span className="text-fg-muted">⚔️</span>
              <span style={{ color: t.color }}>{t.persona}</span>
              {e.simulated ? <span className="text-warning">SIMULATION</span> : null}
            </a>
          );
        })}
      </div>
    </div>
  );
}
