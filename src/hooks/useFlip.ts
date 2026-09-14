"use client";

import { useLayoutEffect, useRef } from "react";

/**
 * Minimal FLIP: animates children of the container to their new positions when `deps`
 * change (used by the Power Ranking when nations swap places). No-op under reduced motion.
 */
export function useFlip<T extends HTMLElement>(deps: readonly unknown[]) {
  const ref = useRef<T>(null);
  const last = useRef<Map<string, DOMRect>>(new Map());
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const next = new Map<string, DOMRect>();
    for (const child of Array.from(el.children) as HTMLElement[]) {
      const key = child.dataset.flipKey;
      if (!key) continue;
      const rect = child.getBoundingClientRect();
      next.set(key, rect);
      const prev = last.current.get(key);
      if (prev && !reduce) {
        const dy = prev.top - rect.top;
        if (Math.abs(dy) > 1) {
          child.animate([{ transform: `translateY(${dy}px)` }, { transform: "translateY(0)" }], {
            duration: 420,
            easing: "cubic-bezier(.2,.8,.2,1)",
          });
        }
      }
    }
    last.current = next;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}
