"use client";

import Link from "next/link";
import { THEATER_LIST } from "@/config/theaters";
import { useProjected } from "@/hooks/useProjected";
import { Card, SectionTitle } from "@/components/ui/Card";

const TIER_COLOR = {
  COLD: "var(--color-fg-muted)",
  WARM: "var(--color-warning)",
  HOT: "var(--color-orange)",
  CRITICAL: "var(--color-danger)",
} as const;

/** Five bars: share %, hn, tier — "This is what decides the next Aid Drop". */
export function TheaterHeat() {
  const { theaters } = useProjected();
  return (
    <Card>
      <SectionTitle
        as="h2"
        sub={
          <Link
            href="/warchest"
            className="text-aid underline decoration-aid/40 underline-offset-2 hover:decoration-aid"
          >
            This is what decides the next Aid Drop →
          </Link>
        }
      >
        Theater Heat
      </SectionTitle>
      <ul className="space-y-3">
        {THEATER_LIST.map((t) => {
          const r = theaters[t.code];
          return (
            <li key={t.code}>
              <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                <span
                  className="flex items-center gap-2 font-display font-semibold"
                  style={{ color: t.color }}
                >
                  <span
                    className="size-2 rounded-full"
                    style={{ background: t.color }}
                    aria-hidden
                  />
                  <span className="truncate">{t.label}</span>
                  <span
                    className="shrink-0 font-mono text-[11px] font-semibold"
                    style={{ color: TIER_COLOR[r.tier] }}
                  >
                    {r.tier}
                  </span>
                </span>
                <span className="shrink-0 font-mono tabular">
                  <span className="text-fg-primary">{Math.round(r.share * 100)}% share</span>
                  <span className="text-fg-muted"> · hn {Math.round(r.hn)}</span>
                </span>
              </div>
              <div
                className="h-2 overflow-hidden rounded-full bg-white/6"
                role="meter"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(r.share * 100)}
                aria-label={`${t.label} share`}
              >
                <div
                  className="h-full rounded-full transition-[width] duration-700 ease-(--ease-out)"
                  style={{
                    width: `${Math.max(r.share * 100, r.heat > 0 ? 1.5 : 0)}%`,
                    background: `linear-gradient(90deg, ${t.color}88, ${t.color})`,
                  }}
                />
              </div>
              <div className="mono-label mt-1 text-fg-muted">{t.coverage}</div>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-fg-muted">
        Heat: each event adds severity × type weight to its theater; heat decays 4 % per hour
        (half-life ≈ 17 h). Share = theater heat / total heat. hn = heat / 25 × 100; hn ≥ 70 is
        CRITICAL.
      </p>
    </Card>
  );
}
