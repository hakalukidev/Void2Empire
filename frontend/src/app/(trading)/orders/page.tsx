"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocaleStore } from "@/store/locale-store";
import { ClipboardList, X } from "lucide-react";

type OrderStatus = "open" | "filled" | "cancelled";

interface Order {
  id: string;
  pair: string;
  type: string;
  side: "Long" | "Short";
  price: number;
  amount: number;
  filled: number;
  status: OrderStatus;
  time: string;
}

const MOCK_ORDERS: Order[] = [
  { id: "ORD-001", pair: "BTC-USDT", type: "Limit", side: "Long",  price: 64500, amount: 0.1,  filled: 0,    status: "open",      time: "2024-09-21 17:30" },
  { id: "ORD-002", pair: "ETH-USDT", type: "Market", side: "Short", price: 3400,  amount: 0.5,  filled: 0.5,  status: "filled",    time: "2024-09-21 16:10" },
  { id: "ORD-003", pair: "SOL-USDT", type: "Limit", side: "Long",  price: 140,   amount: 5,    filled: 0,    status: "cancelled", time: "2024-09-21 14:55" },
  { id: "ORD-004", pair: "BTC-USDT", type: "Limit", side: "Short", price: 66000, amount: 0.05, filled: 0,    status: "open",      time: "2024-09-21 12:00" },
];

const STATUS_STYLES: Record<OrderStatus, string> = {
  open:      "bg-primary/10 text-primary border-primary/20",
  filled:    "bg-success/10 text-success border-success/20",
  cancelled: "bg-muted/30 text-muted-foreground border-border",
};

const TABS: { key: OrderStatus | "all"; label: string }[] = [
  { key: "all",       label: "All" },
  { key: "open",      label: "Open" },
  { key: "filled",    label: "Filled" },
  { key: "cancelled", label: "Cancelled" },
];

export default function OrdersPage() {
  const { t } = useLocaleStore();
  const [tab, setTab] = useState<"all" | OrderStatus>("open");

  const filtered = tab === "all" ? MOCK_ORDERS : MOCK_ORDERS.filter(o => o.status === tab);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <ClipboardList className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary/30 p-1 rounded-lg w-fit border border-border">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === key
                ? "bg-card text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <Card className="overflow-hidden bg-card border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Pair</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Side</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Filled</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Time</th>
                <th className="px-6 py-4 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-muted-foreground">
                    No orders found.
                  </td>
                </tr>
              ) : filtered.map((order) => (
                <tr key={order.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{order.id}</td>
                  <td className="px-6 py-4 font-bold">{order.pair}</td>
                  <td className="px-6 py-4 text-muted-foreground">{order.type}</td>
                  <td className={`px-6 py-4 font-semibold ${order.side === "Long" ? "text-success" : "text-danger"}`}>
                    {order.side}
                  </td>
                  <td className="px-6 py-4 font-mono">${order.price.toLocaleString()}</td>
                  <td className="px-6 py-4 font-mono">{order.amount}</td>
                  <td className="px-6 py-4 font-mono text-muted-foreground">
                    {order.filled} / {order.amount}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${STATUS_STYLES[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-muted-foreground whitespace-nowrap">{order.time}</td>
                  <td className="px-6 py-4">
                    {order.status === "open" && (
                      <button className="text-muted-foreground hover:text-danger transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

