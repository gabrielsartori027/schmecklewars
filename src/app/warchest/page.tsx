import type { Metadata } from "next";
import { EPOCH_DAYS_DEFAULT } from "@/config/epochs";
import { AllocationPanel, EpochCard } from "@/components/warchest/AllocationPanel";
import { ChestDisclaimer } from "@/components/warchest/ChestDisclaimer";
import { ChestHero } from "@/components/warchest/ChestHero";
import { DonateCard } from "@/components/warchest/DonateCard";
import { FlowDiagram } from "@/components/warchest/FlowDiagram";
import { PartnersGrid } from "@/components/warchest/PartnersGrid";
import { ProofOfAid } from "@/components/warchest/ProofOfAid";
import { RickNote } from "@/components/warchest/RickNote";
import { RulesCard } from "@/components/warchest/RulesCard";

export const metadata: Metadata = {
  title: "War Chest",
  description: `A public treasury on Robinhood Chain: the creator share of $CHMCO trading fees, split by the WW3 index every ${EPOCH_DAYS_DEFAULT} days between neutral humanitarian organizations. Every disbursement verifiable on-chain.`,
  alternates: { canonical: "/warchest" },
};

export default function WarChestPage() {
  return (
    <div className="space-y-4">
      <ChestHero />
      <FlowDiagram />
      <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
        <AllocationPanel />
        <EpochCard />
      </div>
      <PartnersGrid />
      <ProofOfAid />
      <div className="grid gap-4 lg:grid-cols-2">
        <DonateCard />
        <RulesCard />
      </div>
      <RickNote />
      <ChestDisclaimer />
    </div>
  );
}
