"use client";

import { ExternalLink } from "lucide-react";
import { LINKS, TOKEN } from "@/config/token";
import { LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CopyButton } from "@/components/ui/CopyButton";
import { PortalLogo } from "@/components/shell/PortalLogo";
import { AddNetworkButton } from "@/components/warchest/AddNetworkButton";

export function TokenHero() {
  return (
    <Card className="text-center" accent="var(--color-brand)">
      <PortalLogo size={72} className="mx-auto" />
      <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-portal sm:text-5xl">
        {TOKEN.symbol}
      </h1>
      <p className="mt-1 text-sm text-fg-secondary">
        {TOKEN.name} on {TOKEN.network}
      </p>
      {TOKEN.ca ? (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <code className="max-w-full break-all rounded-[var(--radius-sm)] border border-border-subtle bg-bg-surface-2 px-3 py-2 font-mono text-xs">
            {TOKEN.ca}
          </code>
          <CopyButton text={TOKEN.ca} label="Copy CA" />
        </div>
      ) : (
        <p className="mono-label mt-4 text-warning">Contract address drops at launch</p>
      )}
    </Card>
  );
}

export function BuyCard() {
  const ca = TOKEN.ca;
  return (
    <Card>
      <div className="flex flex-wrap items-center gap-2">
        {TOKEN.launchpadUrl ? (
          <LinkButton href={TOKEN.launchpadUrl} variant="primary" size="lg" external>
            Buy on {TOKEN.launchpadName} <ExternalLink size={16} strokeWidth={1.75} />
          </LinkButton>
        ) : (
          <span className="inline-flex min-h-11 items-center rounded-[var(--radius-md)] border border-dashed border-border-hover px-4 text-sm text-fg-muted">
            Buy button appears at launch
          </span>
        )}
        {TOKEN.swapUrl ? (
          <LinkButton href={TOKEN.swapUrl} variant="secondary" external>
            Trade on Uniswap <ExternalLink size={14} strokeWidth={1.75} />
          </LinkButton>
        ) : null}
        {ca ? (
          <LinkButton href={LINKS.explorerToken(ca)} variant="secondary" external>
            View on Blockscout <ExternalLink size={14} strokeWidth={1.75} />
          </LinkButton>
        ) : null}
      </div>
      <div className="mt-4 rounded-[var(--radius-md)] border border-border-subtle bg-bg-surface-2 p-3">
        <div className="mono-label mb-2 text-fg-muted">New to Robinhood Chain?</div>
        <ol className="grid gap-2 text-sm text-fg-secondary sm:grid-cols-3">
          <li className="flex items-start gap-2">
            <span className="font-display font-bold text-brand">1</span>
            <span>
              Add the network to an EVM wallet (MetaMask, Rabby, Trust, OKX, Robinhood Wallet).{" "}
              <span className="text-fg-muted">Phantom does not support it.</span>
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-display font-bold text-brand">2</span>
            <span>
              Bridge ETH from Ethereum with the{" "}
              <a
                href={LINKS.bridge}
                target="_blank"
                rel="noopener noreferrer"
                className="text-info underline decoration-info/40 underline-offset-2 hover:decoration-info"
              >
                canonical bridge
              </a>{" "}
              (~10 min) — gas on Robinhood Chain is paid in ETH.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-display font-bold text-brand">3</span>
            <span>
              Buy on {TOKEN.launchpadName} while the token is on its bonding curve, or on Uniswap
              after it graduates.
            </span>
          </li>
        </ol>
        <div className="mt-3">
          <AddNetworkButton size="sm" />
        </div>
      </div>
    </Card>
  );
}
