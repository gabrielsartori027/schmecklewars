import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: string;
  soft?: boolean;
}

/** Mono, uppercase chip painted with an arbitrary color (nation, theater, status). */
export function Badge({
  color = "var(--color-fg-secondary)",
  soft = true,
  className,
  style,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={cn(
        "mono-label inline-flex items-center gap-1 rounded-full border px-2 py-1",
        className,
      )}
      style={{
        color,
        borderColor: `color-mix(in srgb, ${color} 35%, transparent)`,
        background: soft ? `color-mix(in srgb, ${color} 10%, transparent)` : undefined,
        ...style,
      }}
      {...rest}
    />
  );
}
