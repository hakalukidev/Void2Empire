"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, Plus, ToggleLeft, ToggleRight, Pencil } from "lucide-react";

interface Asset {
  id: string; symbol: string; name: string;
  spot: boolean; futures: boolean; binary: boolean;
  initialPrice: number; minTrade: number; maxLeverage: number;
  status: "active" | "paused";
}

const MOCK_ASSETS: Asset[] = [
  { id: "A1", symbol: "BTC-USDT", name: "Bitcoin",  spot: true,  futures: true,  binary: true,  initialPrice: 65000, minTrade: 10,  maxLeverage: 100, status: "active" },
  { id: "A2", symbol: "ETH-USDT", name: "Ethereum", spot: true,  futures: true,  binary: true,  initialPrice: 3500,  minTrade: 5,   maxLeverage: 50,  status: "active" },
  { id: "A3", symbol: "SOL-USDT", name: "Solana",   spot: true,  futures: true,  binary: false, initialPrice: 155,   minTrade: 5,   maxLeverage: 20,  status: "active" },
  { id: "A4", symbol: "BNB-USDT", name: "BNB",      spot: true,  futures: false, binary: false, initialPrice: 580,   minTrade: 5,   maxLeverage: 10,  status: "paused" },
  { id: "A5", symbol: "XRP-USDT", name: "Ripple",   spot: true,  futures: false, binary: true,  initialPrice: 0.62,  minTrade: 10,  maxLeverage: 10,  status: "active" },
];

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${value ? "bg-success" : "bg-secondary border border-border"}`}>
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${value ? "translate-x-4" : "translate-x-1"}`} />
    </button>
  );
}

export default function AdminAssetsPage() {
  const [assets, setAssets] = useState<Asset[]>(MOCK_ASSETS);

  const toggleStatus = (id: string) => setAssets(prev => prev.map(a =>
    a.id === id ? { ...a, status: a.status === "active" ? "paused" : "active" as "active" | "paused" } : a));

  const toggleProp = (id: string, prop: "spot" | "futures" | "binary") => setAssets(prev => prev.map(a =>
    a.id === id ? { ...a, [prop]: !a[prop] } : a));

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
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
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground">
              <tr>
                <th className="px-5 py-4 font-medium">Asset</th>
                <th className="px-5 py-4 font-medium">Initial Price</th>
                <th className="px-5 py-4 font-medium text-center">Spot</th>
                <th className="px-5 py-4 font-medium text-center">Futures</th>
                <th className="px-5 py-4 font-medium text-center">Binary</th>
                <th className="px-5 py-4 font-medium hidden md:table-cell">Min Trade</th>
                <th className="px-5 py-4 font-medium hidden md:table-cell">Max Lev.</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {assets.map((asset) => (
                <tr key={asset.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-bold">{asset.symbol}</div>
                    <div className="text-xs text-muted-foreground">{asset.name}</div>
                  </td>
                  <td className="px-5 py-4 font-mono">${asset.initialPrice.toLocaleString()}</td>
                  <td className="px-5 py-4 text-center">
                    <Toggle value={asset.spot} onChange={() => toggleProp(asset.id, "spot")} />
                  </td>
                  <td className="px-5 py-4 text-center">
                    <Toggle value={asset.futures} onChange={() => toggleProp(asset.id, "futures")} />
                  </td>
                  <td className="px-5 py-4 text-center">
                    <Toggle value={asset.binary} onChange={() => toggleProp(asset.id, "binary")} />
                  </td>
                  <td className="px-5 py-4 text-muted-foreground hidden md:table-cell">${asset.minTrade}</td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-bold border border-primary/20">{asset.maxLeverage}x</span>
                  </td>
                  <td className="px-5 py-4">
                    <button onClick={() => toggleStatus(asset.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize cursor-pointer transition-colors ${
                        asset.status === "active" ? "bg-success/10 text-success border-success/20 hover:bg-success/20" : "bg-muted/30 text-muted-foreground border-border hover:bg-muted/50"
                      }`}>
                      {asset.status === "active" ? <ToggleRight className="w-3 h-3" /> : <ToggleLeft className="w-3 h-3" />}
                      {asset.status}
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
