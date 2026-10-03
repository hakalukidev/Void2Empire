"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { List } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { groupDecimalString } from "@/lib/utils/decimal";
import { useLocaleStore } from "@/store/locale-store";
import { fetchMarkets, MarketRow } from "@/services/markets.service";

export function MarketsList() {
  const { t } = useLocaleStore();
  const [rows, setRows] = useState<MarketRow[]>([]);

  useEffect(() => {
    fetchMarkets().then(setRows);
  }, []);

  return (
    <Card className="bg-card border-border p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t("markets.list_title")}</h2>
        <List className="h-4 w-4 text-muted-foreground" />
      </div>

      <ul className="mt-4 divide-y divide-border">
        {rows.length === 0 ? (
          <li className="py-8 text-center text-sm text-muted-foreground">{t("markets.no_markets")}</li>
        ) : (
          rows.map((row) => (
            <li key={row.symbol}>
              <Link
                href={`/trade/futures/${row.symbol}`}
                className="flex items-center justify-between gap-3 py-3 hover:opacity-80"
              >
                <span className="text-sm font-medium">{row.pair}</span>
                <span className="text-right">
                  <span className="block font-mono text-sm font-semibold">{groupDecimalString(row.price)}</span>
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
          ))
        )}
      </ul>
    </Card>
  );
}
