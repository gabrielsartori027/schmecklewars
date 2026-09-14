"use client";

import { useEffect, useState } from "react";

/** Milliseconds until `target`, ticking every `tickMs`. Null when there is no target. */
export function useCountdown(target: number | null | undefined, tickMs = 30_000): number | null {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!target) return;
    const id = window.setInterval(() => setNow(Date.now()), tickMs);
    return () => window.clearInterval(id);
  }, [target, tickMs]);
  return target ? target - now : null;
}
