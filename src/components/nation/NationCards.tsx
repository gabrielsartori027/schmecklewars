"use client";

import { NATION_LIST } from "@/config/nations";
import { evolutionFor } from "@/lib/domain/evolution";
import { useWorld } from "@/store/world";
import { cn } from "@/lib/utils";
import { NationEmblem } from "./NationEmblem";

export function NationCards() {
  const nations = useWorld((s) => s.canonical.nations);
  const current = useWorld((s) => s.current);
  const select = useWorld((s) => s.select);
  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Nations">
      {NATION_LIST.map((n) => {
        const s = nations[n.code];
        const evo = evolutionFor(s.xp);
        const isA = current?.effect.a === n.code;
        const isT = current?.effect.t === n.code;
        return (
          <li key={n.code}>
            <button
              type="button"
              onClick={() => select(n.code)}
              className={cn(
                "card card-hover flex w-full min-h-16 items-center gap-2.5 p-2.5 text-left",
                isT && "animate-glitch",
              )}
              style={{
                borderColor: isA
                  ? `color-mix(in srgb, ${n.color} 55%, transparent)`
                  : isT
                    ? "rgb(255 7 58 / 0.5)"
                    : undefined,
              }}
            >
              <NationEmblem
                code={n.code}
                size={34}
                xp={s.xp}
                active={isA ? "attacker" : isT ? "target" : null}
              />
              <span className="min-w-0">
                <span
                  className="block truncate font-display text-sm font-bold"
                  style={{ color: n.color }}
                >
                  {n.flag} {n.persona}
                </span>
                <span className="mono-label block truncate text-fg-muted">
                  {evo.badge} {evo.title} · XP {s.xp}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
