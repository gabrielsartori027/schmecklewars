"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Prefs {
  muted: boolean;
  soundHintSeen: boolean;
  lastCursor: string | null;
  seenEventIds: string[];
  setMuted: (m: boolean) => void;
  markSoundHint: () => void;
  rememberCursor: (c: string | null) => void;
  markSeen: (ids: string[]) => void;
}

/** Only preferences are persisted (section 7.9). The world itself is canonical on the server. */
export const usePrefs = create<Prefs>()(
  persist(
    (set, get) => ({
      muted: true,
      soundHintSeen: false,
      lastCursor: null,
      seenEventIds: [],
      setMuted: (muted) => set({ muted }),
      markSoundHint: () => set({ soundHintSeen: true }),
      rememberCursor: (lastCursor) => set({ lastCursor }),
      markSeen: (ids) => set({ seenEventIds: [...get().seenEventIds, ...ids].slice(-200) }),
    }),
    {
      name: "schmeckle-wars:prefs",
      version: 1,
      partialize: (s) => ({
        muted: s.muted,
        soundHintSeen: s.soundHintSeen,
        lastCursor: s.lastCursor,
        seenEventIds: s.seenEventIds,
      }),
      onRehydrateStorage: () => () => {
        // The pre-v9 per-browser world is ignored and removed.
        try {
          localStorage.removeItem("sw-stats");
        } catch {
          /* private mode etc. */
        }
      },
    },
  ),
);
