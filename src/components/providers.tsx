"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { Toaster } from "sonner";
import { useWorldSync } from "@/hooks/useWorldSync";
import { simulationEnabled } from "@/lib/public-env";
import { useWorld } from "@/store/world";
import { LevelUpOverlay } from "@/components/engine/LevelUpOverlay";
import { RickToast } from "@/components/engine/RickToast";
import { NationDrawer } from "@/components/nation/NationDrawer";
import { DynamicTitle } from "@/components/shell/DynamicTitle";

declare global {
  interface Window {
    __schmeckle?: typeof useWorld;
  }
}

function WorldEngine() {
  useWorldSync();
  useEffect(() => {
    // Dev only: inspect the world store from the console (window.__schmeckle.getState()).
    if (simulationEnabled) window.__schmeckle = useWorld;
  }, []);
  return (
    <>
      <DynamicTitle />
      <RickToast />
      <LevelUpOverlay />
      <NationDrawer />
    </>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { refetchOnWindowFocus: false, retry: 1, gcTime: 15 * 60_000 },
        },
      }),
  );
  return (
    <QueryClientProvider client={client}>
      {children}
      <WorldEngine />
      <Toaster
        position="bottom-right"
        theme="dark"
        toastOptions={{
          style: {
            background: "var(--color-bg-surface-2)",
            border: "1px solid var(--color-border-hover)",
            color: "var(--color-fg-primary)",
          },
        }}
      />
    </QueryClientProvider>
  );
}
