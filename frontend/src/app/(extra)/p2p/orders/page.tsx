"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { getMyOrders, P2POrder, OrderStatus } from "@/services/p2p.service";
import { AgentBadgeDisplay } from "@/components/p2p/agent-badge";
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

export default function MyP2POrdersPage() {
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
        <h1 className="text-2xl font-bold tracking-tight">My P2P Orders</h1>
      </div>

      <div className="flex gap-1 p-1 bg-secondary/30 border border-border rounded-lg w-fit flex-wrap">
        {(["all", "buying", "selling", "disputed"] as FilterTab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${tab === t ? "bg-card text-foreground border border-border shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            {t}
          </button>
        ))}
      </div>

      <Card className="overflow-hidden bg-card border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground">
              <tr>
                <th className="px-5 py-4 font-medium">Order ID</th>
                <th className="px-5 py-4 font-medium">Counterparty</th>
                <th className="px-5 py-4 font-medium">Type</th>
                <th className="px-5 py-4 font-medium">Amount</th>
                <th className="px-5 py-4 font-medium hidden md:table-cell">Rate</th>
                <th className="px-5 py-4 font-medium hidden md:table-cell">Total</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-muted-foreground">No orders found.</td></tr>
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
                        {isBuyer ? "BUY" : "SELL"}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono font-medium">{order.usdtAmount} USDT</td>
                    <td className="px-5 py-4 font-mono text-muted-foreground hidden md:table-cell">{order.rate}</td>
                    <td className="px-5 py-4 font-mono hidden md:table-cell">{order.totalFiat.toLocaleString()} {order.currency}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${STATUS_STYLE[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link href={`/p2p/${order.id}`}>
                        <span className="text-xs font-medium text-primary hover:underline cursor-pointer">View →</span>
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
