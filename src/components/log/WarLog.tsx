"use client";

import { ExternalLink, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { NATIONS } from "@/config/nations";
import { sourceQuality, sourceQualityColor } from "@/config/sources";
import { THEATER_META } from "@/config/theaters";
import { searchUrlFor } from "@/lib/domain/attacks";
import { hostnameOf } from "@/lib/format";
import type { LogEntry } from "@/lib/domain/types";
import { useWorld } from "@/store/world";
import { NationEmblem } from "@/components/nation/NationEmblem";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, SectionTitle } from "@/components/ui/Card";

const SYNC_COOLDOWN_MS = 15_000;

export function TheaterBadge({ th }: { th: LogEntry["th"] }) {
  const t = THEATER_META[th];
  return <Badge color={t.color}>{t.label}</Badge>;
}

function EventRow({ e }: { e: LogEntry }) {
  const a = NATIONS[e.a];
  const t = NATIONS[e.t];
  const q = sourceQuality(e.url);
  const host = hostnameOf(e.url);
  const link = e.url ?? searchUrlFor(e.h);
  return (
    <li className="animate-fade-up">
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-start gap-3 rounded-[var(--radius-md)] px-2 py-2.5 transition-colors hover:bg-bg-surface-2"
        title={e.url ? `Read on ${host}` : "Search Google News for this event"}
      >
        <NationEmblem code={e.a} size={28} showRank={false} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            <Badge color={e.simulated ? "var(--color-warning)" : "var(--color-brand)"}>
              {e.simulated ? "SIMULATION" : "⚡ LIVE"}
            </Badge>
            <span className="font-mono text-fg-muted">{e.d}</span>
            <span className="font-display font-bold" style={{ color: a.color }}>
              {a.persona}
            </span>
            <span className="text-fg-muted">⚔️</span>
            <span className="font-display font-bold" style={{ color: t.color }}>
              {t.persona}
            </span>
            <TheaterBadge th={e.th} />
            <span className="mono-label text-fg-muted">
              {e.tp} · sv {e.sv}
            </span>
          </div>
          <p className="mt-1 text-sm text-fg-secondary group-hover:text-fg-primary">{e.h}</p>
          <div className="mt-1 flex items-center gap-1.5 font-mono text-[11px] text-fg-muted">
            <span
              className="inline-block size-1.5 rounded-full"
              style={{ background: sourceQualityColor(q) }}
              aria-hidden
            />
            {host ? (
              <span>
                📰 {host} · quality {q}
              </span>
            ) : (
              <span>🔍 no source url — click to search</span>
            )}
            <ExternalLink
              size={11}
              className="opacity-0 transition-opacity group-hover:opacity-100"
              aria-hidden
            />
          </div>
        </div>
        <NationEmblem code={e.t} size={28} showRank={false} active="target" />
      </a>
    </li>
  );
}

export function WarLog() {
  const events = useWorld((s) => s.events);
  const fetching = useWorld((s) => s.fetching);
  const eventsToday = useWorld((s) => s.eventsToday);
  const status = useWorld((s) => s.status);
  const syncNow = useWorld((s) => s.syncNow);
  const [lastSync, setLastSync] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const cooldown = Math.max(0, SYNC_COOLDOWN_MS - (now - lastSync));
  const sync = async () => {
    setLastSync(Date.now());
    await syncNow();
  };
  return (
    <div className="space-y-3">
      <SectionTitle
        as="h1"
        sub={
          <span className="flex flex-wrap items-center gap-3">
            <span className={fetching ? "text-warning" : "text-brand"}>
              {fetching ? "● Scanning war zones..." : "● Monitoring active theaters"}
            </span>
            <span>⚡ {eventsToday} events today</span>
            <span>Only verified military actions 🔗</span>
          </span>
        }
      >
        📡 War Log — Active Conflicts Only
      </SectionTitle>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-fg-muted">
          Events are ingested on the server every few minutes; this button re-syncs your view.
        </p>
        <Button size="sm" onClick={() => void sync()} disabled={cooldown > 0 || fetching}>
          <RefreshCw
            size={14}
            strokeWidth={1.75}
            className={fetching ? "animate-spin" : undefined}
          />
          {cooldown > 0 ? `Sync (${Math.ceil(cooldown / 1000)}s)` : "Sync"}
        </Button>
      </div>
      <Card padded={false} className="p-2">
        {events.length === 0 ? (
          <div className="py-14 text-center">
            <div className="mb-3 text-3xl" aria-hidden>
              🛸
            </div>
            <div className="font-display text-base font-semibold text-fg-secondary">
              {status === "offline" ? "Shared world offline" : "Scanning active war zones..."}
            </div>
            <div className="mono-label mt-1 text-fg-muted">
              Connecting to interdimensional intelligence feeds
            </div>
            <div className="mono-label mt-2 text-fg-muted">
              Only CURRENT military events will appear here — no old news
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-border-subtle">
            {events.map((e) => (
              <EventRow key={e.id} e={e} />
            ))}
          </ul>
        )}
      </Card>
      <p className="mono-label text-fg-muted">
        This log is public and append-only →{" "}
        <a
          href="/api/events"
          target="_blank"
          rel="noopener noreferrer"
          className="text-info underline decoration-info/40 underline-offset-2 hover:decoration-info"
        >
          /api/events
        </a>
      </p>
    </div>
  );
}
