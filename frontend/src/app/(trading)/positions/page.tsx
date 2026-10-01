"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart2, TrendingUp, TrendingDown } from "lucide-react";
import { addDecimalStrings, compareDecimalStrings } from "@/lib/utils/decimal";
import {
  fetchOpenPositions,
  fetchPositionsSummary,
  FuturesPosition,
} from "@/services/futures-positions.service";

const sign = (value: string) => (compareDecimalStrings(value, "0") >= 0 ? "+" : "");
const isNeg = (value: string) => compareDecimalStrings(value, "0") < 0;

export default function PositionsPage() {
  const [positions, setPositions] = useState<FuturesPosition[]>([]);
  const [accountEquity, setAccountEquity] = useState("0.00");

  useEffect(() => {
    fetchOpenPositions().then(setPositions);
    fetchPositionsSummary().then((s) => setAccountEquity(s.accountEquity));
  }, []);

  const totalPnl = addDecimalStrings(...positions.map((p) => p.pnl));
  const totalMargin = addDecimalStrings(...positions.map((p) => p.margin));

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <BarChart2 className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Positions</h1>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-card border-border">
          <p className="text-xs text-muted-foreground mb-1">Open Positions</p>
          <p className="text-2xl font-bold">{positions.length}</p>
        </Card>
        <Card className="p-4 bg-card border-border">
          <p className="text-xs text-muted-foreground mb-1">Total Margin Used</p>
          <p className="text-2xl font-bold">${totalMargin}</p>
        </Card>
        <Card className="p-4 bg-card border-border border-l-4 border-l-success">
          <p className="text-xs text-muted-foreground mb-1">Unrealized PnL</p>
          <p className={`text-2xl font-bold ${isNeg(totalPnl) ? "text-danger" : "text-success"}`}>
            {sign(totalPnl)}${totalPnl}
          </p>
        </Card>
        <Card className="p-4 bg-card border-border">
          <p className="text-xs text-muted-foreground mb-1">Account Equity</p>
          <p className="text-2xl font-bold">${accountEquity}</p>
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
              {positions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-muted-foreground">
                    No open positions.
                  </td>
                </tr>
              ) : positions.map((pos) => (
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
                  <td className="px-6 py-4 font-mono">${pos.entryPrice}</td>
                  <td className="px-6 py-4 font-mono">${pos.markPrice}</td>
                  <td className="px-6 py-4 font-mono text-danger">${pos.liqPrice}</td>
                  <td className="px-6 py-4 font-mono">${pos.margin}</td>
                  <td className="px-6 py-4">
                    <div className={isNeg(pos.pnl) ? "text-danger" : "text-success"}>
                      <div className="font-bold">{sign(pos.pnl)}${pos.pnl}</div>
                      <div className="text-xs opacity-70">{sign(pos.pnlPct)}{pos.pnlPct}%</div>
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
