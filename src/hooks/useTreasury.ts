"use client";

import { useQuery } from "@tanstack/react-query";
import type { TreasurySnapshot } from "@/lib/server/treasury";

export type TreasuryResponse = ({ ok: true } & TreasurySnapshot) | { ok: false; error: string };

export function useTreasury(intervalMs = 60_000) {
  return useQuery({
    queryKey: ["treasury"],
    queryFn: async () => {
      const r = await fetch("/api/treasury");
      if (!r.ok) throw new Error(`treasury ${r.status}`);
      return (await r.json()) as TreasuryResponse;
    },
    refetchInterval: intervalMs,
    refetchIntervalInBackground: false,
    staleTime: 20_000,
  });
}
