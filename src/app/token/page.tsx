import type { Metadata } from "next";
import { MarketStats, PriceCard, RickSpeech, Tokenomics } from "@/components/token/PricePanels";
import { BuyCard, TokenHero } from "@/components/token/TokenHero";

export const metadata: Metadata = {
  title: "$CHMCO",
  description:
    "Schmeckle Coin ($CHMCO) on Robinhood Chain — buy on Pons or Uniswap, live price, tokenomics, and the creator share that feeds the War Chest.",
  alternates: { canonical: "/token" },
};

export default function TokenPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <TokenHero />
      <BuyCard />
      <PriceCard />
      <MarketStats />
      <RickSpeech />
      <Tokenomics />
    </div>
  );
}
