"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocaleStore } from "@/store/locale-store";
import { TradingChart } from "@/components/ui/trading-chart";
import { TrendingUp, TrendingDown, Clock, Activity } from "lucide-react";

const EXPIRATION_TIMES = [
  { label: "1m", value: 60 },
  { label: "3m", value: 180 },
  { label: "5m", value: 300 },
  { label: "15m", value: 900 },
];

export default function BinaryTradePage() {
  const { t } = useLocaleStore();
  const params = useParams();
  const pair = typeof params.pair === 'string' ? params.pair.replace('%2D', '-') : "BTC-USDT";
  
  const [amount, setAmount] = useState("10");
  const [expiration, setExpiration] = useState(EXPIRATION_TIMES[0].value);
  
  const payoutRate = 0.85; // 85% payout
  const investAmount = parseFloat(amount) || 0;
  const potentialProfit = investAmount * payoutRate;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-4 gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight">{pair} <span className="text-sm font-normal text-muted-foreground ml-2">Binary</span></h1>
          <div className="flex items-center gap-2 px-3 py-1 bg-success/10 text-success rounded-full text-sm font-medium border border-success/20">
            <Activity className="w-4 h-4" />
            Live
          </div>
        </div>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden flex-col lg:flex-row">
        {/* Main Chart Area */}
        <div className="flex-1 flex flex-col gap-4 min-h-[400px]">
          <Card className="flex-1 bg-card border-border overflow-hidden relative">
             <div className="absolute top-4 left-4 z-10 flex gap-2">
                {/* Timeframe selector mock */}
                <div className="bg-secondary/80 backdrop-blur-sm border border-border p-1 rounded-md flex gap-1 text-xs font-medium">
                  <button className="px-2 py-1 rounded bg-secondary text-foreground">1s</button>
                  <button className="px-2 py-1 rounded text-muted-foreground hover:text-foreground">5s</button>
                  <button className="px-2 py-1 rounded text-muted-foreground hover:text-foreground">15s</button>
                  <button className="px-2 py-1 rounded text-muted-foreground hover:text-foreground">1m</button>
                </div>
             </div>
             {/* Note: The chart would be initialized with smaller timeframes for binary */}
             <TradingChart symbol={pair} />
          </Card>
        </div>

        {/* Order Entry Sidebar */}
        <Card className="w-full lg:w-80 p-4 flex flex-col gap-6 bg-card border-border overflow-y-auto shrink-0">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {t("binary.expiration")}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {EXPIRATION_TIMES.map((time) => (
                  <button
                    key={time.label}
                    onClick={() => setExpiration(time.value)}
                    className={`p-2 rounded-md border text-sm font-medium transition-colors ${
                      expiration === time.value 
                      ? "border-primary bg-primary/10 text-primary" 
                      : "border-border bg-card text-muted-foreground hover:bg-secondary/50"
                    }`}
                  >
                    {time.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">{t("binary.amount")}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input 
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-7 bg-secondary/30 text-lg font-bold"
                />
              </div>
            </div>

            <div className="p-4 bg-secondary/30 rounded-lg border border-border space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("binary.payout")} ({(payoutRate * 100).toFixed(0)}%)</span>
                <span className="font-semibold">${(investAmount + potentialProfit).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("binary.profit")}</span>
                <span className="font-bold text-success">+${potentialProfit.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-auto pt-6">
             <Button className="h-20 bg-success hover:bg-success/90 text-white text-lg font-bold flex flex-col gap-1 border-b-4 border-success-focus active:border-b-0 active:translate-y-1 transition-all">
                <TrendingUp className="w-6 h-6" />
                {t("binary.up")}
             </Button>
             <Button className="h-20 bg-danger hover:bg-danger/90 text-white text-lg font-bold flex flex-col gap-1 border-b-4 border-danger-focus active:border-b-0 active:translate-y-1 transition-all">
                <TrendingDown className="w-6 h-6" />
                {t("binary.down")}
             </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
