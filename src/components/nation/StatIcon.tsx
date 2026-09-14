import { Coins, Cpu, Eye, Handshake, Radiation, Swords } from "lucide-react";
import { STATS } from "@/config/stats";
import type { StatKey } from "@/lib/domain/types";

const ICONS = { Swords, Coins, Radiation, Cpu, Handshake, Eye } as const;

export function StatIcon({
  stat,
  size = 14,
  className,
}: {
  stat: StatKey;
  size?: number;
  className?: string;
}) {
  const Icon = ICONS[STATS[stat].icon];
  return (
    <Icon
      size={size}
      strokeWidth={1.75}
      className={className}
      style={{ color: STATS[stat].color }}
      aria-hidden
    />
  );
}
