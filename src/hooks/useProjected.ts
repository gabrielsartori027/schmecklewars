"use client";

import { useEffect, useState } from "react";
import { theaterReadings, type TheaterReading } from "@/lib/domain/theaters";
import type { Theater } from "@/lib/domain/types";
import { project } from "@/lib/domain/world";
import { tierFor } from "@/lib/domain/ww3";
import type { Tier } from "@/config/tiers";
import { useWorld } from "@/store/world";

export interface Projected {
  index: number;
  tier: Tier;
  theaters: Record<Theater, TheaterReading>;
  at: number;
}

/** Canonical state projected to "now", re-evaluated every `tickMs` while the tab is visible. */
export function useProjected(tickMs = 5_000): Projected {
  const canonical = useWorld((s) => s.canonical);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    let id: number | null = null;
    const start = () => {
      if (id === null) id = window.setInterval(() => setNow(Date.now()), tickMs);
    };
    const stop = () => {
      if (id !== null) window.clearInterval(id);
      id = null;
    };
    const onVis = () => (document.visibilityState === "visible" ? start() : stop());
    onVis();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [tickMs]);
  const p = project(canonical, now);
  return { index: p.index, tier: tierFor(p.index), theaters: theaterReadings(p.heat), at: now };
}
