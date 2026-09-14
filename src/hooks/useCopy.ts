"use client";

import { useCallback, useState } from "react";

export function useCopy(timeoutMs = 2000) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        window.setTimeout(() => setCopied(false), timeoutMs);
      } catch {
        /* clipboard unavailable */
      }
    },
    [timeoutMs],
  );
  return { copied, copy };
}
