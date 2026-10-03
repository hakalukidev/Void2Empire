"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DecimalField } from "@/components/ui/decimal-field";
import { TradingChart, type ChartPoint } from "@/components/ui/trading-chart";
import { SampleBadge } from "@/components/home/sample-badge";
import { CountdownTimer } from "@/components/p2p/countdown-timer";
import { ProductUnavailable } from "@/components/trading/product-unavailable";
import { supportsProduct } from "@/config/markets";
import { useLocaleStore } from "@/store/locale-store";
import {
  calculateFeePreview,
  calculateFundingAmount,
  getFundingConfig,
  type FundingConfig,
} from "@/services/futures-fees.service";
import {
  buildCloseSeries,
  formatPrice,
  formatVolume,
  sampleMarkets,
} from "@/config/sample-market-data";
import {
  cancelFuturesOrder,
  fetchFuturesOpenOrders,
  placeFuturesOrder,
  type FuturesOrder,
} from "@/services/futures-positions.service";
import {
  clampDecimalPlaces,
  compareDecimalStrings,
  formatDecimalString,
  groupDecimalString,
  isPositiveDecimal,
  multiplyDecimalByInteger,
} from "@/lib/utils/decimal";
import { parsePair } from "@/lib/utils/pair";
import { Info, TrendingDown, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";

// v14 Q6: leverage runs from 5x to 50x (5, 6, 7, 8, 9, 10 … 50). The previous
// 1-100 slider offered a range the client never approved.
const LEVERAGE_MIN = 5;
const LEVERAGE_MAX = 50;
const LEVERAGE_CHIPS = [5, 10, 20, 30, 50];

/** Keeps a decimal field from accepting anything the parser would choke on. */
function isDecimalText(value: string): boolean {
  return value === "" || /^\d*\.?\d*$/.test(value);
}

/** Stop Loss / Take Profit are optional, so an empty value is acceptable. */
function isOptionalDecimal(value: string): boolean {
  return value === "" || isPositiveDecimal(value);
}

interface PageProps {
  params: Promise<{ pair: string }>;
}

export default function TradeFuturesPairPage({ params }: PageProps) {
  const { pair } = use(params);
  const { t } = useLocaleStore();

  // Markets links, demo tabs and the catalog all spell pairs differently; one
  // normaliser keeps the routing key, the label and the service lookups in step.
  const { symbol: marketId, display: displayPair } = parsePair(pair);

  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [leverage, setLeverage] = useState(10);
  const [margin, setMargin] = useState("");
  const [limitPrice, setLimitPrice] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [orders, setOrders] = useState<FuturesOrder[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [fundingConfig, setFundingConfig] = useState<FundingConfig | null>(null);
  const [side, setSide] = useState<"long" | "short">("long");

  useEffect(() => {
    getFundingConfig(displayPair).then(setFundingConfig);
    fetchFuturesOpenOrders().then(setOrders);
  }, [displayPair]);

  // No futures backend and no price feed yet (DR-023), so the header and chart
  // come from the same illustrative set the home panel uses — never literals
  // typed into this file.
  const market = sampleMarkets.find((row) => row.symbol === marketId);
  const chartData = useMemo<ChartPoint[] | undefined>(
    () => (market ? buildCloseSeries(market) : undefined),
    [market]
  );

  const hasMargin = isPositiveDecimal(margin);
  const fees = calculateFeePreview(hasMargin ? margin : "0", leverage);
  const notional = hasMargin ? fees.notional : "0";

  // v20 Q3: a limit order must carry a price, and Stop Loss / Take Profit have to
  // be supported. Both triggers are optional, so an empty field is valid.
  const hasLimitPrice = orderType === "market" || isPositiveDecimal(limitPrice);
  const triggersValid = isOptionalDecimal(stopLoss) && isOptionalDecimal(takeProfit);
  const canSubmit = hasMargin && hasLimitPrice && triggersValid && !submitting;

  const fundingRatePct = fundingConfig
    ? clampDecimalPlaces(multiplyDecimalByInteger(fundingConfig.fundingRate, 100), 4)
    : "0";
  const isPayingFunding =
    !!fundingConfig &&
    ((side === "long" && fundingConfig.fundingDirection === "long_pays_short") ||
      (side === "short" && fundingConfig.fundingDirection === "short_pays_long"));
  const fundingAmount = fundingConfig
    ? calculateFundingAmount(hasMargin ? margin : "0", fundingConfig.fundingRate)
    : "0";

  const onSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await placeFuturesOrder({
        pair: displayPair,
        side,
        type: orderType,
        margin,
        leverage,
        price: orderType === "limit" ? limitPrice : undefined,
        stopLoss,
        takeProfit,
        clientOrderId: `web-${Date.now()}`,
      });
      toast.success(t("futures.order_placed"));
      setMargin("");
      setLimitPrice("");
      setStopLoss("");
      setTakeProfit("");
      setOrders(await fetchFuturesOpenOrders());
    } catch {
      toast.error(t("futures.order_failed"));
    } finally {
      setSubmitting(false);
    }
  };

  const onCancel = async (id: string) => {
    await cancelFuturesOrder(id);
    setOrders(await fetchFuturesOpenOrders());
    toast.success(t("futures.order_cancelled"));
  };

  if (!supportsProduct(marketId, "futures")) {
    return <ProductUnavailable product="futures" symbol={marketId} pair={displayPair} />;
  }

  return (
    <div className="flex flex-col bg-background lg:h-[calc(100vh-3.5rem)]">
      {/* Three trading columns; the booked-order list sits full-width underneath,
          the same arrangement the spot page uses. */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
      {/* Left: Orderbook placeholder */}
      <div className="order-3 flex min-h-48 w-full shrink-0 flex-col gap-4 overflow-y-auto border-t border-border p-4 lg:order-none lg:min-h-0 lg:w-[260px] lg:border-t-0 lg:border-r">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          {t("spot.orderbook")}
        </h2>
        <div className="flex flex-1 items-center justify-center rounded-md border border-border bg-secondary/20 text-xs text-muted-foreground">
          {t("futures.order_book_pending")}
        </div>
      </div>

      {/* Center: Chart */}
      <div className="flex min-w-0 flex-1 flex-col lg:border-r lg:border-border">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card p-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{displayPair}</h1>
            {market ? (
              <p
                className={`text-sm font-medium ${
                  market.changePercent24h >= 0 ? "text-success" : "text-danger"
                }`}
              >
                {market.changePercent24h >= 0 ? "+" : ""}
                {market.changePercent24h.toFixed(2)}% (24h)
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">{t("futures.no_quote")}</p>
            )}
          </div>
          <div className="flex items-center gap-6 text-sm sm:gap-8">
            <SampleBadge />
            <div className="text-right">
              <p className="text-xs text-muted-foreground">{t("futures.mark_price")}</p>
              <p className="font-mono text-lg font-bold">
                {market ? formatPrice(market.price, market.precision) : "—"}
              </p>
            </div>
            <div className="hidden text-right md:block">
              <p className="text-xs text-muted-foreground">{t("futures.volume_24h")}</p>
              <p className="font-mono font-bold">
                {market ? `$${formatVolume(market.volume24h)}` : "—"}
              </p>
            </div>
          </div>
        </div>
        <div className="flex-1 p-2 sm:p-4">
          <TradingChart data={chartData} symbol={market ? displayPair : undefined} />
        </div>
      </div>

      {/* Right: Order Form */}
      <div className="flex w-full shrink-0 flex-col gap-4 overflow-y-auto border-t border-border bg-card p-4 lg:w-[340px] lg:border-t-0 lg:border-l">
        {/* Side selector */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setSide("long")}
            aria-pressed={side === "long"}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-bold transition-colors ${
              side === "long"
                ? "bg-success text-success-fg"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            <TrendingUp className="h-4 w-4" /> {t("trade.long")}
          </button>
          <button
            type="button"
            onClick={() => setSide("short")}
            aria-pressed={side === "short"}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-bold transition-colors ${
              side === "short"
                ? "bg-danger text-danger-fg"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            <TrendingDown className="h-4 w-4" /> {t("trade.short")}
          </button>
        </div>

        {/* Order Type */}
        <div className="flex gap-1 rounded-lg border border-border bg-secondary/30 p-1">
          {(["market", "limit"] as const).map((typeOption) => (
            <button
              key={typeOption}
              type="button"
              onClick={() => setOrderType(typeOption)}
              aria-pressed={orderType === typeOption}
              className={`flex-1 rounded-md py-1.5 text-xs font-semibold capitalize transition-colors ${
                orderType === typeOption
                  ? "border border-border bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t(`trade.${typeOption}`)}
            </button>
          ))}
        </div>

        {/* Leverage */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="leverage" className="text-xs font-medium text-muted-foreground">
              {t("trade.leverage")}
            </label>
            <span className="rounded border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
              {leverage}x
            </span>
          </div>
          <input
            id="leverage"
            type="range"
            min={LEVERAGE_MIN}
            max={LEVERAGE_MAX}
            value={leverage}
            onChange={(event) => setLeverage(Number(event.target.value))}
            className="w-full accent-primary"
          />
          <div className="mt-1 flex gap-1">
            {LEVERAGE_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setLeverage(chip)}
                aria-pressed={leverage === chip}
                className={`flex-1 rounded border px-1 py-0.5 text-[11px] font-semibold transition-colors ${
                  leverage === chip
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {chip}x
              </button>
            ))}
          </div>
        </div>

        {/* Margin Input */}
        <div>
          <label htmlFor="margin" className="mb-1.5 block text-xs font-medium text-muted-foreground">
            {t("futures.margin")} (USDT)
          </label>
          <Input
            id="margin"
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={margin}
            onChange={(event) => {
              if (isDecimalText(event.target.value)) setMargin(event.target.value);
            }}
            aria-invalid={margin !== "" && !hasMargin}
            className="bg-secondary/30"
          />
          {margin !== "" && !hasMargin && (
            <p className="mt-1 text-xs text-danger">{t("futures.margin_invalid")}</p>
          )}
          {hasMargin && (
            <p className="mt-1 text-xs text-muted-foreground">
              {t("futures.position_size")}:{" "}
              <span className="font-semibold text-foreground">
                {formatDecimalString(notional, 2)} USDT
              </span>
            </p>
          )}
        </div>

        {orderType === "limit" && (
          <DecimalField
            id="limit-price"
            label={`${t("futures.limit_price")} (USDT)`}
            value={limitPrice}
            onChange={setLimitPrice}
            invalidText={t("common.invalid_price")}
          />
        )}

        {/* v20 Q3 requires Stop Loss and Take Profit. Both are optional triggers,
            and the server decides when and how they fire. */}
        <div className="grid grid-cols-2 gap-2">
          <DecimalField
            id="stop-loss"
            label={`${t("common.stop_loss")} (USDT)`}
            value={stopLoss}
            onChange={setStopLoss}
            invalidText={t("common.invalid_price")}
            optional
          />
          <DecimalField
            id="take-profit"
            label={`${t("common.take_profit")} (USDT)`}
            value={takeProfit}
            onChange={setTakeProfit}
            invalidText={t("common.invalid_price")}
            optional
          />
        </div>

        {/* ── Fee Breakdown ────────────────────────────────── */}
        <div className="space-y-2 rounded-lg border border-border bg-secondary/20 p-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Info className="h-3.5 w-3.5" /> {t("futures.fee_breakdown")}
          </p>
          <div className="space-y-1.5 text-xs">
            {[
              { label: t("futures.margin"), value: formatDecimalString(hasMargin ? margin : "0", 2) },
              { label: t("futures.notional"), value: formatDecimalString(notional, 2) },
              {
                label: t("futures.entry_fee"),
                value: formatDecimalString(fees.entryFee, 4),
                color: "text-warning",
              },
              {
                label: t("futures.closing_fee"),
                value: formatDecimalString(fees.closingFee, 4),
                color: "text-warning",
              },
            ].map((row) => (
              <div key={row.label} className="flex justify-between">
                <span className="text-muted-foreground">{row.label}</span>
                <span className={`font-mono font-medium ${row.color ?? "text-foreground"}`}>
                  {hasMargin ? `${row.value} USDT` : "—"}
                </span>
              </div>
            ))}
            <div className="flex justify-between border-t border-border pt-1.5 font-semibold">
              <span className="text-muted-foreground">{t("futures.total_fees")}</span>
              <span
                className={`font-mono ${hasMargin ? "text-danger" : "text-foreground"}`}
              >
                {hasMargin ? `${formatDecimalString(fees.totalFees, 4)} USDT` : "—"}
              </span>
            </div>
            <p className="pt-1 text-[10px] leading-snug text-muted-foreground">
              {t("futures.fee_preview_note")}
            </p>
          </div>
        </div>

        {/* ── Funding Rate Info ─────────────────────────────── */}
        {fundingConfig && (
          <div
            className={`space-y-2 rounded-lg border p-3 ${
              isPayingFunding ? "border-warning/30 bg-warning/5" : "border-success/30 bg-success/5"
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("futures.funding_rate")}
            </p>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("futures.current_rate")}</span>
                <span
                  className={`font-mono font-bold ${isPayingFunding ? "text-warning" : "text-success"}`}
                >
                  {isPayingFunding ? "-" : "+"}
                  {fundingRatePct}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("futures.direction")}</span>
                <span className="font-medium text-foreground">
                  {fundingConfig.fundingDirection === "long_pays_short"
                    ? t("futures.long_pays_short")
                    : t("futures.short_pays_long")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("futures.interval")}</span>
                <span className="font-medium">{fundingConfig.fundingIntervalHours}h</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t("futures.next_settlement")}</span>
                <CountdownTimer
                  expiresAt={fundingConfig.nextSettlementAt}
                  warningThresholdSeconds={1800}
                />
              </div>
              {hasMargin && compareDecimalStrings(fundingAmount, "0") > 0 && (
                <div
                  className={`flex justify-between border-t border-border/50 pt-1.5 font-semibold ${
                    isPayingFunding ? "text-warning" : "text-success"
                  }`}
                >
                  <span>{isPayingFunding ? t("futures.you_pay") : t("futures.you_receive")}</span>
                  <span className="font-mono">
                    {formatDecimalString(fundingAmount, 4)} USDT
                  </span>
                </div>
              )}
              <p className="pt-1 text-[10px] leading-snug text-muted-foreground">
                {t("futures.funding_activated_note")}
              </p>
            </div>
          </div>
        )}

        {/* Submit */}
        <Button
          onClick={onSubmit}
          disabled={!canSubmit}
          className={`w-full py-3 font-bold ${
            side === "long"
              ? "bg-success text-success-fg hover:bg-success/90"
              : "bg-danger text-danger-fg hover:bg-danger/90"
          }`}
        >
          {side === "long" ? t("futures.open_long") : t("futures.open_short")}
          {hasMargin && ` — ${formatDecimalString(notional, 2)} USDT`}
        </Button>

        <p className="text-center text-[10px] text-muted-foreground">
          By placing an order you agree to the{" "}
          <Link href="/risk-disclosure" className="underline hover:text-foreground">
            Risk Disclosure
          </Link>
          .
        </p>
      </div>
      </div>

      {/* Booked orders — v20 Q3 requires the pending order and its price/level to
          stay visible on the trading screen until it fills or is cancelled. */}
      <div className="border-t border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
          {t("futures.pending_orders")}
        </h2>
        {orders.length === 0 ? (
          <p className="py-3 text-center text-sm text-muted-foreground">{t("futures.no_pending_orders")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr>
                  <th className="py-2 font-medium">{t("col.pair")}</th>
                  <th className="py-2 font-medium">{t("futures.direction")}</th>
                  <th className="py-2 font-medium">{t("futures.margin")}</th>
                  <th className="py-2 font-medium">{t("trade.leverage")}</th>
                  <th className="py-2 font-medium">{t("futures.limit_price")}</th>
                  <th className="py-2 font-medium">{t("common.triggers")}</th>
                  <th className="py-2 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className="py-2 font-medium">{o.pair}</td>
                    <td
                      className={`py-2 capitalize ${
                        o.side === "long" ? "text-success" : "text-danger"
                      }`}
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
                    <td className="py-2 text-right">
                      <Button size="sm" variant="ghost" onClick={() => onCancel(o.id)}>
                        {t("common.cancel")}
                      </Button>
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
