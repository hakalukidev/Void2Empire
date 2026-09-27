"use client";

import { use, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TradingChart } from "@/components/ui/trading-chart";
import { CountdownTimer } from "@/components/p2p/countdown-timer";
import {
  calculateFeePreview,
  getFundingConfig,
  FundingConfig,
} from "@/services/futures-fees.service";
import { Info, TrendingDown, TrendingUp } from "lucide-react";

const mockChartData = [
  { time: "2024-01-01", value: 45000 },
  { time: "2024-01-02", value: 46000 },
  { time: "2024-01-03", value: 45500 },
  { time: "2024-01-04", value: 47000 },
  { time: "2024-01-05", value: 48000 },
];

interface PageProps {
  params: Promise<{ pair: string }>;
}

export default function TradeFuturesPairPage({ params }: PageProps) {
  const { pair } = use(params);
  const displayPair = pair.replace("-", "/").toUpperCase();

  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [leverage, setLeverage] = useState(10);
  const [margin, setMargin] = useState("");
  const [fundingConfig, setFundingConfig] = useState<FundingConfig | null>(null);
  const [side, setSide] = useState<"long" | "short">("long");

  useEffect(() => {
    getFundingConfig(pair).then(setFundingConfig);
  }, [pair]);

  const marginNum = parseFloat(margin) || 0;
  const fees = calculateFeePreview(marginNum);
  const positionSize = marginNum * leverage;

  const fundingRatePct = fundingConfig ? (fundingConfig.fundingRate * 100).toFixed(4) : "0.0000";
  const isPayingFunding =
    fundingConfig &&
    ((side === "long" && fundingConfig.fundingDirection === "long_pays_short") ||
      (side === "short" && fundingConfig.fundingDirection === "short_pays_long"));

  return (
    <div className="flex flex-col lg:flex-row h-screen pt-16 bg-background">
      {/* Left: Orderbook placeholder */}
      <div className="w-full lg:w-[260px] border-r border-border p-4 flex flex-col gap-4 overflow-y-auto shrink-0">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Order Book</h2>
        <div className="flex-1 rounded-md bg-secondary/20 border border-border flex items-center justify-center text-muted-foreground text-xs">
          Order Book Data
        </div>
      </div>

      {/* Center: Chart */}
      <div className="flex-1 flex flex-col border-r border-border min-w-0">
        <div className="p-4 border-b border-border flex justify-between items-center bg-card">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{displayPair}</h1>
            <p className="text-sm text-success font-medium">+2.45% (24h)</p>
          </div>
          <div className="flex gap-8 text-sm">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Mark Price</p>
              <p className="font-bold text-lg font-mono">48,000.00</p>
            </div>
            <div className="text-right hidden md:block">
              <p className="text-xs text-muted-foreground">24h Volume</p>
              <p className="font-bold font-mono">$2.4B</p>
            </div>
          </div>
        </div>
        <div className="flex-1 p-4">
          <TradingChart data={mockChartData} />
        </div>
      </div>

      {/* Right: Order Form */}
      <div className="w-full lg:w-[340px] p-4 bg-card flex flex-col gap-4 overflow-y-auto border-l border-border shrink-0">

        {/* Side selector */}
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setSide("long")}
            className={`py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-1.5 transition-colors ${side === "long" ? "bg-success text-white" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
            <TrendingUp className="w-4 h-4" /> Long
          </button>
          <button onClick={() => setSide("short")}
            className={`py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-1.5 transition-colors ${side === "short" ? "bg-danger text-white" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
            <TrendingDown className="w-4 h-4" /> Short
          </button>
        </div>

        {/* Order Type */}
        <div className="flex gap-1 p-1 bg-secondary/30 rounded-lg border border-border">
          {(["market", "limit"] as const).map(t => (
            <button key={t} onClick={() => setOrderType(t)}
              className={`flex-1 py-1.5 rounded-md text-xs font-semibold capitalize transition-colors ${orderType === t ? "bg-card text-foreground border border-border shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Leverage */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-medium text-muted-foreground">Leverage</label>
            <span className="text-xs font-bold text-primary px-2 py-0.5 bg-primary/10 rounded border border-primary/20">{leverage}x</span>
          </div>
          <input type="range" min="1" max="100" value={leverage} onChange={e => setLeverage(Number(e.target.value))}
            className="w-full accent-primary" />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
            <span>1x</span><span>25x</span><span>50x</span><span>100x</span>
          </div>
        </div>

        {/* Margin Input */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Margin (USDT)</label>
          <Input
            type="number"
            placeholder="0.00"
            value={margin}
            onChange={e => setMargin(e.target.value)}
            className="bg-secondary/30"
          />
          {positionSize > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              Position Size: <span className="font-semibold text-foreground">${positionSize.toLocaleString()} USDT</span>
            </p>
          )}
        </div>

        {orderType === "limit" && (
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Limit Price (USDT)</label>
            <Input type="number" placeholder="48,000.00" className="bg-secondary/30" />
          </div>
        )}

        {/* ── Fee Breakdown ────────────────────────────────── */}
        <div className="rounded-lg border border-border bg-secondary/20 p-3 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" /> Fee Breakdown
          </p>
          <div className="space-y-1.5 text-xs">
            {[
              { label: "Margin", value: marginNum > 0 ? `${marginNum.toFixed(2)} USDT` : "—" },
              { label: "Entry Fee (2%)", value: marginNum > 0 ? `${fees.entryFee.toFixed(2)} USDT` : "—", color: "text-warning" },
              { label: "Closing Fee (2%)", value: marginNum > 0 ? `${fees.closingFee.toFixed(2)} USDT` : "—", color: "text-warning" },
            ].map(row => (
              <div key={row.label} className="flex justify-between">
                <span className="text-muted-foreground">{row.label}</span>
                <span className={`font-mono font-medium ${row.color ?? "text-foreground"}`}>{row.value}</span>
              </div>
            ))}
            <div className="border-t border-border pt-1.5 flex justify-between font-semibold">
              <span className="text-muted-foreground">Total Fees</span>
              <span className={`font-mono ${marginNum > 0 ? "text-danger" : "text-foreground"}`}>
                {marginNum > 0 ? `${fees.totalFees.toFixed(2)} USDT` : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* ── Funding Rate Info ─────────────────────────────── */}
        {fundingConfig && (
          <div className={`rounded-lg border p-3 space-y-2 ${isPayingFunding ? "border-warning/30 bg-warning/5" : "border-success/30 bg-success/5"}`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">📊 Funding Rate</p>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Rate</span>
                <span className={`font-mono font-bold ${isPayingFunding ? "text-warning" : "text-success"}`}>
                  {isPayingFunding ? "-" : "+"}{fundingRatePct}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Direction</span>
                <span className="font-medium text-foreground capitalize">
                  {fundingConfig.fundingDirection === "long_pays_short" ? "Long → Short" : "Short → Long"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Interval</span>
                <span className="font-medium">{fundingConfig.fundingInterval}h</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Next Settlement</span>
                <CountdownTimer expiresAt={fundingConfig.nextSettlementAt} warningThresholdSeconds={1800} />
              </div>
              {marginNum > 0 && (
                <div className={`border-t border-border/50 pt-1.5 flex justify-between font-semibold ${isPayingFunding ? "text-warning" : "text-success"}`}>
                  <span>{isPayingFunding ? "You will pay" : "You will receive"}</span>
                  <span className="font-mono">{(marginNum * fundingConfig.fundingRate).toFixed(4)} USDT</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Submit */}
        <Button
          className={`w-full py-3 font-bold text-white ${side === "long" ? "bg-success hover:bg-success/90" : "bg-danger hover:bg-danger/90"}`}>
          {side === "long" ? "Open Long" : "Open Short"}
          {marginNum > 0 && ` — ${positionSize.toLocaleString()} USDT`}
        </Button>

        <p className="text-[10px] text-center text-muted-foreground">
          By placing an order you agree to the{" "}
          <a href="/risk-disclosure" className="underline hover:text-foreground">Risk Disclosure</a>.
        </p>
      </div>
    </div>
  );
}
