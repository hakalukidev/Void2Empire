"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocaleStore } from "@/store/locale-store";
import { Search, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";

const MOCK_MARKETS = [
  { pair: "BTC-USDT", name: "Bitcoin", price: 65432.10, change: 2.5, volume: "1.2B" },
  { pair: "ETH-USDT", name: "Ethereum", price: 3456.78, change: -1.2, volume: "850M" },
  { pair: "SOL-USDT", name: "Solana", price: 145.67, change: 5.8, volume: "420M" },
  { pair: "BNB-USDT", name: "BNB", price: 580.40, change: 0.5, volume: "310M" },
  { pair: "XRP-USDT", name: "Ripple", price: 0.62, change: -0.4, volume: "150M" },
  { pair: "DOGE-USDT", name: "Dogecoin", price: 0.15, change: 12.4, volume: "890M" },
];

export default function MarketsPage() {
  const { t } = useLocaleStore();
  const [search, setSearch] = useState("");

  const filteredMarkets = MOCK_MARKETS.filter(market => 
    market.pair.toLowerCase().includes(search.toLowerCase()) || 
    market.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">{t("markets.title")}</h1>
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder={t("markets.search")} 
            className="pl-9 bg-card border-border"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card className="overflow-hidden bg-card border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">{t("markets.asset")}</th>
                <th className="px-6 py-4 font-medium">{t("markets.price")}</th>
                <th className="px-6 py-4 font-medium">{t("markets.change")}</th>
                <th className="px-6 py-4 font-medium hidden md:table-cell">{t("markets.volume")}</th>
                <th className="px-6 py-4 font-medium text-right">{t("markets.action")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredMarkets.map((market) => (
                <tr key={market.pair} className="hover:bg-secondary/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-bold text-xs">
                        {market.pair.split('-')[0].substring(0, 1)}
                      </div>
                      <div>
                        <div className="font-bold">{market.pair}</div>
                        <div className="text-xs text-muted-foreground">{market.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono font-medium">
                    ${market.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                  </td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center gap-1 font-medium ${market.change >= 0 ? 'text-success' : 'text-danger'}`}>
                      {market.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {Math.abs(market.change)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell text-muted-foreground">
                    ${market.volume}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/trade/futures/${market.pair}`}>
                        <Button size="sm" variant="secondary" className="h-8 text-xs">{t("markets.trade_futures")}</Button>
                      </Link>
                      <Link href={`/trade/binary/${market.pair}`}>
                        <Button size="sm" variant="primary" className="h-8 text-xs">{t("markets.trade_binary")}</Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredMarkets.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No markets found matching "{search}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
