import { Card, SectionTitle } from "@/components/ui/Card";

const STEPS = [
  { t: "Trades", s: "$CHMCO on Pons / Uniswap", c: "#39FF14" },
  { t: "Creator share", s: "70% of the 1% fee", c: "#00D4FF" },
  { t: "War Chest", s: "Safe 2-of-3", c: "#4ADE80" },
  { t: "70 / 20 / 10", s: "aid · ops · reserve", c: "#FFD700" },
  { t: "Theaters", s: "split by heat", c: "#FF6B00" },
  { t: "Partners", s: "neutral, Confirmed", c: "#BF40FF" },
  { t: "Proof of Aid", s: "every leg on-chain", c: "#4ADE80" },
];

/** Trades → Creator share → War Chest → 70/20/10 → Theaters → Partners → Proof of Aid */
export function FlowDiagram() {
  return (
    <Card>
      <SectionTitle as="h2">How the money moves</SectionTitle>
      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {STEPS.map((st, i) => (
          <li
            key={st.t}
            className="relative rounded-[var(--radius-md)] border border-border-subtle bg-bg-surface-2 p-3"
            style={{ borderTopColor: st.c, borderTopWidth: 2 }}
          >
            <div className="mono-label text-fg-muted">{String(i + 1).padStart(2, "0")}</div>
            <div className="mt-1 font-display text-sm font-bold" style={{ color: st.c }}>
              {st.t}
            </div>
            <div className="text-[11px] text-fg-secondary">{st.s}</div>
            {i < STEPS.length - 1 ? (
              <span
                className="absolute -right-2 top-1/2 hidden -translate-y-1/2 text-fg-muted lg:inline"
                aria-hidden
              >
                →
              </span>
            ) : null}
          </li>
        ))}
      </ol>
      <p className="mt-3 text-xs text-fg-muted">
        Every 14 days an epoch closes: the time-weighted heat share of each theater becomes the
        split of the aid pool. The multisig executes bridge + donation; each disbursement becomes a
        Proof of Aid line with all legs verified on-chain.
      </p>
    </Card>
  );
}
