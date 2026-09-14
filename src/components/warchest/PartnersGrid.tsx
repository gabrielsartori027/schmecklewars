import { ExternalLink } from "lucide-react";
import { PARTNERS, PARTNER_STATUS_COLOR } from "@/config/partners";
import { THEATER_META } from "@/config/theaters";
import { Badge } from "@/components/ui/Badge";
import { Card, SectionTitle } from "@/components/ui/Card";

export function PartnersGrid() {
  const confirmed = PARTNERS.filter((p) => p.status === "Confirmed" && p.confirmationUrl);
  const others = PARTNERS.filter((p) => !(p.status === "Confirmed" && p.confirmationUrl));
  return (
    <Card>
      <SectionTitle as="h2" sub={`${confirmed.length} confirmed · ${others.length} candidates`}>
        Partners
      </SectionTitle>
      {confirmed.length === 0 ? (
        <p className="mb-3 rounded-[var(--radius-md)] border border-dashed border-border-hover p-3 text-sm text-fg-secondary">
          No partner is <span className="font-semibold text-aid">Confirmed</span> yet. Only
          organizations that publicly agreed to receive funds (with a confirmation link) are ever
          paid. Until then the aid pool carries over.
        </p>
      ) : null}
      <div className="mono-label mb-2 text-fg-muted">Candidates — not yet funded</div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {[...confirmed, ...others].map((p) => {
          const color = PARTNER_STATUS_COLOR[p.status];
          return (
            <li
              key={p.id}
              className="rounded-[var(--radius-md)] border border-border-subtle bg-bg-surface-2 p-3"
              style={p.status === "Confirmed" ? { borderColor: "var(--color-aid)" } : undefined}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-display text-sm font-bold text-fg-primary">{p.name}</div>
                  <div className="mono-label mt-0.5 truncate text-fg-muted">
                    {p.mandate.join(" · ")}
                  </div>
                </div>
                <Badge color={color}>{p.status}</Badge>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {p.theaters.map((th) => (
                  <Badge
                    key={th}
                    color={THEATER_META[th].color}
                    soft={false}
                    className="text-[10px]"
                  >
                    {THEATER_META[th].label}
                  </Badge>
                ))}
              </div>
              <div className="mt-2 flex items-center justify-between font-mono text-[11px] text-fg-muted">
                <span>received: $0</span>
                <span className="flex gap-3">
                  <a
                    href={p.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-fg-primary"
                  >
                    site <ExternalLink size={11} aria-hidden />
                  </a>
                  {p.confirmationUrl ? (
                    <a
                      href={p.confirmationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-aid underline decoration-aid/40 underline-offset-2 hover:decoration-aid"
                    >
                      confirmation <ExternalLink size={11} aria-hidden />
                    </a>
                  ) : null}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-fg-muted">
        Status path: Candidate → Contacted → Confirmed → Paused. Neutral, registered, non-profit
        humanitarian organizations only (medical, food, shelter, demining, refugees). Never a
        government, army, armed group or party to a conflict; every disbursement is screened for
        sanctions.
      </p>
    </Card>
  );
}
