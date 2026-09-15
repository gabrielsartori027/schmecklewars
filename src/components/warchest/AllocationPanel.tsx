"use client";

import { EPOCH_DAYS_DEFAULT } from "@/config/epochs";
import { useProjected } from "@/hooks/useProjected";
import { fmtDateTimeUtc } from "@/lib/format";
import { THEATERS, type Theater } from "@/lib/domain/types";
import { useWorld } from "@/store/world";
import { Card, SectionTitle } from "@/components/ui/Card";
import { AllocationRing, TheaterLegend } from "./AllocationRing";

export function AllocationPanel() {
  const { theaters } = useProjected();
  const epoch = useWorld((s) => s.epoch);
  const share = Object.fromEntries(THEATERS.map((th) => [th, theaters[th].share])) as Record<
    Theater,
    number
  >;
  return (
    <Card>
      <SectionTitle as="h2" sub="live · the epoch average is what pays out">
        Allocation
      </SectionTitle>
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <AllocationRing
          share={share}
          split={epoch?.projectedSplit ?? null}
          size={190}
          center={
            <div>
              <div className="mono-label text-fg-muted">projected</div>
              <div className="font-display text-sm font-bold text-fg-primary">
                {epoch?.projectedSplit ? "split if closed now" : "carry-over"}
              </div>
            </div>
          }
        />
        <div className="min-w-0 flex-1">
          <TheaterLegend share={share} split={epoch?.projectedSplit ?? null} />
          <p className="mt-3 text-xs text-fg-muted">
            Inner ring: live heat share. Outer ring: projected aid split (eligible theaters only, 10
            % floor).{" "}
            {epoch?.projectedSplit
              ? ""
              : "No partner is Confirmed yet, so the whole aid pool rolls over to the next epoch — nothing is paid out to a Candidate."}{" "}
            Phase 1 adds the time-weighted average of the epoch, which is the number that actually
            pays out.
          </p>
        </div>
      </div>
    </Card>
  );
}

export function EpochCard() {
  const epoch = useWorld((s) => s.epoch);
  const open = Boolean(epoch?.genesis);
  return (
    <Card>
      <SectionTitle as="h2">Epoch</SectionTitle>
      {open && epoch ? (
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="mono-label text-fg-muted">epoch</div>
            <div className="font-display text-2xl font-bold text-fg-primary">{epoch.n || 1}</div>
          </div>
          <div>
            <div className="mono-label text-fg-muted">status</div>
            <div className="font-display text-base font-bold text-aid">
              {epoch.n > 0 ? "in progress" : "opens at launch"}
            </div>
          </div>
          <div>
            <div className="mono-label text-fg-muted">closes</div>
            <div className="font-mono text-xs text-fg-primary">{fmtDateTimeUtc(epoch.end)}</div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-fg-secondary">
          Epoch 1 starts at launch (GENESIS_TS) and closes {EPOCH_DAYS_DEFAULT} days later, at a UTC
          boundary. The timeline of past epochs, snapshots and hashes lands in Phase 1.
        </p>
      )}
    </Card>
  );
}
