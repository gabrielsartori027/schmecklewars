"use client";

import { NATIONS } from "@/config/nations";
import { useDelayedUnmount } from "@/hooks/useMotionPrefs";
import { cn } from "@/lib/utils";
import { useWorld } from "@/store/world";
import { NationEmblem } from "@/components/nation/NationEmblem";

/** Toast per attack: Rick line + attacker ⚔️ target (mirrors the original's bottom toast). */
export function RickToast() {
  const current = useWorld((s) => s.current);
  const [shown, exiting] = useDelayedUnmount(current);
  const a = shown ? NATIONS[shown.effect.a] : null;
  const t = shown ? NATIONS[shown.effect.t] : null;
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4"
      aria-live="polite"
      aria-atomic
    >
      {shown && a && t ? (
        <div
          key={shown.key}
          className={cn(
            "card glow-brand flex max-w-[92vw] items-center gap-3 px-4 py-3",
            exiting ? "animate-toast-out" : "animate-toast-in",
          )}
        >
          <NationEmblem code={shown.effect.a} size={36} xp={0} showRank={false} />
          <div className="min-w-0">
            <div className="font-display text-sm font-bold text-brand sm:text-base">
              {shown.rickLine}
            </div>
            <div className="truncate font-mono text-[11px] text-fg-secondary">
              <span style={{ color: a.color }}>{a.persona}</span> ⚔️{" "}
              <span style={{ color: t.color }}>{t.persona}</span>
              {shown.entry.simulated ? <span className="ml-2 text-warning">SIMULATION</span> : null}
            </div>
          </div>
          <NationEmblem code={shown.effect.t} size={30} xp={0} showRank={false} active="target" />
        </div>
      ) : null}
    </div>
  );
}
