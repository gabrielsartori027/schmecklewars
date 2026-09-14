import type { Metadata } from "next";
import { DossierList } from "@/components/nation/DossierList";
import { SectionTitle } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Dossier", alternates: { canonical: "/dossier" } };

export default function DossierPage() {
  return (
    <div className="space-y-4">
      <SectionTitle as="h1" sub="8 nations · live stats · shared world">
        Interdimensional Dossier
      </SectionTitle>
      <DossierList />
    </div>
  );
}
