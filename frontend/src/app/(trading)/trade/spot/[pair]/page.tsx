"use client";

import { use, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DecimalField } from "@/components/ui/decimal-field";
import { TradingChart } from "@/components/ui/trading-chart";
import { SampleBadge } from "@/components/home/sample-badge";
import { ProductUnavailable } from "@/components/trading/product-unavailable";
import { supportsProduct } from "@/config/markets";
import { useLocaleStore } from "@/store/locale-store";
import { groupDecimalString, isPositiveDecimal, multiplyDecimalStrings } from "@/lib/utils/decimal";
import { parsePair } from "@/lib/utils/pair";
import {
  fetchSpotTicker,
  fetchMarketSeries,
  fetchOrderbook,
  fetchRecentTrades,
  fetchOpenOrders,
  placeSpotOrder,
  cancelSpotOrder,
  type ChartSeriesPoint,
  type SpotTicker,
  type Orderbook,
  type SpotTrade,
  type SpotOrder,
} from "@/services/spot.service";
import type { OrderSide, OrderType } from "@/types";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils/cn";

interface PageProps {
  params: Promise<{ pair: string }>;
}

export default function SpotTradePage({ params }: PageProps) {
  const { pair } = use(params);
  const { symbol: marketId, display: displayPair, base, quote } = parsePair(pair);
  const { t } = useLocaleStore();

  const [ticker, setTicker] = useState<SpotTicker | null>(null);
  const [series, setSeries] = useState<ChartSeriesPoint[] | undefined>(undefined);
  const [book, setBook] = useState<Orderbook | null>(null);
  const [trades, setTrades] = useState<SpotTrade[]>([]);
  const [orders, setOrders] = useState<SpotOrder[]>([]);

  const [side, setSide] = useState<OrderSide>("buy");
  const [type, setType] = useState<OrderType>("market");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetchSpotTicker(marketId),
      fetchMarketSeries(marketId),
      fetchOrderbook(marketId),
      fetchRecentTrades(marketId),
      fetchOpenOrders(),
    ]).then(([nextTicker, nextSeries, nextBook, nextTrades, nextOrders]) => {
      setTicker(nextTicker);
      setSeries(nextSeries);
      setBook(nextBook);
      setTrades(nextTrades);
      setOrders(nextOrders);
    });
  }, [marketId]);

  const quantityValid = isPositiveDecimal(quantity);
  const priceValid = type === "market" || isPositiveDecimal(price);
  // v20 Step 5 Q3: Stop Loss / Take Profit must be supported and are both optional,
  // so an empty field is valid. The server decides when a trigger fires.
  const optionalValid = (v: string) => v === "" || isPositiveDecimal(v);
  const triggersValid = optionalValid(stopLoss) && optionalValid(takeProfit);
  const canSubmit = quantityValid && priceValid && triggersValid && !submitting;
  const total = type === "limit" && quantityValid && priceValid ? multiplyDecimalStrings(price, quantity) : null;

  const onSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await placeSpotOrder({
        pair: ticker?.pair ?? marketId,
        side,
        type,
        quantity,
        price: type === "limit" ? price : undefined,
        stopLoss,
        takeProfit,
        clientOrderId: `web-${Date.now()}`,
      });
      toast.success(t("spot.order_placed"));
      setQuantity("");
      setPrice("");
      setStopLoss("");
      setTakeProfit("");
      setOrders(await fetchOpenOrders());
    } catch {
      toast.error(t("spot.invalid_quantity"));
    } finally {
      setSubmitting(false);
    }
  };

  const onCancel = async (id: string) => {
    await cancelSpotOrder(id);
    setOrders(await fetchOpenOrders());
    toast.success(t("spot.order_cancelled"));
  };

  // A market the catalog gives no spot rail to is not a spot market, whatever the
  // URL says — v20 Step 9 lists VUSDT as a Funding asset only.
  if (!supportsProduct(marketId, "spot")) {
    return <ProductUnavailable product="spot" symbol={marketId} pair={displayPair} />;
  }

  return (
    <div className="flex flex-col bg-background lg:h-[calc(100vh-3.5rem)]">
      {/* Ticker header */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-border bg-card px-4 py-3">
        <h1 className="text-xl font-bold tracking-tight">{ticker?.pair ?? marketId}</h1>
        <div>
          <p className="text-xs text-muted-foreground">{t("spot.price")}</p>
          <p className="font-mono text-lg font-bold">{ticker ? groupDecimalString(ticker.price) : "—"}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">24h</p>
          <p className={cn("font-mono text-sm font-semibold", ticker?.up ? "text-success" : "text-danger")}>
            {ticker?.changePct ?? "—"}
          </p>
        </div>
        {/* No feed yet (DR-023): price, change, depth, trade prints and the chart
            below all come from the illustrative sample set. */}
        <SampleBadge className="ml-auto" />
      </div>

      <div className="flex flex-1 flex-col gap-4 p-3 sm:p-4 lg:flex-row lg:overflow-hidden">
        {/* Order book + recent trades */}
        <div className="order-3 grid w-full gap-4 sm:grid-cols-2 lg:order-none lg:flex lg:w-[280px] lg:shrink-0 lg:flex-col lg:overflow-y-auto">
          <Card className="border-border bg-card p-4">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
              {t("spot.orderbook")}
            </h2>
            <div className="space-y-0.5 text-xs">
              {book?.asks.slice().reverse().map((l, i) => (
                <Row key={`a${i}`} level={l} side="sell" />
              ))}
              <div className="my-1 border-y border-border py-1 text-center font-mono text-sm font-bold">
                {ticker ? groupDecimalString(ticker.price) : "—"}
              </div>
              {book?.bids.map((l, i) => <Row key={`b${i}`} level={l} side="buy" />)}
            </div>
          </Card>

          <Card className="border-border bg-card p-4">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
              {t("spot.recent_trades")}
            </h2>
            <div className="space-y-1 text-xs">
              {trades.map((tr) => (
                <div key={tr.id} className="flex justify-between font-mono">
                  <span className={tr.side === "buy" ? "text-success" : "text-danger"}>{groupDecimalString(tr.price)}</span>
                  <span className="text-muted-foreground">{tr.amount}</span>
                  <span className="text-muted-foreground">{tr.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Chart */}
        <Card className="min-w-0 flex-1 overflow-hidden border-border bg-card">
          <TradingChart data={series} symbol={ticker?.pair ?? marketId} />
        </Card>

        {/* Order form */}
        <Card className="flex w-full flex-col gap-4 border-border bg-card p-4 lg:w-[320px] lg:shrink-0 lg:overflow-y-auto">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setSide("buy")}
              className={cn(
                "py-2 rounded-md text-sm font-bold border transition-all",
                side === "buy"
                  ? "bg-success text-success-fg border-success"
                  : "bg-success/5 text-success border-success/30 hover:bg-success/10"
              )}
            >
              {t("spot.buy")}
            </button>
            <button
              onClick={() => setSide("sell")}
              className={cn(
                "py-2 rounded-md text-sm font-bold border transition-all",
                side === "sell"
                  ? "bg-danger text-danger-fg border-danger"
                  : "bg-danger/5 text-danger border-danger/30 hover:bg-danger/10"
              )}
            >
              {t("spot.sell")}
            </button>
          </div>

          <div className="flex gap-1 rounded-md border border-border bg-secondary/30 p-1">
            {(["market", "limit"] as const).map((ot) => (
              <button
                key={ot}
                onClick={() => setType(ot)}
                className={cn(
                  "flex-1 rounded py-1.5 text-xs font-medium capitalize transition-colors",
                  type === ot ? "border border-border bg-card text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t(`trade.${ot}`)}
              </button>
            ))}
          </div>

          {type === "limit" && (
            <DecimalField
              id="spot-price"
              label={`${t("spot.price")} (${quote})`}
              value={price}
              onChange={setPrice}
              invalidText={t("spot.limit_price_required")}
            />
          )}

          <DecimalField
            id="spot-quantity"
            label={`${t("spot.quantity")} (${base})`}
            value={quantity}
            onChange={setQuantity}
            invalidText={t("spot.invalid_quantity")}
          />

          <div className="grid grid-cols-2 gap-2">
            <DecimalField
              id="spot-stop-loss"
              label={`${t("common.stop_loss")} (${quote})`}
              value={stopLoss}
              onChange={setStopLoss}
              invalidText={t("common.invalid_price")}
              optional
            />
            <DecimalField
              id="spot-take-profit"
              label={`${t("common.take_profit")} (${quote})`}
              value={takeProfit}
              onChange={setTakeProfit}
              invalidText={t("common.invalid_price")}
              optional
            />
          </div>

          <div className="flex justify-between rounded-lg border border-border bg-secondary/20 p-3 text-xs">
            <span className="text-muted-foreground">{t("spot.total")}</span>
            <span className="font-mono font-medium text-foreground">
              {total ? `${groupDecimalString(total)} ${quote}` : "—"}
            </span>
          </div>

          <Button
            onClick={onSubmit}
            disabled={!canSubmit}
            className={cn("h-12 w-full font-bold", side === "buy" ? "bg-success text-success-fg hover:bg-success/90" : "bg-danger text-danger-fg hover:bg-danger/90")}
          >
            {t("spot.place_order")}
          </Button>
        </Card>
      </div>

      {/* Open orders */}
      <div className="border-t border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
          {t("spot.open_orders")}
        </h2>
        {orders.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">{t("spot.no_open_orders")}</p>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th className="py-2 font-medium">{t("col.pair")}</th>
                <th className="py-2 font-medium">{t("col.side")}</th>
                <th className="py-2 font-medium">{t("col.type")}</th>
                <th className="py-2 font-medium">{t("col.qty")}</th>
                <th className="py-2 font-medium">{t("spot.price")}</th>
                <th className="py-2 font-medium">{t("common.triggers")}</th>
                <th className="py-2 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="py-2 font-medium">{o.pair}</td>
                  <td className={cn("py-2", o.side === "buy" ? "text-success" : "text-danger")}>
                    {t(`spot.${o.side}`)}
                  </td>
                  <td className="py-2 text-muted-foreground">{t(`trade.${o.type}`)}</td>
                  <td className="py-2 font-mono">{o.quantity}</td>
                  <td className="py-2 font-mono">{o.price ? groupDecimalString(o.price) : t("trade.market")}</td>
                  <td className="py-2 font-mono text-xs text-muted-foreground">
                    {o.stopLoss || o.takeProfit
                      ? `SL ${o.stopLoss ? groupDecimalString(o.stopLoss) : "—"} / TP ${
                          o.takeProfit ? groupDecimalString(o.takeProfit) : "—"
                        }`
                      : "—"}
                  </td>
                  <td className="py-2 text-right">
                    <Button size="sm" variant="ghost" onClick={() => onCancel(o.id)}>
                      {t("spot.cancel")}
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

function Row({ level, side }: { level: { price: string; amount: string }; side: OrderSide }) {
  return (
    <div className="flex justify-between font-mono">
      <span className={side === "buy" ? "text-success" : "text-danger"}>{groupDecimalString(level.price)}</span>
      <span className="text-muted-foreground">{level.amount}</span>
    </div>
  );
}
