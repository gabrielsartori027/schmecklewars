"use client";

import { useQuery } from "@tanstack/react-query";
import type { TokenData } from "@/lib/server/token-price";

export type TokenResponse = ({ ok: true } & TokenData) | { ok: false; error: string };

export function useTokenData(enabled: boolean, intervalMs = 12_000) {
  return useQuery({
    queryKey: ["token"],
    queryFn: async () => {
      const r = await fetch("/api/token");
      if (!r.ok) throw new Error(`token ${r.status}`);
      return (await r.json()) as TokenResponse;
    },
    enabled,
    refetchInterval: intervalMs,
    refetchIntervalInBackground: false,
    staleTime: 8_000,
  });
}
