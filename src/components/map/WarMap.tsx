"use client";

import { geoEqualEarth, geoPath, type GeoPermissibleObjects, type GeoProjection } from "d3-geo";
import { useEffect, useMemo, useRef, useState } from "react";
import { feature } from "topojson-client";
import type { FeatureCollection, Geometry, Polygon } from "geojson";
import type { Topology, GeometryCollection } from "topojson-specification";
import { NATIONS, NATION_LIST } from "@/config/nations";
import { THEATER_LIST } from "@/config/theaters";
import { usePrefersReducedMotion } from "@/hooks/useMotionPrefs";
import { useProjected } from "@/hooks/useProjected";
import type { NationCode, Theater } from "@/lib/domain/types";
import { useWorld } from "@/store/world";
import { EmblemGlyph } from "@/components/nation/NationEmblem";
import { evolutionFor } from "@/lib/domain/evolution";
import { AttackOverlay } from "./AttackOverlay";
import { MapTooltip } from "./MapTooltip";

export const MAP_W = 960;
export const MAP_H = 470;
/** Narrow screens: crop to the action (lon −130…150, lat −42…74) on a taller canvas. */
export const MAP_H_COMPACT = 600;
const FOCUS: Polygon = {
  type: "Polygon",
  coordinates: [
    [
      [-130, -42],
      [-130, 74],
      [150, 74],
      [150, -42],
      [-130, -42],
    ],
  ],
};

const ISO_TO_CODE = new Map<number, NationCode>(NATION_LIST.map((n) => [n.iso, n.code]));
const MARKER_R: Record<NationCode, number> = {
  USA: 14,
  RUSSIA: 14,
  CHINA: 14,
  FRANCE: 11,
  IRAN: 11,
  UKRAINE: 11,
  ISRAEL: 9,
  NKOREA: 9,
};

/** Clockwise ring (d3-geo treats the *inside* of a clockwise ring as the polygon). */
function boxPolygon([lonMin, latMin, lonMax, latMax]: [number, number, number, number]): Polygon {
  return {
    type: "Polygon",
    coordinates: [
      [
        [lonMin, latMin],
        [lonMin, latMax],
        [lonMax, latMax],
        [lonMax, latMin],
        [lonMin, latMin],
      ],
    ],
  };
}

interface CountryFeature {
  id: string;
  d: string;
  code: NationCode | null;
}

export function WarMap() {
  const [countries, setCountries] = useState<CountryFeature[] | null>(null);
  // Client-only component (ssr:false): measure synchronously so the first paint already has the
  // right aspect ratio (no layout shift when the ResizeObserver fires).
  const [width, setWidth] = useState(() =>
    typeof window === "undefined" ? MAP_W : Math.min(MAP_W, Math.max(240, window.innerWidth - 56)),
  );
  const wrapRef = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();

  const compact = width < 640;
  const H = compact ? MAP_H_COMPACT : MAP_H;
  const projection = useMemo<GeoProjection>(
    () =>
      compact
        ? geoEqualEarth()
            .rotate([-12, 0])
            .fitExtent(
              [
                [4, 4],
                [MAP_W - 4, MAP_H_COMPACT - 4],
              ],
              FOCUS,
            )
        : geoEqualEarth()
            .rotate([-12, 0])
            .fitExtent(
              [
                [6, 6],
                [MAP_W - 6, MAP_H - 6],
              ],
              { type: "Sphere" },
            ),
    [compact],
  );
  const pathOf = useMemo(() => geoPath(projection), [projection]);

  useEffect(() => {
    let alive = true;
    void import("world-atlas/countries-110m.json").then((mod) => {
      if (!alive) return;
      const topo = (mod.default ?? mod) as unknown as Topology<{ countries: GeometryCollection }>;
      const fc = feature(topo, topo.objects.countries) as FeatureCollection<Geometry>;
      const list: CountryFeature[] = [];
      for (const f of fc.features) {
        const idNum = Number(f.id);
        if (idNum === 10) continue; // Antarctica
        const d = pathOf(f as GeoPermissibleObjects);
        if (!d) continue;
        list.push({ id: String(f.id), d, code: ISO_TO_CODE.get(idNum) ?? null });
      }
      setCountries(list);
    });
    return () => {
      alive = false;
    };
  }, [pathOf]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /** Markers/labels scale up on narrow screens so a 360 px phone still reads them. */
  const k = Math.min(2.2, Math.max(1, MAP_W / Math.max(240, width)));

  const nations = useWorld((s) => s.canonical.nations);
  const current = useWorld((s) => s.current);
  const hovered = useWorld((s) => s.hovered);
  const hover = useWorld((s) => s.hover);
  const select = useWorld((s) => s.select);
  const { theaters } = useProjected();

  const markers = useMemo(
    () =>
      NATION_LIST.map((n) => {
        const p = projection(n.marker) ?? [0, 0];
        return { code: n.code, x: p[0], y: p[1], r: MARKER_R[n.code] };
      }),
    [projection],
  );
  const pointOf = (code: NationCode) => markers.find((m) => m.code === code)!;

  const theaterShapes = useMemo(
    () =>
      THEATER_LIST.filter((t) => t.bounds && t.anchor).map((t) => ({
        code: t.code,
        color: t.color,
        label: t.label,
        d: pathOf(boxPolygon(t.bounds!)) ?? "",
        anchor: projection(t.anchor!) ?? [0, 0],
      })),
    [pathOf, projection],
  );

  const attacker = current?.effect.a ?? null;
  const target = current?.effect.t ?? null;
  const pulseTheater: Theater | null = current?.entry.th ?? null;

  return (
    <div ref={wrapRef} className="relative">
      <svg
        viewBox={`0 0 ${MAP_W} ${H}`}
        className="block h-auto w-full rounded-[var(--radius-md)] border border-border-subtle"
        style={{
          background: "radial-gradient(ellipse at 40% 40%, #0c1610 0%, #080d0a 45%, #06080b 100%)",
        }}
        role="img"
        aria-label="War map — Equal Earth projection with the eight nations and four conflict theaters"
      >
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Countries */}
        <g>
          {countries === null ? (
            <text
              x={MAP_W / 2}
              y={H / 2}
              textAnchor="middle"
              fill="#6B7681"
              fontSize={14}
              fontFamily="var(--font-mono)"
            >
              LOADING MAP…
            </text>
          ) : (
            countries.map((c) => {
              const n = c.code ? NATIONS[c.code] : null;
              const isA = c.code !== null && c.code === attacker;
              const isT = c.code !== null && c.code === target;
              const isH = c.code !== null && c.code === hovered;
              return (
                <path
                  key={c.id}
                  d={c.d}
                  fill={
                    n
                      ? isA
                        ? `color-mix(in srgb, ${n.color} 32%, transparent)`
                        : isT
                          ? "rgb(255 7 58 / 0.22)"
                          : isH
                            ? `color-mix(in srgb, ${n.color} 22%, transparent)`
                            : `color-mix(in srgb, ${n.color} 12%, transparent)`
                      : "var(--color-bg-surface-2)"
                  }
                  stroke={
                    n
                      ? isA || isH
                        ? n.color
                        : isT
                          ? "var(--color-danger)"
                          : `color-mix(in srgb, ${n.color} 55%, transparent)`
                      : "rgb(255 255 255 / 0.06)"
                  }
                  strokeWidth={n ? (isH || isA ? 1.4 : 0.9) : 0.5}
                  strokeLinejoin="round"
                  className={isT && !reduce ? "animate-glitch" : undefined}
                  style={{
                    transition: "fill 300ms, stroke 300ms",
                    cursor: n ? "pointer" : "default",
                  }}
                  onMouseEnter={() => c.code && hover(c.code)}
                  onMouseLeave={() => c.code && hover(null)}
                  onClick={() => c.code && select(c.code)}
                />
              );
            })
          )}
        </g>

        {/* Theater layer: opacity ∝ share (0–18 %) */}
        <g aria-hidden>
          {theaterShapes.map((t) => {
            const reading = theaters[t.code];
            const opacity = 0.03 + reading.share * 0.15;
            const pulsing = pulseTheater === t.code && current && !reduce;
            return (
              <g key={t.code}>
                <path
                  key={pulsing ? current.key : "static"}
                  d={t.d}
                  fill={t.color}
                  fillOpacity={opacity}
                  stroke={t.color}
                  strokeOpacity={0.35}
                  strokeWidth={0.8}
                  strokeDasharray="4 4"
                  className={pulsing ? "theater-pulse" : undefined}
                  style={pulsing ? { animationDelay: "3.8s" } : undefined}
                  pointerEvents="none"
                />
                <text
                  x={t.anchor[0] + 2}
                  y={t.anchor[1] + 9 * k}
                  fill={t.color}
                  fontSize={8 * k}
                  fontFamily="var(--font-mono)"
                  letterSpacing="0.08em"
                  opacity={0.9}
                  pointerEvents="none"
                >
                  {compact
                    ? `${t.label.toUpperCase()} ${Math.round(reading.share * 100)}%`
                    : `${t.label.toUpperCase()} · ${Math.round(reading.share * 100)}% HEAT`}
                </text>
              </g>
            );
          })}
        </g>

        {/* Choreography */}
        {current ? (
          <AttackOverlay
            key={current.key}
            attack={current}
            from={pointOf(current.effect.a)}
            to={pointOf(current.effect.t)}
            k={k}
            reduce={Boolean(reduce)}
          />
        ) : null}

        {/* Markers */}
        <g>
          {markers.map((m) => {
            const n = NATIONS[m.code];
            const s = nations[m.code];
            const evo = evolutionFor(s.xp);
            const r = m.r * k;
            const isA = m.code === attacker;
            const isT = m.code === target;
            const isH = m.code === hovered;
            const stroke = isA
              ? n.color
              : isT
                ? "var(--color-danger)"
                : `color-mix(in srgb, ${n.color} 70%, transparent)`;
            return (
              <g
                key={m.code}
                transform={`translate(${m.x} ${m.y})`}
                style={{ cursor: "pointer" }}
                onMouseEnter={() => hover(m.code)}
                onMouseLeave={() => hover(null)}
                onClick={() => select(m.code)}
                role="button"
                tabIndex={0}
                aria-label={`${n.name} — ${n.persona}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    select(m.code);
                  }
                }}
                className={isT && !reduce ? "animate-glitch" : undefined}
              >
                {/* rank ring */}
                <circle
                  r={r + 4 * k}
                  fill="none"
                  stroke={evo.color}
                  strokeWidth={isA ? 1.6 : 1}
                  strokeDasharray={isA ? undefined : "3 3"}
                  opacity={isA ? 0.9 : isH ? 0.6 : 0.3}
                >
                  {isA && !reduce ? (
                    <animate
                      attributeName="r"
                      values={`${r + 4 * k};${r + 11 * k};${r + 4 * k}`}
                      dur="1s"
                      repeatCount="indefinite"
                    />
                  ) : null}
                </circle>
                <circle
                  r={r}
                  fill={`color-mix(in srgb, ${n.color} 14%, var(--color-bg-surface-2))`}
                  stroke={stroke}
                  strokeWidth={isH ? 2.2 : 1.6}
                  style={{ filter: isA || isT ? "url(#glow)" : undefined }}
                />
                <svg
                  x={-r * 0.58}
                  y={-r * 0.58}
                  width={r * 1.16}
                  height={r * 1.16}
                  viewBox="0 0 24 24"
                  color={n.color}
                >
                  <EmblemGlyph kind={n.emblem} width={24} height={24} />
                </svg>
                <text x={r * 0.75} y={-r * 0.75} fontSize={7 * k} textAnchor="middle" aria-hidden>
                  {evo.badge}
                </text>
                <text
                  y={r + 10 * k}
                  textAnchor="middle"
                  fill={n.color}
                  fontSize={7.5 * k}
                  fontFamily="var(--font-display)"
                  fontWeight={700}
                  letterSpacing="0.04em"
                >
                  {n.flag} {n.name.toUpperCase()}
                </text>
                {!compact ? (
                  <text
                    y={r + 18.5 * k}
                    textAnchor="middle"
                    fill={n.color}
                    fontSize={6 * k}
                    fontFamily="var(--font-mono)"
                    opacity={0.75}
                  >
                    {n.persona}
                  </text>
                ) : null}
                {isA || isT ? (
                  <g transform={`translate(0 ${-r - 12 * k})`}>
                    <rect
                      x={-17 * k}
                      y={-6 * k}
                      width={34 * k}
                      height={11 * k}
                      rx={5.5 * k}
                      fill={isA ? "rgb(57 255 20 / 0.2)" : "rgb(255 7 58 / 0.2)"}
                      stroke={isA ? "#39FF14" : "#FF073A"}
                      strokeWidth={0.8}
                    />
                    <text
                      y={2.2 * k}
                      textAnchor="middle"
                      fill={isA ? "#39FF14" : "#FF073A"}
                      fontSize={6 * k}
                      fontFamily="var(--font-display)"
                      fontWeight={700}
                    >
                      {isA ? "⚡ ATK" : "💥 HIT"}
                    </text>
                  </g>
                ) : null}
              </g>
            );
          })}
        </g>
      </svg>
      {hovered ? <MapTooltip code={hovered} /> : null}
    </div>
  );
}

export default WarMap;
