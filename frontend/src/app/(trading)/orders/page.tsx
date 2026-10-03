"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocaleStore } from "@/store/locale-store";
import { cn } from "@/lib/utils/cn";
import { groupDecimalString } from "@/lib/utils/decimal";
import {
  cancelSpotOrder,
  fetchOpenOrders,
  type SpotOrder,
} from "@/services/spot.service";
import {
  cancelFuturesOrder,
  fetchFuturesOpenOrders,
  type FuturesOrder,
} from "@/services/futures-positions.service";
import { ClipboardList } from "lucide-react";
import toast from "react-hot-toast";

// Open orders are read from the same services the trading screens write to, so
// this page lists what the user actually booked instead of a detached sample
// table. Both services carry money as decimal STRINGS (Sec46 rule #40).
// Filled and cancelled orders belong to /history — no order history backend
// serves them yet, and neither service keeps them after they leave "open".

export default function OrdersPage() {
  const { t } = useLocaleStore();
  const [spotOrders, setSpotOrders] = useState<SpotOrder[]>([]);
  const [futuresOrders, setFuturesOrders] = useState<FuturesOrder[]>([]);

  const refresh = useCallback(() => {
    fetchOpenOrders().then(setSpotOrders);
    fetchFuturesOpenOrders().then(setFuturesOrders);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const cancelSpot = async (id: string) => {
    await cancelSpotOrder(id);
    refresh();
    toast.success(t("spot.order_cancelled"));
  };

  const cancelFutures = async (id: string) => {
    await cancelFuturesOrder(id);
    refresh();
    toast.success(t("futures.order_cancelled"));
  };

  const hasOpenOrders = spotOrders.length > 0 || futuresOrders.length > 0;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <ClipboardList className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">{t("orders.title")}</h1>
      </div>

      {!hasOpenOrders ? (
        <Card className="p-10 text-center bg-card border-border">
          <p className="text-sm text-muted-foreground">{t("orders.empty")}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            <Link href="/history" className="text-primary hover:underline">
              {t("orders.empty_hint")}
            </Link>
          </p>
        </Card>
      ) : (
        <>
          {spotOrders.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-sm font-semibold text-muted-foreground">{t("orders.section_spot")}</h2>
              <Card className="overflow-hidden bg-card border-border">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-sm text-left">
                    <thead className="bg-secondary/50 text-muted-foreground">
                      <tr>
                        <th className="px-5 py-3 font-medium">{t("orders.col_market")}</th>
                        <th className="px-5 py-3 font-medium">{t("orders.col_side")}</th>
                        <th className="px-5 py-3 font-medium">{t("wallet.type")}</th>
                        <th className="px-5 py-3 font-medium text-right">{t("spot.quantity")}</th>
                        <th className="px-5 py-3 font-medium text-right">{t("orders.col_filled")}</th>
                        <th className="px-5 py-3 font-medium text-right">{t("spot.price")}</th>
                        <th className="px-5 py-3 font-medium">{t("common.triggers")}</th>
                        <th className="px-5 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {spotOrders.map((o) => (
                        <tr key={o.id} className="hover:bg-secondary/20 transition-colors">
                          <td className="px-5 py-3 font-bold">{o.pair}</td>
                          <td className={cn("px-5 py-3 font-semibold", o.side === "buy" ? "text-success" : "text-danger")}>
                            {t(o.side === "buy" ? "spot.buy" : "spot.sell")}
                          </td>
                          <td className="px-5 py-3 text-muted-foreground">{t(o.type === "limit" ? "trade.limit" : "trade.market")}</td>
                          <td className="px-5 py-3 text-right font-mono">{o.quantity}</td>
                          <td className="px-5 py-3 text-right font-mono text-muted-foreground">
                            {o.filled} / {o.quantity}
                          </td>
                          <td className="px-5 py-3 text-right font-mono">
                            {o.price ? groupDecimalString(o.price) : t("trade.market")}
                          </td>
                          <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                            {o.stopLoss || o.takeProfit
                              ? `SL ${o.stopLoss ? groupDecimalString(o.stopLoss) : "—"} / TP ${
                                  o.takeProfit ? groupDecimalString(o.takeProfit) : "—"
                                }`
                              : "—"}
                          </td>
                          <td className="px-5 py-3 text-right">
                            <Button size="sm" variant="ghost" onClick={() => cancelSpot(o.id)}>
                              {t("spot.cancel")}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </section>
          )}

          {futuresOrders.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-sm font-semibold text-muted-foreground">{t("orders.section_futures")}</h2>
              <Card className="overflow-hidden bg-card border-border">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-sm text-left">
                    <thead className="bg-secondary/50 text-muted-foreground">
                      <tr>
                        <th className="px-5 py-3 font-medium">{t("orders.col_market")}</th>
                        <th className="px-5 py-3 font-medium">{t("orders.col_side")}</th>
                        <th className="px-5 py-3 font-medium">{t("wallet.type")}</th>
                        <th className="px-5 py-3 font-medium text-right">{t("futures.margin")}</th>
                        <th className="px-5 py-3 font-medium text-right">{t("trade.leverage")}</th>
                        <th className="px-5 py-3 font-medium text-right">{t("spot.price")}</th>
                        <th className="px-5 py-3 font-medium">{t("common.triggers")}</th>
                        <th className="px-5 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {futuresOrders.map((o) => (
                        <tr key={o.id} className="hover:bg-secondary/20 transition-colors">
                          <td className="px-5 py-3 font-bold">{o.pair}</td>
                          <td className={cn("px-5 py-3 font-semibold", o.side === "long" ? "text-success" : "text-danger")}>
                            {t(o.side === "long" ? "trade.long" : "trade.short")}
                          </td>
                          <td className="px-5 py-3 text-muted-foreground">{t(o.type === "limit" ? "trade.limit" : "trade.market")}</td>
                          <td className="px-5 py-3 text-right font-mono">{groupDecimalString(o.margin)}</td>
                          <td className="px-5 py-3 text-right font-mono">{o.leverage}×</td>
                          <td className="px-5 py-3 text-right font-mono">
                            {o.price ? groupDecimalString(o.price) : t("trade.market")}
                          </td>
                          <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                            {o.stopLoss || o.takeProfit
                              ? `SL ${o.stopLoss ? groupDecimalString(o.stopLoss) : "—"} / TP ${
                                  o.takeProfit ? groupDecimalString(o.takeProfit) : "—"
                                }`
                              : "—"}
                          </td>
                          <td className="px-5 py-3 text-right">
                            <Button size="sm" variant="ghost" onClick={() => cancelFutures(o.id)}>
                              {t("spot.cancel")}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </section>
          )}
        </>
      )}
    </div>
  );
}
