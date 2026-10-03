"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, Plus, ToggleLeft, ToggleRight, Pencil } from "lucide-react";
import { listedMarkets, type ListedMarket, type TradingProduct } from "@/config/markets";

// Which coin may be traded where is the client's decision, not an operator guess:
// v20 Step 7 keeps the four brand coins out of Binary, Step 9 makes VUSDT a
// Funding-only asset, and Step 8 names five coins for "Binance Trading" — a market
// the spec never defines, so they are listed with no rails. This screen mirrors
// `config/markets.ts` instead of a second, invented list.
//
// No price, minimum trade size or per-asset leverage column: an initial price
// needs a market-data source (DR-002/DR-023) and the listing criteria behind all
// three are open DR items, so any figure here would be made up.
const PRODUCTS: TradingProduct[] = ["spot", "futures", "binary"];

interface AssetRow {
  symbol: string;
  pair: string;
  name: string;
  group: ListedMarket["group"];
  products: TradingProduct[];
  status: "active" | "paused";
}

const ASSET_ROWS: AssetRow[] = listedMarkets.map((market) => ({
  symbol: market.symbol,
  pair: market.pair,
  name: market.name,
  group: market.group,
  products: market.products,
  // A coin with no product rails is recorded but not live.
  status: market.products.length > 0 ? "active" : "paused",
}));

const GROUP_LABEL: Record<ListedMarket["group"], string> = {
  platform: "Platform coin",
  funding_asset: "Funding asset",
  binance_group: "Binance Trading (market undefined)",
  provisional_major: "Provisional — launch list unanswered",
};

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${value ? "bg-success" : "bg-secondary border border-border"}`}>
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${value ? "translate-x-4" : "translate-x-1"}`} />
    </button>
  );
}

export default function AdminAssetsPage() {
  const [rows, setRows] = useState<AssetRow[]>(ASSET_ROWS);

  const toggleStatus = (symbol: string) =>
    setRows((prev) =>
      prev.map((row) =>
        row.symbol === symbol
          ? { ...row, status: row.status === "active" ? ("paused" as const) : ("active" as const) }
          : row
      )
    );

  // Local only: the server owns listing state, so this toggle changes nothing that
  // reaches a trading screen.
  const toggleProduct = (symbol: string, product: TradingProduct) =>
    setRows((prev) =>
      prev.map((row) =>
        row.symbol === symbol
          ? {
              ...row,
              products: row.products.includes(product)
                ? row.products.filter((p) => p !== product)
                : [...row.products, product],
            }
          : row
      )
    );

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Coins className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Assets & Markets</h1>
        </div>
        <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4" /> Add Asset
        </Button>
      </div>

      <Card className="overflow-hidden bg-card border-border">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground">
              <tr>
                <th className="px-5 py-4 font-medium">Asset</th>
                {PRODUCTS.map((product) => (
                  <th key={product} className="px-5 py-4 font-medium text-center capitalize">
                    {product}
                  </th>
                ))}
                <th className="px-5 py-4 font-medium">Funding</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.symbol} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-bold">{row.pair}</div>
                    <div className="text-xs text-muted-foreground">{row.name}</div>
                    <div className="text-[11px] text-muted-foreground">{GROUP_LABEL[row.group]}</div>
                  </td>
                  {PRODUCTS.map((product) => (
                    <td key={product} className="px-5 py-4 text-center">
                      <Toggle
                        value={row.products.includes(product)}
                        onChange={() => toggleProduct(row.symbol, product)}
                      />
                    </td>
                  ))}
                  <td className="px-5 py-4 text-center">
                    {row.products.includes("funding") ? (
                      <span className="rounded border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                        Funding asset
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <button onClick={() => toggleStatus(row.symbol)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize transition-colors ${
                        row.status === "active" ? "border-success/20 bg-success/10 text-success hover:bg-success/20" : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/50"
                      }`}>
                      {row.status === "active" ? <ToggleRight className="w-3 h-3" /> : <ToggleLeft className="w-3 h-3" />}
                      {row.status}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Button size="sm" variant="secondary" className="h-7 text-xs gap-1">
                      <Pencil className="w-3 h-3" /> Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
