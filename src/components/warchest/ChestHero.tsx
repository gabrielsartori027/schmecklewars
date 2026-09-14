"use client";

import { SITE } from "@/config/site";
import { useCountdown } from "@/hooks/useCountdown";
import { useTreasury } from "@/hooks/useTreasury";
import { fmtCountdown, fmtDateTimeUtc, fmtUsd } from "@/lib/format";
import { useWorld } from "@/store/world";
import { AddressChip } from "@/components/ui/AddressChip";
import { Card } from "@/components/ui/Card";

function Stat({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="rounded-[var(--radius-md)] border border-border-subtle bg-bg-surface-2 p-3">
      <div className="mono-label text-fg-muted">{label}</div>
      <div
        className="mt-1 font-display text-2xl font-bold tabular"
        style={{ color: accent ?? "var(--color-fg-primary)" }}
      >
        {value}
      </div>
      {sub ? <div className="mt-0.5 font-mono text-[11px] text-fg-muted">{sub}</div> : null}
    </div>
  );
}

export function ChestHero() {
  const treasury = useTreasury(30_000);
  const t = treasury.data?.ok ? treasury.data : null;
  const epoch = useWorld((s) => s.epoch);
  const chest = useWorld((s) => s.chest);
  const nextDropAt = chest?.nextDropAt ?? null;
  const countdown = useCountdown(nextDropAt);
  const configured = Boolean(t?.configured && t.address);
  const ethStr =
    t?.balanceEth !== null && t?.balanceEth !== undefined ? `${t.balanceEth.toFixed(4)} ETH` : "—";
  const stableStr =
    t?.stable.amount !== null && t?.stable.amount !== undefined
      ? `${t.stable.amount.toLocaleString("en-US", { maximumFractionDigits: 2 })} ${t.stable.symbol}`
      : `— ${t?.stable.symbol ?? "USDG"}`;

  return (
    <Card accent="var(--color-aid)" className="overflow-hidden">
      <div className="mono-label text-aid">
        Public treasury · Safe multisig 2-of-3 · Robinhood Chain
      </div>
      <h1 className="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl">WAR CHEST</h1>
      <p className="mt-1 max-w-2xl text-sm text-fg-secondary">
        {SITE.tagline} {SITE.motto}
      </p>
      {configured && t?.address ? (
        <>
          <div className="mt-4">
            <AddressChip address={t.address} />
            {t.stale ? (
              <p className="mono-label mt-2 text-warning">
                RPC unreachable — showing the last known balance
              </p>
            ) : null}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat
              label="Chest balance"
              value={fmtUsd(t.balanceUsd)}
              sub={`${ethStr} · ${stableStr}`}
              accent="var(--color-aid)"
            />
            <Stat
              label="Raised this epoch"
              value={fmtUsd(t.balanceUsd)}
              sub={`balance · Epoch ${epoch?.n || 1} (inflow tracking lands in Phase 1)`}
            />
            <Stat label="Aid sent (lifetime)" value="$0" sub="first drop after Epoch 1" />
            <Stat
              label="Next Aid Drop"
              value={countdown !== null ? fmtCountdown(countdown) : "—"}
              sub={nextDropAt ? fmtDateTimeUtc(nextDropAt) : "GENESIS_TS not set"}
              accent="var(--color-warning)"
            />
          </div>
        </>
      ) : (
        <div className="mt-4 rounded-[var(--radius-md)] border border-dashed border-border-hover p-4 text-sm text-fg-secondary">
          <span className="font-display font-semibold text-fg-primary">
            The Chest opens at launch.
          </span>{" "}
          The Safe address, the live ETH/USDG balance and the Epoch 1 countdown appear here the
          moment the token goes live. Nothing is shown before it exists.
        </div>
      )}
    </Card>
  );
}
