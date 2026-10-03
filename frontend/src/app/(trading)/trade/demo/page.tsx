"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DecimalField } from "@/components/ui/decimal-field";
import { TradingChart, type ChartPoint } from "@/components/ui/trading-chart";
import { SampleBadge } from "@/components/home/sample-badge";
import { DemoDisclaimer } from "@/components/ui/demo-disclaimer";
import { useLocaleStore } from "@/store/locale-store";
import { useAccountStore } from "@/store/account-store";
import {
  buildCloseSeries,
  sampleMarkets,
  type SampleMarket,
} from "@/config/sample-market-data";
import { calculateFeePreview, calculateNotional } from "@/services/futures-fees.service";
import {
  cancelDemoOrder,
  clearDemoOrders,
  fetchDemoOrders,
  placeDemoOrder,
  type DemoOrder,
} from "@/services/demo.service";
import {
  formatDecimalString,
  groupDecimalString,
  isPositiveDecimal,
} from "@/lib/utils/decimal";
import { cn } from "@/lib/utils/cn";
import toast from "react-hot-toast";
import { FlaskConical, Info, TrendingDown, TrendingUp } from "lucide-react";

// Demo mirrors the live futures rails, so it carries the same confirmed leverage
// band (v20 Step 6: 5x minimum, 50x maximum, any value between) and the same fee
// model — one code path, not a second set of numbers.
const LEVERAGE_MIN = 5;
const LEVERAGE_MAX = 50;
const LEVERAGE_CHIPS = [5, 10, 20, 30, 50];

// Q43: demo and real trading run off the same price feed. Until DR-023 gives the
// app a feed, both screens read the same illustrative set, so the demo tab list
// comes from it too rather than a list typed into this file.
const DEMO_MARKETS: SampleMarket[] = sampleMarkets.filter((m) =>
  m.symbol.endsWith("USDT")
);

export default function TradeDemoPage() {
  const { t } = useLocaleStore();
  // One source for the virtual balance: the account store also feeds the binary
  // page's demo header, so the two can never drift apart.
  const demoBalance = useAccountStore((s) => s.demoBalance);
  const resetDemoBalance = useAccountStore((s) => s.resetDemoBalance);

  const [symbol, setSymbol] = useState(DEMO_MARKETS[0]?.symbol ?? "");
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [side, setSide] = useState<"long" | "short">("long");
  const [leverage, setLeverage] = useState(10);
  const [margin, setMargin] = useState("");
  const [limitPrice, setLimitPrice] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [orders, setOrders] = useState<DemoOrder[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDemoOrders().then(setOrders);
  }, []);

  const market = DEMO_MARKETS.find((m) => m.symbol === symbol);
  const chartData = useMemo<ChartPoint[] | undefined>(
    () => (market ? buildCloseSeries(market) : undefined),
    [market]
  );
  const displayPair = market?.pair ?? "";

  const hasMargin = isPositiveDecimal(margin);
  const hasLimitPrice = orderType === "market" || isPositiveDecimal(limitPrice);
  const optionalValid = (v: string) => v === "" || isPositiveDecimal(v);
  const triggersValid = optionalValid(stopLoss) && optionalValid(takeProfit);
  const canSubmit = hasMargin && hasLimitPrice && triggersValid && !submitting;

  // Same preview the live futures screen shows: notional = margin x leverage and
  // 0.1% of that on each side (v14 Q10/Q21, unchanged in v20).
  const notional = hasMargin ? calculateNotional(margin, leverage) : "0";
  const fees = calculateFeePreview(hasMargin ? margin : "0", leverage);

  const onSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await placeDemoOrder({
        pair: displayPair,
        side,
        type: orderType,
        margin,
        leverage,
        price: orderType === "limit" ? limitPrice : undefined,
        stopLoss,
        takeProfit,
      });
      toast.success(t("demo.order_placed"));
      setMargin("");
      setLimitPrice("");
      setStopLoss("");
      setTakeProfit("");
      setOrders(await fetchDemoOrders());
    } finally {
      setSubmitting(false);
    }
  };

  const onCancel = async (id: string) => {
    await cancelDemoOrder(id);
    setOrders(await fetchDemoOrders());
    toast.success(t("futures.order_cancelled"));
  };

  const onReset = async () => {
    // Q43 lets the user reset their own demo account. The demo ledger is
    // server-side, so this clears the sandbox's booked orders and restores the
    // confirmed starting figure; it never touches a real balance.
    await clearDemoOrders();
    resetDemoBalance();
    setOrders(await fetchDemoOrders());
    toast.success(t("demo.reset_done"));
  };

  return (
    <div className="flex flex-col bg-background lg:h-[calc(100vh-3.5rem)]">
      <div className="flex flex-col gap-4 p-3 sm:p-4">
        {/* REQ-051 verbatim disclaimer — must be preserved exactly on all demo views */}
        <DemoDisclaimer />

        {/* Demo Mode Banner */}
        <div className="flex flex-col items-start gap-3 rounded-lg border border-warning/30 bg-warning/10 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-warning">
            <FlaskConical className="h-4 w-4 shrink-0" />
            {t("demo.mode_banner")}
          </div>
          <Link href={`/trade/futures/${symbol}`}>
            <Button size="sm" variant="primary" className="shrink-0 text-xs">
              {t("demo.switch_live")}
            </Button>
          </Link>
        </div>

        {/* Demo Balance Bar */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border border-border bg-card px-4 py-2 text-sm">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-warning" />
            <span className="text-muted-foreground">{t("demo.balance")}:</span>
            <span className="font-bold text-warning">${formatDecimalString(demoBalance, 2)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">{t("demo.unrealized_pnl")}:</span>
            {/* Mark price, PnL and liquidation are derived server-side (REQ-049
                simulates liquidation in the demo ledger) — never computed here. */}
            <span className="font-bold text-muted-foreground">—</span>
          </div>
          <Button size="sm" variant="secondary" className="ml-auto text-xs" onClick={onReset}>
            {t("demo.reset")}
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 px-3 pb-3 sm:px-4 lg:flex-row lg:overflow-hidden">
        {/* Pair Selector + Chart */}
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {DEMO_MARKETS.map((m) => (
                <button
                  key={m.symbol}
                  onClick={() => setSymbol(m.symbol)}
                  className={cn(
                    "shrink-0 whitespace-nowrap rounded-lg border px-4 py-1.5 text-sm font-medium transition-colors",
                    symbol === m.symbol
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground hover:bg-secondary/50"
                  )}
                >
                  {m.pair}
                </button>
              ))}
            </div>
            {/* No price feed yet (DR-023): the chart shares the illustrative set
                with the live screens, exactly as Q43 says demo mirrors real prices. */}
            <SampleBadge className="ml-auto" />
          </div>
          <Card className="flex-1 overflow-hidden border-border bg-card">
            <TradingChart data={chartData} symbol={displayPair} />
          </Card>
        </div>

        {/* Order Panel */}
        <Card className="flex w-full shrink-0 flex-col gap-4 overflow-y-auto border-border bg-card p-4 lg:w-72">
          <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {t("demo.same_rules_note")}
          </p>

          {/* Order Type */}
          <div className="flex gap-1 rounded-md border border-border bg-secondary/30 p-1">
            {(["market", "limit"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setOrderType(type)}
                className={cn(
                  "flex-1 rounded py-1.5 text-xs font-medium transition-colors",
                  orderType === type
                    ? "border border-border bg-card text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t(`trade.${type}`)}
              </button>
            ))}
          </div>

          {/* Long / Short */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setSide("long")}
              className={cn(
                "rounded-md border py-2 text-sm font-bold transition-all",
                side === "long"
                  ? "border-success bg-success text-success-fg shadow-[0_0_12px_rgba(34,197,94,0.3)]"
                  : "border-success/30 bg-success/5 text-success hover:bg-success/10"
              )}
            >
              {t("trade.long")}
            </button>
            <button
              onClick={() => setSide("short")}
              className={cn(
                "rounded-md border py-2 text-sm font-bold transition-all",
                side === "short"
                  ? "border-danger bg-danger text-danger-fg shadow-[0_0_12px_rgba(239,68,68,0.3)]"
                  : "border-danger/30 bg-danger/5 text-danger hover:bg-danger/10"
              )}
            >
              {t("trade.short")}
            </button>
          </div>

          {/* Leverage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="demo-leverage" className="text-xs font-medium text-muted-foreground">
                {t("trade.leverage")}
              </label>
              <span className="text-sm font-bold text-primary">{leverage}x</span>
            </div>
            <input
              id="demo-leverage"
              type="range"
              min={LEVERAGE_MIN}
              max={LEVERAGE_MAX}
              value={leverage}
              onChange={(e) => setLeverage(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="grid grid-cols-5 gap-1">
              {LEVERAGE_CHIPS.map((lev) => (
                <button
                  key={lev}
                  onClick={() => setLeverage(lev)}
                  className={cn(
                    "rounded border py-1 text-xs transition-colors",
                    leverage === lev
                      ? "border-primary text-primary bg-primary/10"
                      : "border-border text-muted-foreground hover:bg-secondary/50"
                  )}
                >
                  {lev}x
                </button>
              ))}
            </div>
          </div>

          {/* Margin */}
          <DecimalField
            id="demo-margin"
            label={`${t("futures.margin")} (USDT)`}
            value={margin}
            onChange={setMargin}
            invalidText={t("futures.margin_invalid")}
          />

          {orderType === "limit" && (
            <DecimalField
              id="demo-limit-price"
              label={`${t("futures.limit_price")} (USDT)`}
              value={limitPrice}
              onChange={setLimitPrice}
              invalidText={t("common.invalid_price")}
            />
          )}

          <div className="grid grid-cols-2 gap-2">
            <DecimalField
              id="demo-stop-loss"
              label={`${t("common.stop_loss")} (USDT)`}
              value={stopLoss}
              onChange={setStopLoss}
              invalidText={t("common.invalid_price")}
              optional
            />
            <DecimalField
              id="demo-take-profit"
              label={`${t("common.take_profit")} (USDT)`}
              value={takeProfit}
              onChange={setTakeProfit}
              invalidText={t("common.invalid_price")}
              optional
            />
          </div>

          {/* Fee preview — shares calculateFeePreview with the live screen. */}
          <div className="space-y-2 rounded-lg border border-border bg-secondary/20 p-3 text-xs">
            <p className="font-semibold uppercase tracking-wide text-muted-foreground">
              {t("futures.fee_breakdown")}
            </p>
            <Row label={t("futures.margin")} value={`${formatDecimalString(hasMargin ? margin : "0", 2)} USDT`} />
            <Row label={t("futures.notional")} value={`${formatDecimalString(notional, 2)} USDT`} />
            <Row label={t("futures.entry_fee")} value={`${formatDecimalString(fees.entryFee, 4)} USDT`} />
            <Row label={t("futures.closing_fee")} value={`${formatDecimalString(fees.closingFee, 4)} USDT`} />
            <p className="pt-1 leading-relaxed text-muted-foreground">{t("futures.fee_preview_note")}</p>
          </div>

          {/* Submit */}
          <Button
            onClick={onSubmit}
            disabled={!canSubmit}
            className={cn(
              "mt-auto h-12 w-full text-sm font-bold",
              side === "long"
                ? "bg-success text-success-fg hover:bg-success/90"
                : "bg-danger text-danger-fg hover:bg-danger/90"
            )}
          >
            {side === "long" ? (
              <TrendingUp className="mr-2 h-4 w-4" />
            ) : (
              <TrendingDown className="mr-2 h-4 w-4" />
            )}
            {side === "long" ? t("demo.open_long") : t("demo.open_short")}
          </Button>
        </Card>
      </div>

      {/* Booked and filled demo orders (v20 Q3 keeps a booked order on screen). */}
      <div className="border-t border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
          {t("demo.orders_title")}
        </h2>
        {orders.length === 0 ? (
          <p className="py-3 text-center text-sm text-muted-foreground">{t("demo.no_orders")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr>
                  <th className="py-2 font-medium">{t("col.pair")}</th>
                  <th className="py-2 font-medium">{t("futures.direction")}</th>
                  <th className="py-2 font-medium">{t("futures.margin")}</th>
                  <th className="py-2 font-medium">{t("trade.leverage")}</th>
                  <th className="py-2 font-medium">{t("futures.limit_price")}</th>
                  <th className="py-2 font-medium">{t("common.triggers")}</th>
                  <th className="py-2 font-medium">{t("demo.status")}</th>
                  <th className="py-2 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className="py-2 font-medium">{o.pair}</td>
                    <td
                      className={cn(
                        "py-2 capitalize",
                        o.side === "long" ? "text-success" : "text-danger"
                      )}
                    >
                      {o.side === "long" ? t("trade.long") : t("trade.short")}
                    </td>
                    <td className="py-2 font-mono">{formatDecimalString(o.margin, 2)}</td>
                    <td className="py-2 font-mono">{o.leverage}x</td>
                    <td className="py-2 font-mono">{o.price ? groupDecimalString(o.price) : "—"}</td>
                    <td className="py-2 font-mono text-xs text-muted-foreground">
                      {o.stopLoss || o.takeProfit
                        ? `SL ${o.stopLoss ? groupDecimalString(o.stopLoss) : "—"} / TP ${
                            o.takeProfit ? groupDecimalString(o.takeProfit) : "—"
                          }`
                        : "—"}
                    </td>
                    <td className="py-2 text-xs uppercase tracking-wide text-muted-foreground">
                      {t(`demo.status_${o.status}`)}
                    </td>
                    <td className="py-2 text-right">
                      {o.status === "open" && (
                        <Button size="sm" variant="ghost" onClick={() => onCancel(o.id)}>
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
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-muted-foreground">
      <span>{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
