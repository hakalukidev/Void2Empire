"use client";

import { use, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TradingChart } from "@/components/ui/trading-chart";
import { useLocaleStore } from "@/store/locale-store";
import { isPositiveDecimal, multiplyDecimalStrings } from "@/lib/utils/decimal";
import {
  fetchSpotTicker,
  fetchOrderbook,
  fetchRecentTrades,
  fetchOpenOrders,
  placeSpotOrder,
  cancelSpotOrder,
  type SpotTicker,
  type Orderbook,
  type SpotTrade,
  type SpotOrder,
} from "@/services/spot.service";
import type { OrderSide, OrderType } from "@/types";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils/cn";

const MOCK_CHART_DATA = [
  { time: "2024-01-01", value: 45000 },
  { time: "2024-01-02", value: 46000 },
  { time: "2024-01-03", value: 45500 },
  { time: "2024-01-04", value: 47000 },
  { time: "2024-01-05", value: 48000 },
];

interface PageProps {
  params: Promise<{ pair: string }>;
}

export default function SpotTradePage({ params }: PageProps) {
  const { pair } = use(params);
  const marketId = pair.replace("-", "").toUpperCase();
  const { t } = useLocaleStore();

  const [ticker, setTicker] = useState<SpotTicker | null>(null);
  const [book, setBook] = useState<Orderbook | null>(null);
  const [trades, setTrades] = useState<SpotTrade[]>([]);
  const [orders, setOrders] = useState<SpotOrder[]>([]);

  const [side, setSide] = useState<OrderSide>("buy");
  const [type, setType] = useState<OrderType>("market");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetchSpotTicker(marketId),
      fetchOrderbook(marketId),
      fetchRecentTrades(marketId),
      fetchOpenOrders(),
    ]).then(([nextTicker, nextBook, nextTrades, nextOrders]) => {
      setTicker(nextTicker);
      setBook(nextBook);
      setTrades(nextTrades);
      setOrders(nextOrders);
    });
  }, [marketId]);

  const quantityValid = isPositiveDecimal(quantity);
  const priceValid = type === "market" || isPositiveDecimal(price);
  const canSubmit = quantityValid && priceValid && !submitting;
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
        clientOrderId: `web-${Date.now()}`,
      });
      toast.success(t("spot.order_placed"));
      setQuantity("");
      setPrice("");
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

  const base = marketId.replace("USDT", "");
  const quote = marketId.endsWith("USDT") ? "USDT" : "";

  return (
    <div className="flex h-screen flex-col bg-background pt-16">
      {/* Ticker header */}
      <div className="flex items-center gap-6 border-b border-border bg-card px-4 py-3">
        <h1 className="text-xl font-bold tracking-tight">{ticker?.pair ?? marketId}</h1>
        <div>
          <p className="text-xs text-muted-foreground">{t("spot.price")}</p>
          <p className="font-mono text-lg font-bold">{ticker?.price ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">24h</p>
          <p className={cn("font-mono text-sm font-semibold", ticker?.up ? "text-success" : "text-danger")}>
            {ticker?.changePct ?? "—"}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 lg:flex-row lg:overflow-hidden">
        {/* Order book + recent trades */}
        <div className="flex w-full flex-col gap-4 lg:w-[280px] lg:shrink-0">
          <Card className="border-border bg-card p-4">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
              {t("spot.orderbook")}
            </h2>
            <div className="space-y-0.5 text-xs">
              {book?.asks.slice().reverse().map((l, i) => (
                <Row key={`a${i}`} level={l} side="sell" />
              ))}
              <div className="my-1 border-y border-border py-1 text-center font-mono text-sm font-bold">
                {ticker?.price ?? "—"}
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
                  <span className={tr.side === "buy" ? "text-success" : "text-danger"}>{tr.price}</span>
                  <span className="text-muted-foreground">{tr.amount}</span>
                  <span className="text-muted-foreground">{tr.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Chart */}
        <Card className="min-h-[360px] flex-1 overflow-hidden border-border bg-card">
          <TradingChart data={MOCK_CHART_DATA} />
        </Card>

        {/* Order form */}
        <Card className="flex w-full flex-col gap-4 border-border bg-card p-4 lg:w-[320px] lg:shrink-0">
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
            <Field label={`${t("spot.price")} (${quote})`}>
              <Input type="number" step="any" value={price} onChange={(e) => setPrice(e.target.value)} className="bg-secondary/30" />
            </Field>
          )}

          <Field label={`${t("spot.quantity")} (${base})`}>
            <Input type="number" step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="bg-secondary/30" />
          </Field>

          <div className="flex justify-between rounded-lg border border-border bg-secondary/20 p-3 text-xs">
            <span className="text-muted-foreground">{t("spot.total")}</span>
            <span className="font-mono font-medium text-foreground">
              {total ? `${total} ${quote}` : "—"}
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
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th className="py-2 font-medium">Pair</th>
                <th className="py-2 font-medium">Side</th>
                <th className="py-2 font-medium">Type</th>
                <th className="py-2 font-medium">Qty</th>
                <th className="py-2 font-medium">Price</th>
                <th className="py-2 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="py-2 font-medium">{o.pair}</td>
                  <td className={cn("py-2 capitalize", o.side === "buy" ? "text-success" : "text-danger")}>{o.side}</td>
                  <td className="py-2 capitalize text-muted-foreground">{o.type}</td>
                  <td className="py-2 font-mono">{o.quantity}</td>
                  <td className="py-2 font-mono">{o.price ?? "market"}</td>
                  <td className="py-2 text-right">
                    <Button size="sm" variant="ghost" onClick={() => onCancel(o.id)}>
                      {t("spot.cancel")}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Row({ level, side }: { level: { price: string; amount: string }; side: OrderSide }) {
  return (
    <div className="flex justify-between font-mono">
      <span className={side === "buy" ? "text-success" : "text-danger"}>{level.price}</span>
      <span className="text-muted-foreground">{level.amount}</span>
    </div>
  );
}
