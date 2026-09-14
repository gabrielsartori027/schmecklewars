"use client";

import { FlaskConical } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useWorld } from "@/store/world";

/** Dev-only (NEXT_PUBLIC_SIMULATION=true, never on Vercel production). */
export function SimulateButton() {
  const syncNow = useWorld((s) => s.syncNow);
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          const r = await fetch("/api/dev/simulate?n=3", { method: "POST" });
          if (!r.ok) throw new Error(String(r.status));
          await syncNow();
          toast("SIMULATION — 3 fake events appended (dev only)");
        } catch {
          toast.error("Simulation unavailable (production or Upstash-backed world)");
        } finally {
          setBusy(false);
        }
      }}
      className="inline-flex min-h-9 items-center gap-1 rounded-full border border-warning/40 bg-warning/10 px-3 font-mono text-[11px] text-warning"
      title="Append 3 fake events labelled SIMULATION"
    >
      <FlaskConical size={13} strokeWidth={1.75} /> SIM
    </button>
  );
}
