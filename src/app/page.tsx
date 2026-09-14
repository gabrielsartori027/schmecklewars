import type { Metadata } from "next";
import { LatestEvent } from "@/components/home/LatestEvent";
import { WarChestStrip } from "@/components/home/WarChestStrip";
import { WhereAidGoes } from "@/components/home/WhereAidGoes";
import { WarMapPanel } from "@/components/map/WarMapPanel";
import { NationCards } from "@/components/nation/NationCards";

export const metadata: Metadata = {
  title: "War Map",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <div className="space-y-4">
      <WarChestStrip />
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <WarMapPanel />
        </div>
        <div className="grid gap-4 lg:col-span-4">
          <LatestEvent />
          <WhereAidGoes />
        </div>
      </div>
      <NationCards />
    </div>
  );
}
