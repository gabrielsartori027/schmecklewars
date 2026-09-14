import { DISCLAIMER } from "@/config/site";
import { LINKS } from "@/config/token";
import { Card, SectionTitle } from "@/components/ui/Card";

export function ChestDisclaimer() {
  return (
    <Card>
      <SectionTitle as="h2">Disclaimer</SectionTitle>
      <p className="text-sm leading-relaxed text-fg-secondary">{DISCLAIMER}</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <div className="mono-label mb-1 text-fg-muted">How we pick partners</div>
          <p className="text-xs text-fg-secondary">
            Neutral, registered, non-profit humanitarian organizations with a public track record
            (medical, food, shelter, demining, refugees, water, children). Each one is contacted,
            confirms in writing that it accepts crypto donations, and is screened against sanctions
            lists before its status becomes Confirmed. The confirmation link is published next to
            the partner.
          </p>
        </div>
        <div>
          <div className="mono-label mb-1 text-fg-muted">Report a problem</div>
          <p className="text-xs text-fg-secondary">
            Wrong number, suspicious transaction, a partner that should not be here? Open an issue
            on{" "}
            <a
              href={LINKS.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="text-info underline decoration-info/40 underline-offset-2 hover:decoration-info"
            >
              GitHub
            </a>
            . The event log and the vault are public; every claim on this page can be checked on
            Blockscout.
          </p>
        </div>
      </div>
    </Card>
  );
}
