import type { Theater } from "@/lib/domain/types";

export type PartnerStatus = "Candidate" | "Contacted" | "Confirmed" | "Paused";
export type Mandate =
  "medical" | "food" | "shelter" | "demining" | "refugees" | "water" | "children";

export type PartnerReceive =
  | { type: "evm"; chainId: number; address: `0x${string}`; asset: "ETH" | "USDC" | "USDG" }
  | { type: "giving-block"; url: string }
  | { type: "other"; url: string };

export interface Partner {
  id: string;
  name: string;
  theaters: Theater[];
  mandate: Mandate[];
  receive?: PartnerReceive;
  status: PartnerStatus;
  /** Public proof that the organization agreed to receive funds. Required for `Confirmed`. */
  confirmationUrl?: string;
  registrationRef?: string;
  weight?: number;
  notes?: string;
  website: string;
}

/**
 * Seed: ALL `Candidate`. Organizations publicly known to accept crypto donations — verify each
 * one and formalize contact before changing status. Only `Confirmed` partners with a public
 * `confirmationUrl` ever receive funds. Never a government, army, armed group or party to a conflict.
 */
export const PARTNERS: readonly Partner[] = [
  {
    id: "usa-for-unhcr",
    name: "USA for UNHCR",
    theaters: ["EASTERN_FRONT", "MIDDLE_EAST", "GLOBAL"],
    mandate: ["refugees", "shelter"],
    status: "Candidate",
    website: "https://www.unrefugees.org/",
    notes: "Listed in The Giving Block directory (verify current listing).",
  },
  {
    id: "msf",
    name: "Doctors Without Borders / MSF",
    theaters: ["MIDDLE_EAST", "EASTERN_FRONT", "GLOBAL"],
    mandate: ["medical"],
    status: "Candidate",
    website: "https://www.doctorswithoutborders.org/",
  },
  {
    id: "unicef",
    name: "UNICEF",
    theaters: ["MIDDLE_EAST", "EASTERN_FRONT", "KOREAN_PENINSULA", "GLOBAL"],
    mandate: ["children", "water", "medical"],
    status: "Candidate",
    website: "https://www.unicef.org/",
  },
  {
    id: "direct-relief",
    name: "Direct Relief",
    theaters: ["EASTERN_FRONT", "MIDDLE_EAST", "GLOBAL"],
    mandate: ["medical"],
    status: "Candidate",
    website: "https://www.directrelief.org/",
  },
  {
    id: "wck",
    name: "World Central Kitchen",
    theaters: ["MIDDLE_EAST", "EASTERN_FRONT", "GLOBAL"],
    mandate: ["food"],
    status: "Candidate",
    website: "https://wck.org/",
  },
  {
    id: "imc",
    name: "International Medical Corps",
    theaters: ["MIDDLE_EAST", "EASTERN_FRONT", "GLOBAL"],
    mandate: ["medical"],
    status: "Candidate",
    website: "https://internationalmedicalcorps.org/",
  },
  {
    id: "save-the-children",
    name: "Save the Children",
    theaters: ["MIDDLE_EAST", "EASTERN_FRONT", "INDO_PACIFIC", "GLOBAL"],
    mandate: ["children", "food", "shelter"],
    status: "Candidate",
    website: "https://www.savethechildren.org/",
  },
  {
    id: "halo-trust",
    name: "The HALO Trust",
    theaters: ["EASTERN_FRONT", "MIDDLE_EAST"],
    mandate: ["demining"],
    status: "Candidate",
    website: "https://www.halotrust.org/",
  },
];

export const PARTNER_STATUS_COLOR: Record<PartnerStatus, string> = {
  Confirmed: "var(--color-aid)",
  Candidate: "var(--color-fg-muted)",
  Contacted: "var(--color-fg-muted)",
  Paused: "var(--color-warning)",
};
