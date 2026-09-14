import { DISCLAIMER, SITE } from "@/config/site";
import { LINKS } from "@/config/token";
import { TREASURY } from "@/config/treasury";

export function Footer() {
  return (
    <footer className="relative z-10 mt-12 border-t border-border-subtle">
      <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6">
        <p className="mono-label text-fg-muted">{SITE.footer}</p>
        <p className="mt-4 max-w-4xl text-xs leading-relaxed text-fg-secondary" id="disclaimer">
          {DISCLAIMER}
        </p>
        <nav
          aria-label="Footer links"
          className="mt-4 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[11px] text-fg-muted"
        >
          <a
            href={LINKS.repo}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-fg-primary"
          >
            Source on GitHub
          </a>
          <a
            href="/api/events"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-fg-primary"
          >
            Public event log (/api/events)
          </a>
          <a
            href="/api/state"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-fg-primary"
          >
            World state (/api/state)
          </a>
          {TREASURY.warChest ? (
            <a
              href={LINKS.explorerAddress(TREASURY.warChest)}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-fg-primary"
            >
              War Chest on Blockscout
            </a>
          ) : null}
          <a
            href={LINKS.robinhoodDocs}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-fg-primary"
          >
            Robinhood Chain docs
          </a>
        </nav>
      </div>
    </footer>
  );
}
