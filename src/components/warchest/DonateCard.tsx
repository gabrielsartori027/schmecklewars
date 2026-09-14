"use client";

import QRCode from "react-qr-code";
import { LINKS } from "@/config/token";
import { TREASURY } from "@/config/treasury";
import { AddressChip } from "@/components/ui/AddressChip";
import { LinkButton } from "@/components/ui/Button";
import { Card, SectionTitle } from "@/components/ui/Card";
import { AddNetworkButton } from "./AddNetworkButton";

/** "Feed the Chest": address, QR (EIP-681), add-network button, voluntary / not tax-deductible. */
export function DonateCard() {
  const addr = TREASURY.warChest;
  return (
    <Card>
      <SectionTitle as="h2" sub="ETH or USDG on Robinhood Chain (chain 4663)">
        Feed the Chest
      </SectionTitle>
      {addr ? (
        <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-start">
          <div className="mx-auto rounded-[var(--radius-md)] bg-white p-2" style={{ width: 148 }}>
            <QRCode
              value={LINKS.donate(addr)}
              size={132}
              bgColor="#ffffff"
              fgColor="#06080B"
              level="M"
              title="War Chest address QR"
            />
          </div>
          <div className="space-y-3">
            <AddressChip address={addr} full />
            <div className="flex flex-wrap gap-2">
              <LinkButton href={LINKS.donate(addr)} variant="aid" size="sm" external>
                Open in wallet (EIP-681)
              </LinkButton>
              <AddNetworkButton size="sm" />
            </div>
            <p className="text-xs text-fg-muted">
              Send only on <span className="font-semibold text-fg-secondary">Robinhood Chain</span>{" "}
              (an Ethereum L2). Funds sent on another network cannot be recovered by this site.
              Donations are voluntary and{" "}
              <span className="font-semibold text-fg-secondary">not tax-deductible</span>; they
              carry no rights and no expectation of return. Robinhood Wallet, MetaMask, Rabby, Trust
              and OKX work; Phantom does not support this network.
            </p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-fg-secondary">
          The donation address appears when the Safe is created at launch.
        </p>
      )}
    </Card>
  );
}
