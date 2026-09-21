import { MarketsSidebar } from "@/components/markets/markets-sidebar";
import { MarketsTopbar } from "@/components/markets/markets-topbar";
import { BalanceChart } from "@/components/markets/balance-chart";
import { PositionCalculator } from "@/components/markets/position-calculator";
import { EaPromoCard } from "@/components/markets/ea-promo-card";
import { EconomicEvents } from "@/components/markets/economic-events";
import { MarketsList } from "@/components/markets/markets-list";
import { MarketHours } from "@/components/markets/market-hours";

export default function MarketsPage() {
  return (
    <div className="flex min-h-screen bg-[#050b06]">
      <MarketsSidebar />

      <div className="min-w-0 flex-1">
        <MarketsTopbar />

        <div className="grid gap-6 p-6 xl:grid-cols-[1fr_360px]">
          <BalanceChart />
          <PositionCalculator />
        </div>

        <div className="grid gap-6 p-6 pt-0 md:grid-cols-2 xl:grid-cols-4">
          <EaPromoCard />
          <EconomicEvents />
          <MarketsList />
          <MarketHours />
        </div>
      </div>
    </div>
  );
}
