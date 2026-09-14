"use client";

import { NATIONS } from "@/config/nations";
import type { ActiveAttack } from "@/store/world";
import { EmblemGlyph } from "@/components/nation/NationEmblem";

interface Pt {
  x: number;
  y: number;
  r: number;
}

/** Numeric length of a quadratic Bézier (32 samples) — enough for a dash-offset reveal. */
function quadLength(a: Pt, c: [number, number], b: Pt): number {
  let len = 0;
  let px = a.x;
  let py = a.y;
  for (let i = 1; i <= 32; i++) {
    const t = i / 32;
    const x = (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * c[0] + t * t * b.x;
    const y = (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * c[1] + t * t * b.y;
    len += Math.hypot(x - px, y - py);
    px = x;
    py = y;
  }
  return len;
}

/**
 * Phase 0 choreography (simplified, SMIL — restarts on remount thanks to `key`):
 * 0.0 s portal opens at the attacker → 0.3–3.8 s the emblem travels the arc while the trail
 * reveals → 3.8 s impact (two rings + "💥 BOOM!") → 4.2 s exit portal → theater pulse (map).
 * Total window 6 s (WarEngine). Reduced motion: static highlight + one impact ring.
 */
export function AttackOverlay({
  attack,
  from,
  to,
  k,
  reduce,
}: {
  attack: ActiveAttack;
  from: Pt;
  to: Pt;
  k: number;
  reduce: boolean;
}) {
  const a = NATIONS[attack.effect.a];
  const dist = Math.hypot(to.x - from.x, to.y - from.y);
  const mx = (from.x + to.x) / 2;
  const my = Math.min(from.y, to.y) - Math.max(24, dist * 0.28);
  const d = `M${from.x},${from.y} Q${mx},${my} ${to.x},${to.y}`;
  const len = quadLength(from, [mx, my], to);
  const s = k; // scale for a legible traveler on phones

  if (reduce) {
    return (
      <g aria-hidden>
        <path
          d={d}
          fill="none"
          stroke={a.color}
          strokeWidth={1.5}
          strokeDasharray="4 4"
          opacity={0.6}
        />
        <circle
          cx={to.x}
          cy={to.y}
          r={to.r * s + 10 * s}
          fill="rgb(255 7 58 / 0.25)"
          stroke="#FF073A"
          strokeWidth={1.5}
        />
        <text
          x={to.x}
          y={to.y - to.r * s - 16 * s}
          textAnchor="middle"
          fill="#FF073A"
          fontSize={10 * s}
          fontFamily="var(--font-display)"
          fontWeight={700}
        >
          💥 HIT
        </text>
      </g>
    );
  }

  return (
    <g aria-hidden>
      {/* Source portal */}
      <circle
        cx={from.x}
        cy={from.y}
        r={0}
        fill="none"
        stroke="#39FF14"
        strokeWidth={2.2}
        filter="url(#glow)"
      >
        <animate attributeName="r" values={`0;${16 * s};${11 * s}`} dur="0.7s" fill="freeze" />
        <animate attributeName="opacity" values="0;0.95;0.55" dur="0.7s" fill="freeze" />
        <animate attributeName="opacity" values="0.55;0" begin="2.4s" dur="0.6s" fill="freeze" />
      </circle>
      <circle
        cx={from.x}
        cy={from.y}
        r={0}
        fill="none"
        stroke="#00D4FF"
        strokeWidth={1.2}
        strokeDasharray="6 5"
      >
        <animate attributeName="r" values={`0;${22 * s};${15 * s}`} dur="0.8s" fill="freeze" />
        <animate attributeName="opacity" values="0;0.8;0" dur="2.2s" fill="freeze" />
        <animateTransform
          attributeName="transform"
          type="rotate"
          from={`0 ${from.x} ${from.y}`}
          to={`360 ${from.x} ${from.y}`}
          dur="2s"
          fill="freeze"
        />
      </circle>

      {/* Trail (stroke-dashoffset reveal) */}
      <path
        d={d}
        fill="none"
        stroke={a.color}
        strokeWidth={1.8 * s}
        strokeDasharray={len}
        strokeDashoffset={len}
        filter="url(#glow)"
        opacity={0.5}
      >
        <animate
          attributeName="stroke-dashoffset"
          from={len}
          to={0}
          dur="2.5s"
          begin="0.4s"
          fill="freeze"
        />
        <animate
          attributeName="opacity"
          values="0;0;0.55;0.45;0.15;0.05"
          dur="5.5s"
          fill="freeze"
        />
      </path>

      {/* Traveling emblem */}
      <g opacity={0}>
        <animateMotion dur="3.5s" begin="0.3s" fill="freeze" path={d} />
        <animate
          attributeName="opacity"
          values="0;1;1;1;1;0"
          dur="4.5s"
          begin="0.2s"
          fill="freeze"
        />
        <circle
          r={12 * s}
          fill={`color-mix(in srgb, ${a.color} 18%, transparent)`}
          stroke={a.color}
          strokeWidth={1.2}
        >
          <animate
            attributeName="r"
            values={`${11 * s};${14 * s};${11 * s}`}
            dur="0.6s"
            repeatCount="6"
          />
        </circle>
        <svg
          x={-7 * s}
          y={-7 * s}
          width={14 * s}
          height={14 * s}
          viewBox="0 0 24 24"
          color={a.color}
        >
          <EmblemGlyph kind={a.emblem} width={24} height={24} />
        </svg>
      </g>

      {/* Impact */}
      <circle cx={to.x} cy={to.y} r={0} fill="#FF073A" filter="url(#glow)" opacity={0}>
        <animate
          attributeName="r"
          values={`0;${8 * s};${30 * s}`}
          dur="0.7s"
          begin="3.8s"
          fill="freeze"
        />
        <animate attributeName="opacity" values="1;0.9;0" dur="0.7s" begin="3.8s" fill="freeze" />
      </circle>
      <circle cx={to.x} cy={to.y} r={0} fill="#FFD700" opacity={0}>
        <animate
          attributeName="r"
          values={`0;${5 * s};${18 * s}`}
          dur="0.55s"
          begin="3.85s"
          fill="freeze"
        />
        <animate
          attributeName="opacity"
          values="1;0.95;0"
          dur="0.55s"
          begin="3.85s"
          fill="freeze"
        />
      </circle>
      <text
        x={to.x}
        y={to.y - 18 * s}
        textAnchor="middle"
        fill="#FF073A"
        fontSize={10 * s}
        fontFamily="var(--font-display)"
        fontWeight={700}
        letterSpacing="0.06em"
        opacity={0}
      >
        💥 BOOM!
        <animate attributeName="opacity" values="0;1;1;0" dur="1.8s" begin="3.85s" fill="freeze" />
        <animate
          attributeName="y"
          from={to.y - 18 * s}
          to={to.y - 44 * s}
          dur="1.8s"
          begin="3.85s"
          fill="freeze"
        />
      </text>

      {/* Exit portal */}
      <circle cx={to.x} cy={to.y} r={0} fill="none" stroke="#39FF14" strokeWidth={1.6} opacity={0}>
        <animate
          attributeName="r"
          values={`0;${14 * s};${8 * s}`}
          dur="0.9s"
          begin="4.2s"
          fill="freeze"
        />
        <animate attributeName="opacity" values="0;0.8;0" dur="1.2s" begin="4.2s" fill="freeze" />
      </circle>
    </g>
  );
}
