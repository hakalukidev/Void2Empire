"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocaleStore } from "@/store/locale-store";
import { BarChart2, TrendingUp, TrendingDown } from "lucide-react";

interface Position {
  id: string;
  pair: string;
  side: "Long" | "Short";
  leverage: number;
  entryPrice: number;
  markPrice: number;
  size: number;
  margin: number;
  pnl: number;
  pnlPct: number;
  liqPrice: number;
}

const MOCK_POSITIONS: Position[] = [
  {
    id: "POS-001", pair: "BTC-USDT", side: "Long",  leverage: 10,
    entryPrice: 63000, markPrice: 65432, size: 0.1,
    margin: 630, pnl: 243.2, pnlPct: 3.86, liqPrice: 57200,
  },
  {
    id: "POS-002", pair: "ETH-USDT", side: "Short", leverage: 5,
    entryPrice: 3500, markPrice: 3456.78, size: 0.5,
    margin: 350, pnl: 21.6, pnlPct: 1.24, liqPrice: 3850,
  },
];

export default function PositionsPage() {
  const { t } = useLocaleStore();

  const totalPnl = MOCK_POSITIONS.reduce((sum, p) => sum + p.pnl, 0);
  const totalMargin = MOCK_POSITIONS.reduce((sum, p) => sum + p.margin, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <BarChart2 className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Positions</h1>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-card border-border">
          <p className="text-xs text-muted-foreground mb-1">Open Positions</p>
          <p className="text-2xl font-bold">{MOCK_POSITIONS.length}</p>
        </Card>
        <Card className="p-4 bg-card border-border">
          <p className="text-xs text-muted-foreground mb-1">Total Margin Used</p>
          <p className="text-2xl font-bold">${totalMargin.toFixed(2)}</p>
        </Card>
        <Card className="p-4 bg-card border-border border-l-4 border-l-success">
          <p className="text-xs text-muted-foreground mb-1">Unrealized PnL</p>
          <p className={`text-2xl font-bold ${totalPnl >= 0 ? "text-success" : "text-danger"}`}>
            {totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}
          </p>
        </Card>
        <Card className="p-4 bg-card border-border">
          <p className="text-xs text-muted-foreground mb-1">Account Equity</p>
          <p className="text-2xl font-bold">${(10000 + totalPnl).toFixed(2)}</p>
        </Card>
      </div>

      <Card className="overflow-hidden bg-card border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Pair</th>
                <th className="px-6 py-4 font-medium">Side</th>
                <th className="px-6 py-4 font-medium">Size</th>
                <th className="px-6 py-4 font-medium">Leverage</th>
                <th className="px-6 py-4 font-medium">Entry Price</th>
                <th className="px-6 py-4 font-medium">Mark Price</th>
                <th className="px-6 py-4 font-medium">Liq. Price</th>
                <th className="px-6 py-4 font-medium">Margin</th>
                <th className="px-6 py-4 font-medium">PnL</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {MOCK_POSITIONS.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-muted-foreground">
                    No open positions.
                  </td>
                </tr>
              ) : MOCK_POSITIONS.map((pos) => (
                <tr key={pos.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-6 py-4 font-bold">{pos.pair}</td>
                  <td className={`px-6 py-4 font-semibold flex items-center gap-1 ${pos.side === "Long" ? "text-success" : "text-danger"}`}>
                    {pos.side === "Long" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {pos.side}
                  </td>
                  <td className="px-6 py-4 font-mono">{pos.size}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                      {pos.leverage}x
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono">${pos.entryPrice.toLocaleString()}</td>
                  <td className="px-6 py-4 font-mono">${pos.markPrice.toLocaleString()}</td>
                  <td className="px-6 py-4 font-mono text-danger">${pos.liqPrice.toLocaleString()}</td>
                  <td className="px-6 py-4 font-mono">${pos.margin.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <div className={pos.pnl >= 0 ? "text-success" : "text-danger"}>
                      <div className="font-bold">{pos.pnl >= 0 ? "+" : ""}${pos.pnl.toFixed(2)}</div>
                      <div className="text-xs opacity-70">{pos.pnlPct >= 0 ? "+" : ""}{pos.pnlPct.toFixed(2)}%</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button size="sm" variant="secondary" className="h-8 text-xs border-danger/30 text-danger hover:bg-danger/10">
                      Close
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

