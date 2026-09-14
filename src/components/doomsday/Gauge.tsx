"use client";

import NumberFlow from "@number-flow/react";
import { TIERS } from "@/config/tiers";
import { WW3_BASELINE } from "@/config/ww3";
import { useProjected } from "@/hooks/useProjected";
import { useWorld } from "@/store/world";
import { Card } from "@/components/ui/Card";

const R = 80;
const CX = 100;
const CY = 96;

function polar(pct: number, r = R): [number, number] {
  const a = Math.PI + (pct / 100) * Math.PI; // 0 % → left, 100 % → right
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
}

function arcPath(from: number, to: number, r = R): string {
  const [x1, y1] = polar(from, r);
  const [x2, y2] = polar(to, r);
  const large = to - from > 50 ? 1 : 0;
  return `M${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2}`;
}

/** Semicircular gauge with tier ticks and the 19.5 % baseline marker. */
export function Gauge() {
  const { index, tier } = useProjected(2_000);
  const status = useWorld((s) => s.status);
  const [nx, ny] = polar(index, R + 2);
  return (
    <Card accent={tier.color} className="overflow-hidden">
      <div className="grid gap-4 md:grid-cols-[auto_1fr] md:items-center">
        <svg
          viewBox="0 0 200 112"
          className="mx-auto w-full max-w-[360px]"
          role="img"
          aria-label={`WW3 probability ${index.toFixed(1)} percent, ${tier.label}`}
        >
          <path
            d={arcPath(0, 100)}
            fill="none"
            stroke="rgb(255 255 255 / 0.06)"
            strokeWidth="14"
            strokeLinecap="round"
          />
          {TIERS.map((t, i) => {
            const from = i === 0 ? 0 : TIERS[i - 1]!.max;
            return (
              <path
                key={t.label}
                d={arcPath(from + 0.4, t.max - 0.4)}
                fill="none"
                stroke={t.color}
                strokeWidth="14"
                opacity={index >= from ? 0.9 : 0.22}
              />
            );
          })}
          {/* baseline tick */}
          {(() => {
            const [bx1, by1] = polar(WW3_BASELINE, R - 11);
            const [bx2, by2] = polar(WW3_BASELINE, R + 11);
            return (
              <line
                x1={bx1}
                y1={by1}
                x2={bx2}
                y2={by2}
                stroke="#E6EDF3"
                strokeWidth="1.5"
                opacity="0.8"
              />
            );
          })()}
          {/* needle */}
          <line
            x1={CX}
            y1={CY}
            x2={nx}
            y2={ny}
            stroke="#E6EDF3"
            strokeWidth="2"
            strokeLinecap="round"
            style={{ transition: "all 800ms var(--ease-out)" }}
          />
          <circle cx={CX} cy={CY} r="4" fill="#E6EDF3" />
          <text x="14" y="108" fontSize="7" fill="#6B7681" fontFamily="var(--font-mono)">
            0%
          </text>
          <text x="172" y="108" fontSize="7" fill="#6B7681" fontFamily="var(--font-mono)">
            100%
          </text>
        </svg>
        <div className="text-center md:text-left">
          <div className="mono-label text-fg-muted">WW3 Probability Index · live</div>
          <div
            className="mt-1 font-display text-5xl font-bold tabular sm:text-6xl"
            style={{
              color: tier.color,
              textShadow: `0 0 24px color-mix(in srgb, ${tier.color} 35%, transparent)`,
            }}
          >
            {status === "loading" ? (
              "…"
            ) : (
              <NumberFlow
                value={index}
                format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
                suffix="%"
              />
            )}
          </div>
          <div className="mt-2 flex items-center justify-center gap-2 md:justify-start">
            <span className="text-2xl" aria-hidden>
              {tier.icon}
            </span>
            <span className="font-display text-xl font-bold" style={{ color: tier.color }}>
              {tier.label}
            </span>
          </div>
          <p className="mt-1 text-sm text-fg-secondary">{tier.description}</p>
          <p className="mono-label mt-3 text-fg-muted">
            Baseline {WW3_BASELINE}% · decays 0.15/min toward it · cap 95%
          </p>
        </div>
      </div>
    </Card>
  );
}
