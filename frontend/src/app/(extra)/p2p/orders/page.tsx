"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { getMyOrders, P2POrder, OrderStatus } from "@/services/p2p.service";
import { AgentBadgeDisplay } from "@/components/p2p/agent-badge";
import { formatDecimalString } from "@/lib/utils/decimal";
import { useLocaleStore } from "@/store/locale-store";
import { ClipboardList } from "lucide-react";

const STATUS_STYLE: Record<OrderStatus, string> = {
  pending:   "bg-warning/10 text-warning border-warning/20",
  paid:      "bg-primary/10 text-primary border-primary/20",
  released:  "bg-success/10 text-success border-success/20",
  completed: "bg-success/10 text-success border-success/20",
  cancelled: "bg-secondary/50 text-muted-foreground border-border",
  disputed:  "bg-danger/10 text-danger border-danger/20",
};

const CURRENT_USER_ID = "u1";

type FilterTab = "all" | "buying" | "selling" | "disputed";

// The filter tab id doubles as the label key suffix.
const FILTER_TABS: { id: FilterTab; labelKey: string }[] = [
  { id: "all", labelKey: "p2p.filter_all" },
  { id: "buying", labelKey: "p2p.filter_buying" },
  { id: "selling", labelKey: "p2p.filter_selling" },
  { id: "disputed", labelKey: "p2p.filter_disputed" },
];

export default function MyP2POrdersPage() {
  const { t } = useLocaleStore();
  const [orders, setOrders] = useState<P2POrder[]>([]);
  const [tab, setTab] = useState<FilterTab>("all");

  useEffect(() => { getMyOrders().then(setOrders); }, []);

  const filtered = orders.filter(o => {
    if (tab === "all") return true;
    if (tab === "buying") return o.buyerId === CURRENT_USER_ID;
    if (tab === "selling") return o.sellerId === CURRENT_USER_ID;
    if (tab === "disputed") return o.status === "disputed";
    return true;
  });

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1100px] mx-auto">
      <div className="flex items-center gap-3">
        <ClipboardList className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("p2p.orders_title")}</h1>
          {/* Orders are not served by the API yet, so these rows are layout samples. */}
          <p className="mt-0.5 text-xs text-muted-foreground">{t("p2p.orders_sample_note")}</p>
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-secondary/30 border border-border rounded-lg w-fit flex-wrap">
        {FILTER_TABS.map(tabItem => (
          <button key={tabItem.id} onClick={() => setTab(tabItem.id)}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${tab === tabItem.id ? "bg-card text-foreground border border-border shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            {t(tabItem.labelKey)}
          </button>
        ))}
      </div>

      <Card className="overflow-hidden bg-card border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground">
              <tr>
                <th className="px-5 py-4 font-medium">{t("history.col_order_id")}</th>
                <th className="px-5 py-4 font-medium">{t("p2p.col_counterparty")}</th>
                <th className="px-5 py-4 font-medium">{t("col.type")}</th>
                <th className="px-5 py-4 font-medium">{t("history.col_amount")}</th>
                <th className="px-5 py-4 font-medium hidden md:table-cell">{t("history.col_rate")}</th>
                <th className="px-5 py-4 font-medium hidden md:table-cell">{t("p2p.col_total")}</th>
                <th className="px-5 py-4 font-medium">{t("history.col_status")}</th>
                <th className="px-5 py-4 font-medium text-right">{t("markets.action")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-muted-foreground">{t("p2p.no_orders")}</td></tr>
              ) : filtered.map(order => {
                const isBuyer = order.buyerId === CURRENT_USER_ID;
                const counterparty = isBuyer ? { name: order.sellerName, badge: order.sellerBadge } : { name: order.buyerName, badge: order.buyerBadge };
                return (
                  <tr key={order.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{order.id}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{counterparty.name}</span>
                        <AgentBadgeDisplay badge={counterparty.badge} />
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-bold ${isBuyer ? "text-success" : "text-danger"}`}>
                        {isBuyer ? t("spot.buy") : t("spot.sell")}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono font-medium">{order.usdtAmount} USDT</td>
                    <td className="px-5 py-4 font-mono text-muted-foreground hidden md:table-cell">{order.rate}</td>
                    <td className="px-5 py-4 font-mono hidden md:table-cell">{formatDecimalString(order.totalFiat, 2)} {order.currency}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLE[order.status]}`}>
                        {t(`p2p.status_${order.status}`)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link href={`/p2p/${order.id}`}>
                        <span className="text-xs font-medium text-primary hover:underline cursor-pointer">{t("p2p.view")} →</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
