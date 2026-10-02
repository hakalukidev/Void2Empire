"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TradingChart, type ChartPoint } from "@/components/ui/trading-chart";
import { SampleBadge } from "@/components/home/sample-badge";
import { CountdownTimer } from "@/components/p2p/countdown-timer";
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
  clampDecimalPlaces,
  compareDecimalStrings,
  formatDecimalString,
  isPositiveDecimal,
  multiplyDecimalByInteger,
} from "@/lib/utils/decimal";
import { Info, TrendingDown, TrendingUp } from "lucide-react";

// v14 Q6: leverage runs from 5x to 50x (5, 6, 7, 8, 9, 10 … 50). The previous
// 1-100 slider offered a range the client never approved.
const LEVERAGE_MIN = 5;
const LEVERAGE_MAX = 50;
const LEVERAGE_CHIPS = [5, 10, 20, 30, 50];

interface PageProps {
  params: Promise<{ pair: string }>;
}

export default function TradeFuturesPairPage({ params }: PageProps) {
  const { pair } = use(params);
  const { t } = useLocaleStore();

  const marketId = pair.replace("-", "").toUpperCase();
  const displayPair = pair.replace("-", "/").toUpperCase();

  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [leverage, setLeverage] = useState(10);
  const [margin, setMargin] = useState("");
  const [fundingConfig, setFundingConfig] = useState<FundingConfig | null>(null);
  const [side, setSide] = useState<"long" | "short">("long");

  useEffect(() => {
    getFundingConfig(displayPair).then(setFundingConfig);
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

  return (
    <div className="flex flex-col bg-background lg:h-[calc(100vh-3.5rem)] lg:flex-row">
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
              const next = event.target.value;
              if (next === "" || /^\d*\.?\d*$/.test(next)) setMargin(next);
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
          <div>
            <label htmlFor="limit-price" className="mb-1.5 block text-xs font-medium text-muted-foreground">
              {t("futures.limit_price")} (USDT)
            </label>
            <Input
              id="limit-price"
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              className="bg-secondary/30"
            />
          </div>
        )}

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
          disabled={!hasMargin}
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
  );
}
