"use client";

import Link from "next/link";
import { useCountdown } from "@/hooks/useCountdown";
import { useProjected } from "@/hooks/useProjected";
import { fmtCountdown } from "@/lib/format";
import { THEATERS, type Theater } from "@/lib/domain/types";
import { useWorld } from "@/store/world";
import { Card } from "@/components/ui/Card";
import { AllocationRing, TheaterLegend } from "@/components/warchest/AllocationRing";

export function WhereAidGoes() {
  const { theaters } = useProjected();
  const epoch = useWorld((s) => s.epoch);
  const chest = useWorld((s) => s.chest);
  const countdown = useCountdown(chest?.nextDropAt ?? null);
  const share = Object.fromEntries(THEATERS.map((th) => [th, theaters[th].share])) as Record<
    Theater,
    number
  >;
  return (
    <Card className="h-full">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-display text-base font-bold text-fg-primary">Where the aid goes</h2>
        <Link
          href="/warchest"
          className="mono-label text-aid underline decoration-aid/40 underline-offset-2 hover:decoration-aid"
        >
          rules →
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <AllocationRing
          share={share}
          split={epoch?.projectedSplit ?? null}
          size={132}
          center={
            <div>
              <div className="mono-label text-fg-muted">next drop</div>
              <div className="font-display text-base font-bold tabular text-fg-primary">
                {countdown !== null ? fmtCountdown(countdown) : "at launch"}
              </div>
            </div>
          }
        />
        <div className="min-w-0 flex-1">
          <TheaterLegend share={share} split={epoch?.projectedSplit ?? null} compact />
          <p className="mt-2 text-[11px] leading-snug text-fg-muted">
            Live theater heat share.{" "}
            {epoch?.projectedSplit
              ? "Outer ring: projected split if the epoch closed now."
              : "Payouts start once a partner is Confirmed; until then the pool rolls over."}
          </p>
        </div>
      </div>
    </Card>
  );
}
