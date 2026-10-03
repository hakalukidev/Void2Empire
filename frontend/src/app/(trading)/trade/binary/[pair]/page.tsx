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
import { CountdownTimer } from "@/components/p2p/countdown-timer";
import { ProductUnavailable } from "@/components/trading/product-unavailable";
import { supportsProduct } from "@/config/markets";
import { fetchMarketSeries, type ChartSeriesPoint } from "@/services/spot.service";
import { parsePair } from "@/lib/utils/pair";
import {
  BINARY_MAX_STAKE,
  BINARY_MIN_STAKE,
  MAX_PAYOUT_RATE,
  MIN_PAYOUT_RATE,
  calculatePayoutRange,
  cancelBinaryTrade,
  fetchBinaryTrades,
  getBinaryExpiries,
  placeBinaryTrade,
  stakeWithinBounds,
  type BinaryDirection,
  type BinaryExpiry,
  type BinaryTrade,
} from "@/services/binary.service";
import { clampDecimalPlaces, formatDecimalString, isPositiveDecimal, multiplyDecimalByInteger } from "@/lib/utils/decimal";
import { cn } from "@/lib/utils/cn";
import toast from "react-hot-toast";
import { Activity, Clock, FlaskConical, Info, TrendingDown, TrendingUp } from "lucide-react";

export default function BinaryTradePage() {
  const { t } = useLocaleStore();
  const params = useParams();
  const rawPair = typeof params.pair === "string" ? params.pair : "BTC-USDT";
  const { symbol: marketId, display: displayPair } = parsePair(rawPair);

  const mode = useAccountStore((s) => s.mode);
  const demoBalance = useAccountStore((s) => s.demoBalance);
  const isDemo = mode === "demo";

  const [series, setSeries] = useState<ChartSeriesPoint[] | undefined>(undefined);
  const [expiries, setExpiries] = useState<BinaryExpiry[]>([]);
  const [expirySeconds, setExpirySeconds] = useState(0);
  const [stake, setStake] = useState("10");
  const [trades, setTrades] = useState<BinaryTrade[]>([]);
  const [rejection, setRejection] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    fetchMarketSeries(marketId).then(setSeries);
  }, [marketId]);

  useEffect(() => {
    getBinaryExpiries().then((list) => {
      setExpiries(list);
      setExpirySeconds(list[0]?.seconds ?? 0);
    });
    fetchBinaryTrades().then(setTrades);
  }, []);

  // The client fixed the stake band at $1–$1,000 (v20 Q13) and the payout as a
  // BAND (80–90%, v20 Step 11). The rate that applies to a given market is the
  // admin's setting and that mapping was never supplied, so the preview shows the
  // whole band instead of inventing one number.
  const withinBounds = stakeWithinBounds(stake);
  const stakeValid = isPositiveDecimal(stake) && withinBounds;
  const payout = stakeValid ? calculatePayoutRange(stake) : null;

  const onPlace = async (direction: BinaryDirection) => {
    if (!stakeValid || placing || expirySeconds === 0) return;
    setPlacing(true);
    try {
      await placeBinaryTrade({ pair: displayPair, direction, stake, expirySeconds });
      setTrades(await fetchBinaryTrades());
      setRejection(null);
      toast.success(t("binary.placed"));
    } catch {
      // The rule text is server-side wording; the screen states the rule instead.
      const message = t("binary.rejected");
      setRejection(message);
      toast.error(message);
    } finally {
      setPlacing(false);
    }
  };

  const onCancel = async (id: string) => {
    await cancelBinaryTrade(id);
    setTrades(await fetchBinaryTrades());
    toast.success(t("binary.cancelled"));
  };

  // v20 Step 7 keeps the brand coins out of Binary, so a Binary screen opened on
  // one of them states that instead of offering a trade no server would accept.
  if (!supportsProduct(marketId, "binary")) {
    return (
      <ProductUnavailable product="binary" symbol={marketId} pair={displayPair} />
    );
  }

  return (
    <div className="flex flex-col bg-background lg:h-[calc(100vh-3.5rem)]">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            {displayPair}
            <span className="ml-2 text-sm font-normal text-muted-foreground">{t("nav.binary")}</span>
          </h1>
          {isDemo ? (
            <div className="flex items-center gap-2 rounded-full border border-warning/30 bg-warning/10 px-3 py-1 text-sm font-medium text-warning">
              <FlaskConical className="h-4 w-4" />
              {t("common.demo_balance")}
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-full border border-success/20 bg-success/10 px-3 py-1 text-sm font-medium text-success">
              <Activity className="h-4 w-4" />
              {t("common.live_balance")}
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

      {/* REQ-051 verbatim disclaimer — required on all demo views (Sec46 rule #41) */}
      {isDemo && (
        <div className="px-4 pt-3">
          <DemoDisclaimer />
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col gap-4 p-3 sm:p-4 lg:flex-row lg:overflow-hidden">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <Card className="relative flex-1 overflow-hidden border-border bg-card">
            <SampleBadge className="absolute right-4 top-4 z-10" />
            <TradingChart data={series} symbol={displayPair} />
          </Card>

          {/* Settling and settled trades. Win/loss is decided at expiry by the
              server: expiry price above or below entry, by direction, and an
              equal price returns the stake in full (v20 Q12). */}
          <Card className="border-border bg-card p-4">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
              {t("binary.my_trades")}
            </h2>
            {trades.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">{t("binary.no_trades")}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="text-xs text-muted-foreground">
                    <tr>
                      <th className="py-2 font-medium">{t("col.pair")}</th>
                      <th className="py-2 font-medium">{t("futures.direction")}</th>
                      <th className="py-2 font-medium">{t("binary.stake")}</th>
                      <th className="py-2 font-medium">{t("binary.expiration")}</th>
                      <th className="py-2 font-medium">{t("binary.settles_in")}</th>
                      <th className="py-2 font-medium">{t("demo.status")}</th>
                      <th className="py-2 font-medium" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {trades.map((trade) => (
                      <tr key={trade.id}>
                        <td className="py-2 font-medium">{trade.pair}</td>
                        <td
                          className={cn(
                            "py-2",
                            trade.direction === "up" ? "text-success" : "text-danger"
                          )}
                        >
                          {trade.direction === "up" ? t("binary.up") : t("binary.down")}
                        </td>
                        <td className="py-2 font-mono">${formatDecimalString(trade.stake, 2)}</td>
                        <td className="py-2 font-mono">
                          {expiries.find((e) => e.seconds === trade.expirySeconds)?.label ??
                            `${trade.expirySeconds}s`}
                        </td>
                        <td className="py-2">
                          {trade.status === "open" ? (
                            <CountdownTimer expiresAt={trade.settlesAt} warningThresholdSeconds={5} />
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-2 text-xs uppercase tracking-wide text-muted-foreground">
                          {t(`binary.status_${trade.status}`)}
                        </td>
                        <td className="py-2 text-right">
                          {trade.status === "open" && (
                            <Button size="sm" variant="ghost" onClick={() => onCancel(trade.id)}>
                              {t("common.cancel")}
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Order Entry Sidebar */}
        <Card className="flex w-full shrink-0 flex-col gap-6 overflow-y-auto border-border bg-card p-4 lg:w-80">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Clock className="h-4 w-4" />
                {t("binary.expiration")}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {expiries.map((time) => (
                  <button
                    key={time.seconds}
                    onClick={() => setExpirySeconds(time.seconds)}
                    className={cn(
                      "rounded-md border p-2 text-sm font-medium transition-colors",
                      expirySeconds === time.seconds
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground hover:bg-secondary/50"
                    )}
                  >
                    {time.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="binary-stake" className="text-sm font-medium text-muted-foreground">
                {t("binary.amount")}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="binary-stake"
                  type="text"
                  inputMode="decimal"
                  value={stake}
                  onChange={(e) => {
                    if (/^\d*\.?\d*$/.test(e.target.value)) setStake(e.target.value);
                  }}
                  aria-invalid={!stakeValid}
                  className="bg-secondary/30 pl-7 text-lg font-bold"
                />
              </div>
              {!stakeValid && stake !== "" && (
                <p className="text-xs text-danger">{t("binary.stake_bounds_error")}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {t("binary.min_max_stake")}: ${formatDecimalString(BINARY_MIN_STAKE, 0)} – $
                {formatDecimalString(BINARY_MAX_STAKE, 0)}
              </p>
            </div>

            <div className="space-y-2 rounded-lg border border-border bg-secondary/30 p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t("binary.payout")} (
                  {clampDecimalPlaces(multiplyDecimalByInteger(MIN_PAYOUT_RATE, 100), 0)}–
                  {clampDecimalPlaces(multiplyDecimalByInteger(MAX_PAYOUT_RATE, 100), 0)}%)
                </span>
                <span className="font-semibold">
                  {payout ? `$${formatDecimalString(payout.payoutLow, 2)}–$${formatDecimalString(payout.payoutHigh, 2)}` : "—"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("binary.profit")}</span>
                <span className="font-bold text-success">
                  {payout
                    ? `+$${formatDecimalString(payout.profitLow, 2)}–+$${formatDecimalString(payout.profitHigh, 2)}`
                    : "—"}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-muted-foreground">{t("binary.payout_band_note")}</p>
            </div>

            {rejection && (
              <p className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-xs text-danger">
                {rejection}
              </p>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Button
                disabled={!stakeValid || placing}
                onClick={() => onPlace("up")}
                className="flex h-16 flex-col gap-1 border-b-4 border-success-focus bg-success text-lg font-bold text-success-fg transition-all hover:bg-success/90 active:translate-y-1 active:border-b-0 sm:h-20"
              >
                <TrendingUp className="h-6 w-6" />
                {t("binary.up")}
              </Button>
              <Button
                disabled={!stakeValid || placing}
                onClick={() => onPlace("down")}
                className="flex h-16 flex-col gap-1 border-b-4 border-danger-focus bg-danger text-lg font-bold text-danger-fg transition-all hover:bg-danger/90 active:translate-y-1 active:border-b-0 sm:h-20"
              >
                <TrendingDown className="h-6 w-6" />
                {t("binary.down")}
              </Button>
            </div>

            <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {t("binary.rules_note")}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
