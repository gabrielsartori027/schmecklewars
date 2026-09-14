"use client";

import { fmtDateUtc } from "@/lib/format";
import { useWorld } from "@/store/world";
import { Card, SectionTitle } from "@/components/ui/Card";

/** Phase 0: honest empty state. Phase 1: ledger with legs, filters and CSV. */
export function ProofOfAid() {
  const chest = useWorld((s) => s.chest);
  const when = chest?.nextDropAt ? fmtDateUtc(chest.nextDropAt) : null;
  return (
    <Card accent="var(--color-aid)">
      <SectionTitle as="h2" sub="every leg verified on-chain">
        Proof of Aid
      </SectionTitle>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="mono-label text-fg-muted">
            <tr>
              <th scope="col" className="py-2 pr-3 font-normal">
                Date
              </th>
              <th scope="col" className="py-2 pr-3 font-normal">
                Epoch
              </th>
              <th scope="col" className="py-2 pr-3 font-normal">
                Theater
              </th>
              <th scope="col" className="py-2 pr-3 font-normal">
                Partner
              </th>
              <th scope="col" className="py-2 pr-3 font-normal">
                Amount
              </th>
              <th scope="col" className="py-2 pr-3 font-normal">
                Legs
              </th>
              <th scope="col" className="py-2 font-normal">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={7} className="py-8 text-center">
                <div className="font-display text-base font-semibold text-fg-secondary">
                  No aid drop yet.
                </div>
                <div className="mt-1 text-fg-muted">
                  {when
                    ? `First Aid Drop after Epoch 1 closes on ${when} UTC.`
                    : "First Aid Drop after Epoch 1 closes (14 days after launch)."}{" "}
                  Each drop will list its legs — Safe → bridge → destination chain → organization —
                  and is marked Verified only when all of them match on-chain.
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  );
}
