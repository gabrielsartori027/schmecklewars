"use client";

import { useEffect } from "react";
import { LEVEL_UP_DURATION_MS } from "@/config/evolution";
import { NATIONS } from "@/config/nations";
import { useDelayedUnmount } from "@/hooks/useMotionPrefs";
import { cn } from "@/lib/utils";
import { useWorld } from "@/store/world";
import { NationEmblem } from "@/components/nation/NationEmblem";

export function LevelUpOverlay() {
  const levelUp = useWorld((s) => s.levelUp);
  const dismiss = useWorld((s) => s.showLevelUp);
  const nations = useWorld((s) => s.canonical.nations);
  const [shown, exiting] = useDelayedUnmount(levelUp, 250);
  useEffect(() => {
    if (!levelUp) return;
    const id = window.setTimeout(() => dismiss(null), LEVEL_UP_DURATION_MS);
    return () => window.clearTimeout(id);
  }, [levelUp, dismiss]);
  const n = shown ? NATIONS[shown.code] : null;
  if (!shown || !n) return null;
  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4",
        exiting ? "animate-toast-out" : "animate-fade-in",
      )}
      role="status"
      aria-live="assertive"
    >
      <div
        key={`${shown.code}-${shown.level.min}`}
        className="card animate-pop-in px-8 py-6 text-center"
        style={{
          borderColor: `color-mix(in srgb, ${n.color} 45%, transparent)`,
          boxShadow: `0 0 60px color-mix(in srgb, ${n.color} 25%, transparent)`,
        }}
      >
        <NationEmblem code={shown.code} size={72} xp={nations[shown.code].xp} className="mx-auto" />
        <div className="mt-3 font-display text-xl font-bold" style={{ color: n.color }}>
          {n.persona}
        </div>
        <div
          className="mt-1 font-display text-base font-semibold"
          style={{ color: shown.level.color }}
        >
          EVOLVED TO: {shown.level.title}! {shown.level.badge}
        </div>
        <div className="mono-label mt-2 text-fg-muted">{n.persona} — Power increased</div>
      </div>
    </div>
  );
}
