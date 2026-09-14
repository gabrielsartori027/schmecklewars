"use client";

import { Check, Copy } from "lucide-react";
import { useCopy } from "@/hooks/useCopy";
import { cn } from "@/lib/utils";

export function CopyButton({
  text,
  label = "Copy",
  className,
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const { copied, copy } = useCopy();
  return (
    <button
      type="button"
      onClick={() => void copy(text)}
      className={cn(
        "inline-flex min-h-9 items-center gap-1.5 rounded-[var(--radius-sm)] border border-border-subtle bg-bg-surface-2 px-2.5 text-xs text-fg-secondary transition-colors hover:border-brand/40 hover:text-fg-primary",
        copied && "border-brand/50 text-brand",
        className,
      )}
      aria-live="polite"
    >
      {copied ? <Check size={14} strokeWidth={1.75} /> : <Copy size={14} strokeWidth={1.75} />}
      {copied ? "Copied" : label}
    </button>
  );
}
