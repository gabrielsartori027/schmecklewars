import {
  EMERGENCY_HN,
  EMERGENCY_HOURS,
  EPOCH_LABEL,
  MIN_DROP_USD,
  RULES_VERSION,
  SPLIT,
  THEATER_FLOOR,
} from "@/config/epochs";
import { LINKS } from "@/config/token";
import { Card, SectionTitle } from "@/components/ui/Card";

const RULES = [
  `Epochs last ${EPOCH_LABEL} from the launch timestamp (GENESIS_TS), on UTC boundaries.`,
  `Inflows of an epoch are split ${SPLIT.aid * 100} % aid · ${SPLIT.ops * 100} % ops · ${SPLIT.reserve * 100} % reserve (USD value at the time of each transaction).`,
  "The aid pool is divided between theaters by their time-weighted heat share over the epoch — the same heat you see on the map.",
  `Only theaters with at least one Confirmed partner are eligible; the share of ineligible theaters is redistributed. Every eligible theater gets at least ${THEATER_FLOOR * 100} %.`,
  `Inside a theater the amount is split equally between Confirmed partners (or by their published weight). Amounts below $${MIN_DROP_USD} roll over to the next epoch.`,
  "At close, an Allocation Snapshot (JSON) is published and its SHA-256 is written on-chain in a 0-ETH self-transaction, so anyone can recompute it from the public log.",
  "The multisig executes the transfers by hand: bridge out of Robinhood Chain, then donation to the organization's published address. A drop is Verified only when every leg matches on-chain.",
  `Emergency drops (Phase 2): a theater at hn ≥ ${EMERGENCY_HN} for ≥ ${EMERGENCY_HOURS} h can unlock up to 50 % of the reserve.`,
];

export function RulesCard() {
  return (
    <Card>
      <SectionTitle as="h2" sub={`rules v${RULES_VERSION}`}>
        Rules
      </SectionTitle>
      <ol className="list-decimal space-y-2 pl-5 text-sm text-fg-secondary">
        {RULES.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ol>
      <p className="mt-3 text-xs text-fg-muted">
        The rules are code:{" "}
        <a
          href={`${LINKS.repo}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-info underline decoration-info/40 underline-offset-2 hover:decoration-info"
        >
          src/lib/domain/allocation.ts · epochs.ts · config/epochs.ts
        </a>
        . Settlement through the canonical bridge can take up to 7 days (Arbitrum challenge period);
        faster routes may be used when available.
      </p>
    </Card>
  );
}
