import { cn } from "@/lib/utils";

/** Animated portal ring — the site's logo. Pure SVG + CSS transform (no filters on mobile). */
export function PortalLogo({
  size = 32,
  className,
  spin = true,
}: {
  size?: number;
  className?: string;
  spin?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={cn("shrink-0", className)}
      aria-hidden
      style={{ filter: "drop-shadow(0 0 6px rgb(57 255 20 / 0.35))" }}
    >
      <defs>
        <linearGradient id="portal-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#39FF14" />
          <stop offset="1" stopColor="#00D4FF" />
        </linearGradient>
      </defs>
      <g
        className={spin ? "animate-spin-slow" : undefined}
        style={{ transformOrigin: "24px 24px", animationDuration: "9s" }}
      >
        <circle
          cx="24"
          cy="24"
          r="19"
          fill="none"
          stroke="url(#portal-g)"
          strokeWidth="3"
          strokeDasharray="70 30"
          strokeLinecap="round"
        />
        <circle
          cx="24"
          cy="24"
          r="12.5"
          fill="none"
          stroke="#39FF14"
          strokeWidth="2.2"
          strokeDasharray="30 22"
          opacity="0.8"
        />
        <circle
          cx="24"
          cy="24"
          r="6"
          fill="none"
          stroke="#00D4FF"
          strokeWidth="1.8"
          strokeDasharray="12 8"
          opacity="0.9"
        />
      </g>
      <circle cx="24" cy="24" r="2.2" fill="#E6EDF3" />
    </svg>
  );
}
