import { EPOCH_EVERY } from "@/config/epochs";

export const SITE = {
  name: "Schmeckle Wars",
  title: "Schmeckle Wars — WW3 Dashboard | $CHMCO",
  titleTemplate: "%s · Schmeckle Wars",
  description: `Live WW3 Probability Dashboard. Real conflicts move the index; the index moves the War Chest — a public treasury on Robinhood Chain that funds neutral humanitarian aid ${EPOCH_EVERY}. $CHMCO.`,
  tagline:
    "The only memecoin backed by human conflict — and the only one that does something about it.",
  motto: "Wars go up. Aid goes out.",
  subtitle: "Interdimensional War Dashboard · $CHMCO on Robinhood Chain",
  footer: "SCHMECKLE WARS v9 · Real Wars · Shared World · War Chest on Robinhood Chain",
  version: "v9",
} as const;

/** New disclaimer text (prompt §2.2 item 5). Shown in every footer and on /warchest. */
export const DISCLAIMER =
  "$CHMCO is a memecoin with no intrinsic value and no promise of returns. The War Chest is funded by the creator share of trading fees and by voluntary donations — not by holders' purchases; holders receive no tax benefit and have no claim on the treasury. The War Chest funds only neutral, registered humanitarian organizations. It never funds governments, armed forces, armed groups or any party to a conflict, and every disbursement is screened for sanctions compliance. Allocation follows the published rules and is verifiable on-chain. Nothing on this site is financial, legal or humanitarian advice.";

/** Rick's note on /warchest (new text). */
export const RICK_CHEST_NOTE =
  "Every other memecoin *burp* just sits there. This one buys bandages. The War Engine watches the planet, the Chest follows the heat, and the receipts go on-chain — because trust is for Jerrys.";

/** RICK C-137 SPEAKING on /token (new text). */
export const RICK_SPEECH = {
  intro:
    "Listen Morty, *burp* every civilization that achieved interdimensional travel figured out the same thing: war is the one industry that never has a bear market. Every other pathetic memecoin is backed by nothing. $CHMCO is backed by human conflict — and it's the only one that does something about it.",
  body: `Every trade drops a fee into the War Chest. The War Engine watches every missile, every drone, every red line crossed — and the hotter a theater gets, the bigger its cut. The Chest drops schmeckles ${EPOCH_EVERY} on the medics, the deminers and the people handing out bread. Receipts on-chain, because trust is for Jerrys.`,
  outro: "Wars go up. Aid goes out. That's the whole tokenomics, Morty.",
} as const;

export const NAV = [
  { href: "/", label: "War Map", icon: "Map" },
  { href: "/dossier", label: "Dossier", icon: "Users" },
  { href: "/doomsday", label: "Doomsday", icon: "Radiation" },
  { href: "/log", label: "War Log", icon: "Radio" },
  { href: "/warchest", label: "War Chest", icon: "Package" },
  { href: "/token", label: "$CHMCO", icon: "FlaskConical" },
] as const;

export type NavIcon = (typeof NAV)[number]["icon"];
