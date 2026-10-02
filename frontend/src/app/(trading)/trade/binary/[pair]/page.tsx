"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocaleStore } from "@/store/locale-store";
import { useAccountStore } from "@/store/account-store";
import { TradingChart } from "@/components/ui/trading-chart";
import { SampleBadge } from "@/components/home/sample-badge";
import { DemoDisclaimer } from "@/components/ui/demo-disclaimer";
import {
  fetchMarketSeries,
  type ChartSeriesPoint,
} from "@/services/spot.service";
import {
  addDecimalStrings,
  clampDecimalPlaces,
  formatDecimalString,
  isPositiveDecimal,
  multiplyDecimalByInteger,
  multiplyDecimalStrings,
} from "@/lib/utils/decimal";
import { TrendingUp, TrendingDown, Clock, Activity, FlaskConical } from "lucide-react";

// The expiry options and the payout rate are DR-012/DR-014: the client confirmed
// a payout BAND and a different expiry set, but the per-asset mapping sits on the
// v14 pages that did not render. Until those answers are re-sent, 85% stays a
// placeholder and must not be presented as an approved rate.
const PAYOUT_RATE = "0.85";

// 3m and 15m are not in the client's stated expiry range.
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
  const marketId = pair.replace("-", "").toUpperCase();

  const mode = useAccountStore((s) => s.mode);
  const demoBalance = useAccountStore((s) => s.demoBalance);
  const isDemo = mode === "demo";

  const [series, setSeries] = useState<ChartSeriesPoint[] | undefined>(undefined);
  const [amount, setAmount] = useState("10");
  const [expiration, setExpiration] = useState(EXPIRATION_TIMES[0].value);

  useEffect(() => {
    fetchMarketSeries(marketId).then(setSeries);
  }, [marketId]);

  const hasStake = isPositiveDecimal(amount);
  const potentialProfit = multiplyDecimalStrings(hasStake ? amount : "0", PAYOUT_RATE);
  const payoutTotal = addDecimalStrings(hasStake ? amount : "0", potentialProfit);

  return (
    <div className="flex flex-col gap-4 p-3 sm:p-4 lg:h-[calc(100vh-3.5rem)]">
      {/* REQ-051 verbatim disclaimer — required on all demo views (Sec46 rule #41) */}
      {isDemo && <DemoDisclaimer />}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{pair} <span className="text-sm font-normal text-muted-foreground ml-2">Binary</span></h1>
          {isDemo ? (
            <div className="flex items-center gap-2 px-3 py-1 bg-warning/10 text-warning rounded-full text-sm font-medium border border-warning/30">
              <FlaskConical className="w-4 h-4" />
              {t("common.demo_balance")}
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 bg-success/10 text-success rounded-full text-sm font-medium border border-success/20">
              <Activity className="w-4 h-4" />
              Live
            </div>
          )}
        </div>
        {isDemo && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">{t("demo.balance")}:</span>
            <span className="font-bold text-warning">${formatDecimalString(demoBalance, 2)}</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4 lg:flex-row lg:overflow-hidden">
        {/* Main Chart Area */}
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <Card className="flex-1 bg-card border-border overflow-hidden relative">
             <SampleBadge className="absolute right-4 top-4 z-10" />
             <TradingChart data={series} symbol={pair} />
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
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => {
                    if (/^\d*\.?\d*$/.test(e.target.value)) setAmount(e.target.value);
                  }}
                  aria-invalid={!hasStake}
                  className="pl-7 bg-secondary/30 text-lg font-bold"
                />
              </div>
            </div>

            <div className="p-4 bg-secondary/30 rounded-lg border border-border space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("binary.payout")} ({clampDecimalPlaces(multiplyDecimalByInteger(PAYOUT_RATE, 100), 0)}%)</span>
                <span className="font-semibold">${formatDecimalString(payoutTotal, 2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("binary.profit")}</span>
                <span className="font-bold text-success">+${formatDecimalString(potentialProfit, 2)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-auto pt-2 lg:pt-6">
             <Button disabled={!hasStake} className="h-16 sm:h-20 bg-success hover:bg-success/90 text-success-fg text-lg font-bold flex flex-col gap-1 border-b-4 border-success-focus active:border-b-0 active:translate-y-1 transition-all">
                <TrendingUp className="w-6 h-6" />
                {t("binary.up")}
             </Button>
             <Button disabled={!hasStake} className="h-16 sm:h-20 bg-danger hover:bg-danger/90 text-danger-fg text-lg font-bold flex flex-col gap-1 border-b-4 border-danger-focus active:border-b-0 active:translate-y-1 transition-all">
                <TrendingDown className="w-6 h-6" />
                {t("binary.down")}
             </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
