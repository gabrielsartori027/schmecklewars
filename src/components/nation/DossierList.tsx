"use client";

import { NATION_LIST } from "@/config/nations";
import { useWorld } from "@/store/world";
import { DossierCard } from "./DossierCard";

export function DossierList() {
  const nations = useWorld((s) => s.canonical.nations);
  return (
    <div className="grid gap-3 xl:grid-cols-2">
      {NATION_LIST.map((n, i) => (
        <DossierCard key={n.code} nation={n} stats={nations[n.code]} index={i} />
      ))}
    </div>
  );
}
