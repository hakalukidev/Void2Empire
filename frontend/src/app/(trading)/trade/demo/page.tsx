"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocaleStore } from "@/store/locale-store";
import { TradingChart } from "@/components/ui/trading-chart";
import { FlaskConical, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

const DEMO_PAIRS = ["BTC-USDT", "ETH-USDT", "SOL-USDT", "BNB-USDT", "XRP-USDT"];
const DEMO_BALANCE = 10000;

export default function TradeDemoPage() {
  const { t } = useLocaleStore();
  const [pair, setPair] = useState("BTC-USDT");
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [side, setSide] = useState<"long" | "short">("long");
  const [leverage, setLeverage] = useState(10);
  const [size, setSize] = useState("");

  const sizeNum = parseFloat(size) || 0;
  const margin = sizeNum / leverage;
  const fee = sizeNum * 0.0004;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-4 gap-4">
      {/* Demo Mode Banner */}
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-warning/10 border border-warning/30 rounded-lg">
        <div className="flex items-center gap-2 text-warning text-sm font-medium">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          You are in <span className="font-bold">DEMO MODE</span>. All trades use virtual funds and have no real monetary value.
        </div>
        <Link href="/trade/futures/BTC-USDT">
          <Button size="sm" variant="primary" className="text-xs shrink-0">Switch to Live Trading</Button>
        </Link>
      </div>

      {/* Demo Balance Bar */}
      <div className="flex items-center gap-6 px-4 py-2 bg-card border border-border rounded-lg text-sm">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-warning" />
          <span className="text-muted-foreground">Demo Balance:</span>
          <span className="font-bold text-warning">${DEMO_BALANCE.toLocaleString()}.00</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Unrealized PnL:</span>
          <span className="font-bold text-success">+$0.00</span>
        </div>
        <Button size="sm" variant="secondary" className="ml-auto text-xs">Reset Demo Account</Button>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden flex-col lg:flex-row">
        {/* Pair Selector + Chart */}
        <div className="flex-1 flex flex-col gap-3 min-h-[400px]">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {DEMO_PAIRS.map((p) => (
              <button
                key={p}
                onClick={() => setPair(p)}
                className={`px-4 py-1.5 rounded-lg border text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
                  pair === p
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:bg-secondary/50"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <Card className="flex-1 bg-card border-border overflow-hidden">
            <TradingChart symbol={pair} />
          </Card>
        </div>

        {/* Order Panel */}
        <Card className="w-full lg:w-72 p-4 flex flex-col gap-4 bg-card border-border shrink-0 overflow-y-auto">
          {/* Order Type */}
          <div className="flex gap-1 bg-secondary/30 p-1 rounded-md border border-border">
            {(["market", "limit"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setOrderType(type)}
                className={`flex-1 py-1.5 rounded text-xs font-medium capitalize transition-colors ${
                  orderType === type ? "bg-card text-foreground border border-border" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Long / Short */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setSide("long")}
              className={`py-2 rounded-md text-sm font-bold border transition-all ${
                side === "long"
                  ? "bg-success text-white border-success shadow-[0_0_12px_rgba(34,197,94,0.3)]"
                  : "bg-success/5 text-success border-success/30 hover:bg-success/10"
              }`}
            >
              Long
            </button>
            <button
              onClick={() => setSide("short")}
              className={`py-2 rounded-md text-sm font-bold border transition-all ${
                side === "short"
                  ? "bg-danger text-white border-danger shadow-[0_0_12px_rgba(239,68,68,0.3)]"
                  : "bg-danger/5 text-danger border-danger/30 hover:bg-danger/10"
              }`}
            >
              Short
            </button>
          </div>

          {/* Leverage */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-muted-foreground">Leverage</label>
              <span className="text-sm font-bold text-primary">{leverage}x</span>
            </div>
            <input
              type="range" min={1} max={100} value={leverage}
              onChange={(e) => setLeverage(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="grid grid-cols-4 gap-1">
              {[5, 10, 25, 50].map((lev) => (
                <button key={lev} onClick={() => setLeverage(lev)}
                  className={`py-1 text-xs rounded border transition-colors ${leverage === lev ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground hover:bg-secondary/50"}`}>
                  {lev}x
                </button>
              ))}
            </div>
          </div>

          {/* Size */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Position Size (USDT)</label>
            <Input type="number" placeholder="0.00" value={size} onChange={(e) => setSize(e.target.value)} className="bg-secondary/30" />
          </div>

          {/* Fee preview */}
          <div className="space-y-2 p-3 bg-secondary/20 rounded-lg border border-border text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Required Margin</span>
              <span className="text-foreground font-medium">${margin.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Est. Fee (0.04%)</span>
              <span className="text-foreground font-medium">${fee.toFixed(4)}</span>
            </div>
          </div>

          {/* Submit */}
          <Button
            className={`w-full h-12 text-sm font-bold mt-auto ${
              side === "long"
                ? "bg-success hover:bg-success/90 text-white"
                : "bg-danger hover:bg-danger/90 text-white"
            }`}
          >
            {side === "long" ? <TrendingUp className="w-4 h-4 mr-2" /> : <TrendingDown className="w-4 h-4 mr-2" />}
            {side === "long" ? "Open Long (Demo)" : "Open Short (Demo)"}
          </Button>
        </Card>
      </div>
    </div>
  );
}

