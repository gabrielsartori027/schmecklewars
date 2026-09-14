"use client";

import { useEffect, useState } from "react";

/** `prefers-reduced-motion: reduce` as state (SSR-safe: false until mounted). */
export function usePrefersReducedMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduce(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduce;
}

/**
 * Keeps `value` around for `ms` after it turns null so an exit animation can play
 * (a tiny AnimatePresence). Returns [renderedValue, isExiting].
 */
export function useDelayedUnmount<T>(value: T | null, ms = 220): [T | null, boolean] {
  const [stale, setStale] = useState<T | null>(null);
  useEffect(() => {
    if (value !== null) {
      const raf = window.requestAnimationFrame(() => setStale(value));
      return () => window.cancelAnimationFrame(raf);
    }
    const id = window.setTimeout(() => setStale(null), ms);
    return () => window.clearTimeout(id);
  }, [value, ms]);
  const shown = value ?? stale;
  const exiting = value === null && stale !== null;
  return [shown, exiting];
}
