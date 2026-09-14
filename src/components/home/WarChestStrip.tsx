"use client";

import { ArrowRight } from "lucide-react";
import { SITE } from "@/config/site";
import { TOKEN } from "@/config/token";
import { useCountdown } from "@/hooks/useCountdown";
import { fmtCountdown, fmtUsd } from "@/lib/format";
import { useWorld } from "@/store/world";
import { LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="min-w-0">
      <div className="mono-label text-fg-muted">{label}</div>
      <div className="mt-1 truncate font-display text-xl font-bold tabular text-fg-primary sm:text-2xl">
        {value}
      </div>
      {sub ? (
        <div className="mt-0.5 truncate font-mono text-[11px] text-fg-muted">{sub}</div>
      ) : null}
    </div>
  );
}

/** Top of the Home: the War Chest is the theme; the index is the engine. */
export function WarChestStrip() {
  const chest = useWorld((s) => s.chest);
  const epoch = useWorld((s) => s.epoch);
  const countdown = useCountdown(chest?.nextDropAt ?? null);
  const open = Boolean(chest?.configured && epoch?.genesis);
  const buyHref = TOKEN.launchpadUrl ?? TOKEN.swapUrl ?? "/token";

  return (
    <Card className="overflow-hidden" accent="var(--color-aid)">
      <div className="grid gap-5 lg:grid-cols-[1.3fr_2fr_auto] lg:items-center">
        <div>
          <div className="mono-label text-aid">War Chest · Robinhood Chain</div>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-fg-primary sm:text-3xl">
            {SITE.motto}
          </h1>
          <p className="mt-1 text-sm text-fg-secondary">{SITE.tagline}</p>
        </div>
        {open ? (
          <div className="grid min-h-[5.75rem] grid-cols-3 gap-3">
            <Stat
              label="Raised this epoch"
              value={fmtUsd(chest?.balanceUsd)}
              sub={`balance · Epoch ${epoch?.n ?? 1}`}
            />
            <Stat
              label="Aid sent"
              value={fmtUsd(chest?.aidLifetimeUsd ?? 0, { zero: "$0" })}
              sub="first drop after Epoch 1"
            />
            <Stat
              label="Next drop in"
              value={countdown !== null ? fmtCountdown(countdown) : "—"}
              sub={
                chest?.nextDropAt
                  ? new Date(chest.nextDropAt).toISOString().slice(0, 10) + " UTC"
                  : undefined
              }
            />
          </div>
        ) : (
          <div className="flex min-h-[5.75rem] items-center rounded-[var(--radius-md)] border border-dashed border-border-hover px-4 py-3 text-sm text-fg-secondary">
            The Chest opens at launch — the Safe address, live balance and Epoch 1 countdown appear
            here the moment the token goes live.
          </div>
        )}
        <div className="flex flex-wrap gap-2 lg:flex-col">
          <LinkButton href="/warchest" variant="aid">
            How the War Chest works <ArrowRight size={16} strokeWidth={1.75} />
          </LinkButton>
          <LinkButton href={buyHref} variant="primary" external={buyHref.startsWith("http")}>
            Buy {TOKEN.symbol}
          </LinkButton>
        </div>
      </div>
    </Card>
  );
}
