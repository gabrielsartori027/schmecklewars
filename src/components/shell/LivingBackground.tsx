/** A 180 px SVG noise tile, rasterized once and repeated — far cheaper than a full-screen feTurbulence. */
const NOISE_TILE = `url("data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="180" height="180" filter="url(#n)"/></svg>',
)}")`;

/**
 * Vignette + 1 px dot grid every 24 px at 4 % + noise tile at 3 % + two conic portals rotating
 * slowly with `transform` only. Everything is off under prefers-reduced-motion (see globals.css).
 */
export function LivingBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 18% 12%, #0a1a10 0%, #07090d 38%, #06080b 62%, #030405 100%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1.2px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{ backgroundImage: NOISE_TILE, backgroundSize: "180px 180px" }}
      />
      <div
        className="animate-spin-slow absolute -left-[12vw] -top-[18vw] size-[52vw] max-h-[560px] max-w-[560px] rounded-full opacity-60"
        style={{
          background:
            "conic-gradient(from 0deg, transparent, rgb(57 255 20 / 0.06), transparent 40%, rgb(0 212 255 / 0.04), transparent)",
          animationDuration: "48s",
        }}
      />
      <div
        className="animate-spin-slow absolute -bottom-[16vw] -right-[10vw] size-[40vw] max-h-[420px] max-w-[420px] rounded-full"
        style={{
          background:
            "conic-gradient(from 90deg, transparent, rgb(191 64 255 / 0.05), transparent 50%, rgb(0 212 255 / 0.05), transparent)",
          animationDuration: "64s",
          animationDirection: "reverse",
        }}
      />
    </div>
  );
}
