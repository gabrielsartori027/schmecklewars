import type { SVGProps } from "react";
import { NATIONS, type EmblemKind } from "@/config/nations";
import { evolutionFor } from "@/lib/domain/evolution";
import type { NationCode } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

/**
 * Original emblem glyphs (24×24, stroke-based). No characters from any show — one abstract
 * symbol per nation: flask, crosshair, skull, feather, eye, hive, robot, sunflower.
 */
export function EmblemGlyph({ kind, ...rest }: { kind: EmblemKind } & SVGProps<SVGSVGElement>) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...rest,
  };
  switch (kind) {
    case "flask":
      return (
        <svg {...common}>
          <path d="M9.5 3h5M10 3v5.2L5.4 16.4A2.5 2.5 0 0 0 7.6 20h8.8a2.5 2.5 0 0 0 2.2-3.6L14 8.2V3" />
          <path d="M7.4 14.5h9.2" />
          <circle cx="10.5" cy="17" r="0.6" fill="currentColor" />
          <circle cx="13.6" cy="16" r="0.5" fill="currentColor" />
        </svg>
      );
    case "crosshair":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="7" />
          <path d="M12 2.5v4M12 17.5v4M2.5 12h4M17.5 12h4" />
          <circle cx="12" cy="12" r="1.2" fill="currentColor" />
        </svg>
      );
    case "skull":
      return (
        <svg {...common}>
          <path d="M12 3a7 7 0 0 0-7 7c0 2.4 1.1 4.2 2.8 5.4V19a1.5 1.5 0 0 0 1.5 1.5h5.4A1.5 1.5 0 0 0 16.2 19v-3.6C17.9 14.2 19 12.4 19 10a7 7 0 0 0-7-7Z" />
          <circle cx="9.3" cy="10.5" r="1.6" fill="currentColor" />
          <circle cx="14.7" cy="10.5" r="1.6" fill="currentColor" />
          <path d="M10.5 17.2v3M13.5 17.2v3M11.2 14.3l.8 1.2.8-1.2" />
        </svg>
      );
    case "feather":
      return (
        <svg {...common}>
          <path d="M20 4c-6 0-11.5 3-14 9.5 2.5-.8 6.7-2.2 9.5-4.6M20 4c0 6-3 11.5-9.5 14L4 20" />
          <path d="M20 4c-4 2-8 6-11.5 12" />
        </svg>
      );
    case "eye":
      return (
        <svg {...common}>
          <path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z" />
          <circle cx="12" cy="12" r="3.2" />
          <circle cx="12" cy="12" r="1.2" fill="currentColor" />
        </svg>
      );
    case "hive":
      return (
        <svg {...common}>
          <path d="M9 4.5h6l3 5.2-3 5.2H9L6 9.7 9 4.5Z" />
          <path d="M6 9.7 3 15l3 5.2h6l3-5.2M15 14.9l3 5.3" />
        </svg>
      );
    case "robot":
      return (
        <svg {...common}>
          <rect x="5" y="8" width="14" height="11" rx="2.5" />
          <path d="M12 8V5M12 5a1.3 1.3 0 1 0 0-2.6A1.3 1.3 0 0 0 12 5ZM2.5 12.5v3M21.5 12.5v3" />
          <circle cx="9" cy="12.5" r="1.3" fill="currentColor" />
          <circle cx="15" cy="12.5" r="1.3" fill="currentColor" />
          <path d="M9 16h6" />
        </svg>
      );
    case "sunflower":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3.2" />
          <path d="M12 2.5v3.3M12 18.2v3.3M2.5 12h3.3M18.2 12h3.3M5.3 5.3l2.3 2.3M16.4 16.4l2.3 2.3M18.7 5.3l-2.3 2.3M7.6 16.4l-2.3 2.3" />
        </svg>
      );
  }
}

interface NationEmblemProps {
  code: NationCode;
  size?: number; // 16–96 px
  xp?: number;
  showRank?: boolean;
  className?: string;
  active?: "attacker" | "target" | null;
}

/** Circle + nation-colored glyph + rank ring (evolution color). */
export function NationEmblem({
  code,
  size = 40,
  xp = 0,
  showRank = true,
  className,
  active = null,
}: NationEmblemProps) {
  const n = NATIONS[code];
  const evo = evolutionFor(xp);
  const ringColor =
    active === "target" ? "var(--color-danger)" : active === "attacker" ? n.color : evo.color;
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-full",
        className,
      )}
      style={{
        width: size,
        height: size,
        color: n.color,
        background: `radial-gradient(circle at 35% 35%, color-mix(in srgb, ${n.color} 22%, transparent), color-mix(in srgb, ${n.color} 6%, var(--color-bg-surface-2)))`,
        boxShadow: showRank
          ? `0 0 0 ${Math.max(1, size / 24)}px ${ringColor}, 0 0 ${size / 3}px color-mix(in srgb, ${n.color} 30%, transparent)`
          : `0 0 ${size / 4}px color-mix(in srgb, ${n.color} 25%, transparent)`,
      }}
      title={`${n.name} · ${n.persona}`}
    >
      <EmblemGlyph kind={n.emblem} width={size * 0.58} height={size * 0.58} />
      {showRank && size >= 32 ? (
        <span
          className="absolute -right-1 -top-1 flex items-center justify-center rounded-full bg-bg-base text-[10px] leading-none"
          style={{ width: size * 0.38, height: size * 0.38, fontSize: Math.max(9, size * 0.22) }}
          aria-label={evo.title}
        >
          {evo.badge}
        </span>
      ) : null}
    </span>
  );
}
