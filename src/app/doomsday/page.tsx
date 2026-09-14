import type { Metadata } from "next";
import { Gauge } from "@/components/doomsday/Gauge";
import {
  Arsenal,
  Methodology,
  Multipliers,
  PowerRanking,
  RiskFactors,
  TierLadder,
} from "@/components/doomsday/Panels";
import { TheaterHeat } from "@/components/doomsday/TheaterHeat";
import { SectionTitle } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Doomsday", alternates: { canonical: "/doomsday" } };

export default function DoomsdayPage() {
  return (
    <div className="space-y-4">
      <SectionTitle as="h1" sub="canonical · same number for every visitor">
        ☢️ WW3 Probability Index
      </SectionTitle>
      <Gauge />
      <div className="grid gap-4 lg:grid-cols-2">
        <TheaterHeat />
        <TierLadder />
      </div>
      <Methodology />
      <div className="grid gap-4 lg:grid-cols-2">
        <RiskFactors />
        <div className="space-y-4">
          <Arsenal />
          <Multipliers />
        </div>
      </div>
      <PowerRanking />
    </div>
  );
}
