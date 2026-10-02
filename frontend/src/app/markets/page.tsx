"use client";

import { useLocaleStore } from "@/store/locale-store";
import { MarketsList } from "@/components/markets/markets-list";
import { GainersLosers } from "@/components/markets/gainers-losers";
import { PositionCalculator } from "@/components/markets/position-calculator";
import { Suspense } from "react";
import { LineChart } from "lucide-react";

export default function MarketsPage() {
  const { t } = useLocaleStore();

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <LineChart className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">{t("markets.title")}</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {/* MarketsList reads the search params, which needs a boundary to prerender. */}
        <Suspense>
          <MarketsList />
        </Suspense>
        <GainersLosers />
        <PositionCalculator />
      </div>
    </div>
  );
}
