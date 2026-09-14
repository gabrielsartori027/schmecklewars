import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  accent?: string;
  hover?: boolean;
  padded?: boolean;
}

export function Card({ className, accent, hover, padded = true, style, ...rest }: CardProps) {
  return (
    <div
      className={cn("card", hover && "card-hover", padded && "p-4 sm:p-5", className)}
      style={
        accent ? { borderColor: `color-mix(in srgb, ${accent} 28%, transparent)`, ...style } : style
      }
      {...rest}
    />
  );
}

export function SectionTitle({
  children,
  sub,
  className,
  as: Tag = "h2",
}: {
  children: React.ReactNode;
  sub?: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <div className={cn("mb-3 flex flex-wrap items-end justify-between gap-2", className)}>
      <Tag className="font-display text-lg font-bold tracking-tight text-fg-primary sm:text-xl">
        {children}
      </Tag>
      {sub ? <div className="mono-label text-fg-muted">{sub}</div> : null}
    </div>
  );
}

export function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mono-label text-fg-muted", className)}>{children}</div>;
}
