"use client";

import NumberFlow from "@number-flow/react";
import { EPOCH_EVERY } from "@/config/epochs";
import { RICK_SPEECH } from "@/config/site";
import { TOKEN } from "@/config/token";
import { useProjected } from "@/hooks/useProjected";
import { useTokenData } from "@/hooks/useTokenData";
import { fmtDelta, fmtSupply, fmtUsd } from "@/lib/format";
import { useWorld } from "@/store/world";
import { NationEmblem } from "@/components/nation/NationEmblem";
import { Card, SectionTitle } from "@/components/ui/Card";

export function PriceCard() {
  const q = useTokenData(Boolean(TOKEN.ca));
  const d = q.data?.ok ? q.data : null;
  const live = Boolean(d?.indexed && d.price);
  return (
    <Card className="text-center" accent={live ? "var(--color-brand)" : undefined}>
      <div className="mono-label flex items-center justify-center gap-2 text-fg-muted">
        {live ? (
          <span className="size-2 animate-pulse-live rounded-full bg-brand" aria-hidden />
        ) : null}
        {!TOKEN.ca
          ? "Waiting for the contract address"
          : live
            ? `LIVE from ${d?.source === "dexscreener" ? "DexScreener" : "GeckoTerminal"}`
            : "Price feed connecting…"}
      </div>
      <div
        className="mt-2 font-display text-4xl font-bold tabular text-brand sm:text-5xl"
        aria-live="polite"
      >
        {live && d?.price ? (
          <NumberFlow
            value={d.price}
            format={{
              minimumFractionDigits:
                d.price < 0.0001 ? 10 : d.price < 0.001 ? 8 : d.price < 1 ? 6 : 2,
              maximumFractionDigits:
                d.price < 0.0001 ? 10 : d.price < 0.001 ? 8 : d.price < 1 ? 6 : 2,
            }}
            prefix="$"
          />
        ) : (
          "—"
        )}
      </div>
      <div className="mt-2 flex items-center justify-center gap-4 font-mono text-xs">
        {(["5m", "1h", "24h"] as const).map((l) => {
          const v = l === "5m" ? d?.change5m : l === "1h" ? d?.change1h : d?.change24h;
          return (
            <span
              key={l}
              style={{
                color:
                  v === null || v === undefined
                    ? "var(--color-fg-muted)"
                    : v >= 0
                      ? "var(--color-brand)"
                      : "var(--color-danger)",
              }}
            >
              {l}: {fmtDelta(v)}
            </span>
          );
        })}
      </div>
      {d?.fetchedAt ? (
        <div className="mono-label mt-2 text-fg-muted">
          Updated {new Date(d.fetchedAt).toLocaleTimeString("en-US", { hour12: false })}
        </div>
      ) : null}
      {TOKEN.ca && !live ? (
        <p className="mt-2 text-xs text-fg-muted">
          The pool has not been indexed yet. No number is shown until a real one exists.
        </p>
      ) : null}
    </Card>
  );
}

export function MarketStats() {
  const q = useTokenData(Boolean(TOKEN.ca));
  const d = q.data?.ok && q.data.indexed ? q.data : null;
  const chest = useWorld((s) => s.chest);
  const items = [
    { l: "Market Cap", v: fmtUsd(d?.marketCap) },
    { l: "24h Volume", v: fmtUsd(d?.volume24h) },
    { l: "Liquidity", v: fmtUsd(d?.liquidity) },
    {
      l: "War Chest",
      v: chest?.configured ? fmtUsd(chest.balanceUsd) : "opens at launch",
      aid: true,
    },
  ];
  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {items.map((x) => (
        <li key={x.l} className="card p-3 text-center">
          <div
            className="font-display text-lg font-bold tabular"
            style={{ color: x.aid ? "var(--color-aid)" : "var(--color-brand)" }}
          >
            {x.v}
          </div>
          <div className="mono-label mt-1 text-fg-muted">{x.l}</div>
        </li>
      ))}
    </ul>
  );
}

export function RickSpeech() {
  const [introBefore, introAfter] = RICK_SPEECH.intro.split("human conflict");
  const [bodyBefore, bodyAfter] = RICK_SPEECH.body.split("War Chest");
  return (
    <Card accent="var(--color-brand)">
      <div className="flex items-start gap-3">
        <NationEmblem code="USA" size={48} showRank={false} />
        <div>
          <div className="mono-label text-brand">Rick C-137 speaking</div>
          <p className="mt-1 text-sm leading-relaxed text-fg-primary">
            {introBefore}
            <span className="font-semibold text-danger">human conflict</span>
            {introAfter}
          </p>
        </div>
      </div>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-fg-secondary">
        <p>
          {bodyBefore}
          <span className="font-semibold text-aid">War Chest</span>
          {bodyAfter}
        </p>
        <p className="font-display font-semibold text-fg-primary">{RICK_SPEECH.outro}</p>
      </div>
    </Card>
  );
}

export function Tokenomics() {
  const q = useTokenData(Boolean(TOKEN.ca));
  const d = q.data?.ok && q.data.indexed ? q.data : null;
  const { index, tier } = useProjected();
  const rows: [string, string, string?][] = [
    ["Token", `${TOKEN.name} (${TOKEN.symbol})`],
    ["Network", `Robinhood Chain (chain ${TOKEN.chainId})`],
    ["Contract", TOKEN.ca ? `${TOKEN.ca.slice(0, 8)}…${TOKEN.ca.slice(-8)}` : "drops at launch"],
    ["Total Supply", fmtSupply(d?.totalSupply)],
    ["Market Cap", fmtUsd(d?.marketCap)],
    ["Liquidity", fmtUsd(d?.liquidity)],
    ["24h Volume", fmtUsd(d?.volume24h)],
    ["Creator share of fees → War Chest", "100%", "var(--color-aid)"],
    ["Aid / Ops / Reserve", "70 / 20 / 10", "var(--color-aid)"],
    ["Aid Drop cadence", EPOCH_EVERY, "var(--color-aid)"],
    [
      "Tax",
      "0% — Rick doesn't do taxes. The Chest fills from the creator share of launchpad fees, not from you.",
    ],
    ["WW3 Index", `${index.toFixed(1)}% — ${tier.label}`],
  ];
  return (
    <Card>
      <SectionTitle as="h2">🧪 Tokenomics</SectionTitle>
      <dl className="divide-y divide-border-subtle text-sm">
        {rows.map(([k, v, c]) => (
          <div key={k} className="flex flex-wrap justify-between gap-x-4 gap-y-1 py-2">
            <dt className="text-fg-muted">{k}</dt>
            <dd
              className="max-w-[60%] text-right font-mono text-xs"
              style={{ color: c ?? "var(--color-brand)" }}
            >
              {v}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-xs text-fg-muted">
        Creator share on Pons v2 is 70 % of the 1 % trade fee (immutable per launch; verified Sept
        2026). The fee recipient is pointed at the War Chest Safe. Links: launchpad, Uniswap,
        Blockscout and GeckoTerminal above.
      </p>
    </Card>
  );
}
