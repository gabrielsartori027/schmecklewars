import { RICK_CHEST_NOTE } from "@/config/site";
import { NationEmblem } from "@/components/nation/NationEmblem";
import { Card } from "@/components/ui/Card";

export function RickNote() {
  return (
    <Card accent="var(--color-brand)">
      <div className="flex items-start gap-3">
        <NationEmblem code="USA" size={44} showRank={false} />
        <div>
          <div className="mono-label text-brand">Rick&apos;s note</div>
          <p className="mt-1 font-display text-base leading-relaxed text-fg-primary">
            “{RICK_CHEST_NOTE}”
          </p>
        </div>
      </div>
    </Card>
  );
}
