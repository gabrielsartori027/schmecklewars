"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { SITE } from "@/config/site";
import { useProjected } from "@/hooks/useProjected";
import { useWorld } from "@/store/world";

const ROUTE_TITLES: Record<string, string> = {
  "/": "War Map",
  "/dossier": "Dossier",
  "/doomsday": "Doomsday",
  "/log": "War Log",
  "/warchest": "War Chest",
  "/token": "$CHMCO",
};

/** `document.title` follows the live index: "🟡 21.3% · War Map · Schmeckle Wars". */
export function DynamicTitle() {
  const { index, tier } = useProjected(30_000);
  const status = useWorld((s) => s.status);
  const pathname = usePathname();
  useEffect(() => {
    if (status === "loading") return;
    const page = ROUTE_TITLES[pathname] ?? SITE.name;
    document.title = `${tier.icon} ${index.toFixed(1)}% · ${page} · ${SITE.name}`;
  }, [index, tier, pathname, status]);
  return null;
}
