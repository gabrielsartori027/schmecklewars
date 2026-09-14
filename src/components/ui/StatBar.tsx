import { STATS } from "@/config/stats";
import { STAT_MAX } from "@/config/stats";
import type { StatKey } from "@/lib/domain/types";
import { cn } from "@/lib/utils";
import { StatIcon } from "@/components/nation/StatIcon";

export function StatBar({
  stat,
  value,
  compact = false,
}: {
  stat: StatKey;
  value: number;
  compact?: boolean;
}) {
  const meta = STATS[stat];
  const pct = Math.min(100, Math.max(0, (value / STAT_MAX) * 100));
  return (
    <div
      className={cn("flex items-center gap-2", compact ? "text-[11px]" : "text-xs")}
      title={`${meta.name}: ${value}/${STAT_MAX}`}
    >
      <span className="flex w-14 shrink-0 items-center gap-1 font-mono text-fg-secondary">
        <StatIcon stat={stat} size={compact ? 11 : 13} />
        {meta.label}
      </span>
      <div
        className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/6"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={STAT_MAX}
        aria-valuenow={value}
        aria-label={meta.name}
      >
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-(--ease-out)"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${meta.color}88, ${meta.color})`,
          }}
        />
      </div>
      <span
        className="w-7 text-right font-display font-semibold tabular"
        style={{ color: meta.color }}
      >
        {value}
      </span>
    </div>
  );
}
