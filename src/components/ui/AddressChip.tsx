import { ExternalLink } from "lucide-react";
import { LINKS } from "@/config/token";
import { truncateAddress } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CopyButton } from "./CopyButton";

/** `0xAb3d…9xYz` + copy + Blockscout link — the only way an address is ever shown. */
export function AddressChip({
  address,
  className,
  full = false,
}: {
  address: string;
  className?: string;
  full?: boolean;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <code className="rounded-[var(--radius-sm)] border border-border-subtle bg-bg-surface-2 px-2.5 py-1.5 font-mono text-xs text-fg-primary">
        {full ? address : truncateAddress(address)}
      </code>
      <CopyButton text={address} />
      <a
        href={LINKS.explorerAddress(address)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-9 items-center gap-1 rounded-[var(--radius-sm)] border border-border-subtle bg-bg-surface-2 px-2.5 text-xs text-fg-secondary transition-colors hover:border-info/40 hover:text-info"
      >
        Blockscout <ExternalLink size={12} strokeWidth={1.75} />
      </a>
    </div>
  );
}
