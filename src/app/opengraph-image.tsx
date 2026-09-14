import { ImageResponse } from "next/og";
import { SITE } from "@/config/site";
import { WW3_BASELINE } from "@/config/ww3";
import { project } from "@/lib/domain/world";
import { tierFor } from "@/lib/domain/ww3";
import { getKV } from "@/lib/server/kv";
import { loadCanonical } from "@/lib/server/snapshot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const alt = "Schmeckle Wars — WW3 Dashboard · War Chest on Robinhood Chain";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Phase 0: logo + tagline + current index (semi-static; Phase 1 adds "Aid sent"). */
export default async function OpenGraphImage() {
  let index = WW3_BASELINE;
  try {
    const kv = getKV();
    if (kv) index = project(await loadCanonical(kv), Date.now()).index;
  } catch {
    /* fall back to the baseline — never a made-up number */
  }
  const tier = tierFor(index);
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 64,
        background: "radial-gradient(ellipse at 18% 12%, #0a1a10 0%, #07090d 45%, #06080b 100%)",
        color: "#E6EDF3",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: 999,
            border: "8px solid #39FF14",
            borderRightColor: "#00D4FF",
            borderBottomColor: "#00D4FF",
            display: "flex",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 56, fontWeight: 700, letterSpacing: -1 }}>SCHMECKLE WARS</div>
          <div style={{ fontSize: 22, color: "#9AA4AF", letterSpacing: 2 }}>
            WW3 DASHBOARD · WAR CHEST ON ROBINHOOD CHAIN · $CHMCO
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 44, fontWeight: 700, color: "#4ADE80" }}>{SITE.motto}</div>
        <div style={{ fontSize: 26, color: "#9AA4AF", maxWidth: 1000 }}>{SITE.tagline}</div>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 20, color: "#6B7681", letterSpacing: 3 }}>
            WW3 PROBABILITY INDEX · LIVE
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
            <div
              style={{ display: "flex", fontSize: 96, fontWeight: 700, color: tier.color }}
            >{`${index.toFixed(1)}%`}</div>
            <div style={{ display: "flex", fontSize: 34, fontWeight: 700, color: tier.color }}>
              {tier.label}
            </div>
          </div>
        </div>
        <div style={{ fontSize: 20, color: "#6B7681", letterSpacing: 3 }}>
          SHARED WORLD · EVERY 14 DAYS AID GOES OUT
        </div>
      </div>
    </div>,
    { ...size },
  );
}
