"use client";

import Link from "next/link";
import { Package } from "lucide-react";
import { SITE } from "@/config/site";
import { TOKEN } from "@/config/token";
import { useCountdown } from "@/hooks/useCountdown";
import { useProjected } from "@/hooks/useProjected";
import { useTokenData } from "@/hooks/useTokenData";
import { fmtCountdown, fmtDelta, fmtPrice, fmtUsd } from "@/lib/format";
import { useWorld } from "@/store/world";
import { simulationEnabled } from "@/lib/public-env";
import { cn } from "@/lib/utils";
import { PortalLogo } from "./PortalLogo";
import { SimulateButton } from "./SimulateButton";

function Pill({
  children,
  href,
  title,
  accent,
  className,
}: {
  children: React.ReactNode;
  href?: "/warchest" | "/doomsday" | "/token";
  title?: string;
  accent?: string;
  className?: string;
}) {
  const cls =
    "inline-flex min-h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border bg-bg-surface-1/80 px-3 font-mono text-[11px] leading-none text-fg-secondary transition-colors hover:border-border-hover";
  const style = accent
    ? { borderColor: `color-mix(in srgb, ${accent} 35%, transparent)` }
    : { borderColor: "var(--color-border-subtle)" };
  if (href) {
    return (
      <Link href={href} className={cn(cls, className)} style={style} title={title}>
        {children}
      </Link>
    );
  }
  return (
    <span className={cn(cls, className)} style={style} title={title}>
      {children}
    </span>
  );
}

export function Header() {
  const { index, tier } = useProjected();
  const status = useWorld((s) => s.status);
  const chest = useWorld((s) => s.chest);
  const countdown = useCountdown(chest?.nextDropAt ?? null);
  const token = useTokenData(Boolean(TOKEN.ca), 30_000);
  const price = token.data?.ok && token.data.indexed ? token.data.price : null;
  const delta = token.data?.ok && token.data.indexed ? token.data.change1h : null;

  return (
    <header className="glass sticky top-0 z-40 border-b border-border-subtle">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5"
          aria-label="Schmeckle Wars home"
        >
          <PortalLogo size={34} />
          <span className="min-w-0">
            <span className="block truncate font-display text-sm font-bold leading-tight tracking-tight text-fg-primary xs:text-base sm:text-lg">
              SCHMECKLE WARS
            </span>
            <span className="mono-label hidden truncate text-fg-muted sm:block">
              {SITE.subtitle}
            </span>
          </span>
        </Link>
        <div className="flex min-w-0 shrink-0 items-center gap-2 overflow-x-auto no-scrollbar sm:shrink">
          {simulationEnabled ? <SimulateButton /> : null}
          <Pill
            href="/doomsday"
            title={`WW3 Probability Index · ${tier.label}`}
            accent={tier.color}
          >
            <span aria-hidden>{tier.icon}</span>
            <span
              className="inline-block min-w-[3.4rem] text-center font-display text-sm font-bold tabular"
              style={{ color: tier.color }}
            >
              {status === "loading" ? "…" : `${index.toFixed(1)}%`}
            </span>
            <span className="hidden text-fg-muted md:inline">{tier.label}</span>
          </Pill>
          <Pill
            href="/warchest"
            title="War Chest — public treasury on Robinhood Chain"
            accent="var(--color-aid)"
          >
            <Package size={13} strokeWidth={1.75} className="text-aid" aria-hidden />
            <span className="text-fg-primary tabular">
              {chest?.configured ? (
                fmtUsd(chest.balanceUsd)
              ) : (
                <>
                  <span className="sm:hidden">Chest</span>
                  <span className="hidden sm:inline">opens at launch</span>
                </>
              )}
            </span>
            {chest?.nextDropAt && countdown !== null ? (
              <span className="hidden text-fg-muted lg:inline">
                · drop in {fmtCountdown(countdown)}
              </span>
            ) : null}
          </Pill>
          <Pill
            href="/token"
            title={price ? "Live price" : "Price feed connects once the pool is indexed"}
            className={price ? undefined : "hidden sm:inline-flex"}
          >
            {price ? (
              <>
                <span className="size-1.5 animate-pulse-live rounded-full bg-brand" aria-hidden />
                <span className="text-fg-primary tabular">{fmtPrice(price)}</span>
                {delta !== null ? (
                  <span
                    className="tabular"
                    style={{ color: delta >= 0 ? "var(--color-brand)" : "var(--color-danger)" }}
                  >
                    {fmtDelta(delta)}
                  </span>
                ) : null}
              </>
            ) : (
              <span className="text-fg-muted">{TOKEN.ca ? "price connecting…" : "price soon"}</span>
            )}
          </Pill>
        </div>
      </div>
    </header>
  );
}
