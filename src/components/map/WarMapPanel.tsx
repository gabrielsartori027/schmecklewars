"use client";

import dynamic from "next/dynamic";
import { useWorld } from "@/store/world";
import { Card } from "@/components/ui/Card";

const WarMap = dynamic(() => import("./WarMap"), {
  ssr: false,
  loading: () => (
    <div className="flex aspect-[960/600] w-full items-center justify-center rounded-[var(--radius-md)] border border-border-subtle bg-bg-surface-2 sm:aspect-[960/470]">
      <span className="mono-label text-fg-muted">LOADING WAR MAP…</span>
    </div>
  ),
});

export function MapStatus() {
  const fetching = useWorld((s) => s.fetching);
  const current = useWorld((s) => s.current);
  const queued = useWorld((s) => s.queue.length);
  const eventsToday = useWorld((s) => s.eventsToday);
  const status = useWorld((s) => s.status);
  return (
    <div
      className="flex h-5 w-full items-center gap-x-3 overflow-x-auto whitespace-nowrap font-mono text-[11px] text-fg-muted no-scrollbar sm:w-auto"
      aria-live="polite"
    >
      {fetching ? (
        <span className="animate-pulse-live text-brand">● SCANNING WAR ZONES</span>
      ) : null}
      {current ? <span className="text-warning">⚔️ ATTACKING</span> : null}
      {queued > 0 ? <span className="text-orange">{queued} queued</span> : null}
      <span>⚡ {eventsToday} events today</span>
      <span title="Computed on the server from a public, append-only event log">
        {status === "shared"
          ? "🌐 shared world"
          : status === "loading"
            ? "… connecting"
            : status === "offline"
              ? "⚠️ world offline"
              : "⚠️ sync error"}
      </span>
    </div>
  );
}

export function WarMapPanel() {
  return (
    <Card className="relative p-2 sm:p-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 px-1">
        <h2 className="font-display text-base font-bold text-fg-primary sm:text-lg">
          <span className="text-brand">◎</span> War Map — Dimension C-137
        </h2>
        <MapStatus />
      </div>
      <WarMap />
    </Card>
  );
}
