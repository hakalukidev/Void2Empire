"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useLocaleStore } from "@/store/locale-store";
import { fetchGainersLosers, type GainersLosers as GainersLosersData } from "@/services/markets.service";

export function GainersLosers() {
  const { t } = useLocaleStore();
  const [data, setData] = useState<GainersLosersData | null>(null);
  const [tab, setTab] = useState<"gainers" | "losers">("gainers");

  useEffect(() => {
    fetchGainersLosers().then(setData);
  }, []);

  const rows = data ? (tab === "gainers" ? data.gainers : data.losers) : [];

  return (
    <Card className="bg-card border-border p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t("markets.movers_title")}</h2>
        <div className="flex gap-1 rounded-lg bg-secondary/50 p-1 text-xs font-medium">
          <button
            onClick={() => setTab("gainers")}
            className={cn(
              "flex items-center gap-1 rounded-md px-2.5 py-1 transition-colors",
              tab === "gainers" ? "bg-success/15 text-success" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <TrendingUp className="h-3.5 w-3.5" /> {t("markets.gainers")}
          </button>
          <button
            onClick={() => setTab("losers")}
            className={cn(
              "flex items-center gap-1 rounded-md px-2.5 py-1 transition-colors",
              tab === "losers" ? "bg-danger/15 text-danger" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <TrendingDown className="h-3.5 w-3.5" /> {t("markets.losers")}
          </button>
        </div>
      </div>

      <ul className="mt-4 divide-y divide-border">
        {rows.map((row) => (
          <li key={row.pair}>
            <Link
              href={`/trade/futures/${row.pair}`}
              className="flex items-center justify-between gap-3 py-3 hover:opacity-80"
            >
              <span className="text-sm font-medium">{row.symbol}</span>
              <span className="text-right">
                <span className="block font-mono text-sm font-semibold">{row.price}</span>
                <span
                  className={cn(
                    "block font-mono text-xs font-medium",
                    row.up ? "text-success" : "text-danger"
                  )}
                >
                  {row.changePct}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
