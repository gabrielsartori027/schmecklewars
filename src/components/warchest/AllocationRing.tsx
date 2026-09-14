"use client";

import { THEATER_META } from "@/config/theaters";
import { THEATERS, type Theater } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

interface Props {
  /** live theater shares (0–1) */
  share: Record<Theater, number>;
  /** projected split (eligible theaters only, floor applied) — drawn as the outer ring when present */
  split?: Record<Theater, number> | null;
  size?: number;
  className?: string;
  center?: React.ReactNode;
}

function arcs(values: Record<Theater, number>, r: number, stroke: number) {
  const C = 2 * Math.PI * r;
  const total = THEATERS.reduce((s, th) => s + Math.max(0, values[th]), 0);
  let offset = 0;
  return THEATERS.map((th) => {
    const frac = total > 0 ? Math.max(0, values[th]) / total : 0;
    const seg = {
      th,
      color: THEATER_META[th].color,
      dash: `${frac * C} ${C}`,
      offset: -offset * C,
      r,
      stroke,
      frac,
    };
    offset += frac;
    return seg;
  });
}

/** Two rings: inner = live heat share, outer = projected payout split (when any theater is eligible). */
export function AllocationRing({ share, split, size = 180, className, center }: Props) {
  const inner = arcs(share, 34, 12);
  const outer = split ? arcs(split, 46, 6) : null;
  const cold = THEATERS.every((th) => share[th] <= 0);
  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 110 110"
        width={size}
        height={size}
        role="img"
        aria-label="Theater heat share and projected aid split"
      >
        <circle
          cx="55"
          cy="55"
          r="34"
          fill="none"
          stroke="rgb(255 255 255 / 0.06)"
          strokeWidth="12"
        />
        <circle
          cx="55"
          cy="55"
          r="46"
          fill="none"
          stroke="rgb(255 255 255 / 0.04)"
          strokeWidth="6"
        />
        <g transform="rotate(-90 55 55)">
          {!cold
            ? inner.map((s) => (
                <circle
                  key={s.th}
                  cx="55"
                  cy="55"
                  r={s.r}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={s.stroke}
                  strokeDasharray={s.dash}
                  strokeDashoffset={s.offset}
                  style={{
                    transition:
                      "stroke-dasharray 600ms var(--ease-out), stroke-dashoffset 600ms var(--ease-out)",
                  }}
                />
              ))
            : null}
          {outer
            ? outer.map((s) => (
                <circle
                  key={`o-${s.th}`}
                  cx="55"
                  cy="55"
                  r={s.r}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={s.stroke}
                  strokeDasharray={s.dash}
                  strokeDashoffset={s.offset}
                  opacity={0.9}
                />
              ))
            : null}
        </g>
      </svg>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-center">
        {center}
      </div>
    </div>
  );
}

export function TheaterLegend({
  share,
  split,
  compact = false,
}: {
  share: Record<Theater, number>;
  split?: Record<Theater, number> | null;
  compact?: boolean;
}) {
  return (
    <ul
      className={cn(
        "grid gap-x-4 gap-y-1",
        compact ? "grid-cols-1 text-[11px]" : "grid-cols-1 text-xs sm:grid-cols-2",
      )}
    >
      {THEATERS.map((th) => (
        <li key={th} className="flex items-center gap-2 font-mono">
          <span
            className="size-2 shrink-0 rounded-full"
            style={{ background: THEATER_META[th].color }}
            aria-hidden
          />
          <span className="min-w-0 flex-1 truncate text-fg-secondary">
            {THEATER_META[th].label}
          </span>
          <span className="tabular text-fg-primary">{Math.round(share[th] * 100)}%</span>
          {split ? (
            <span className="tabular text-fg-muted">→ {Math.round(split[th] * 100)}%</span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
