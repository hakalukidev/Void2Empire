"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useLocaleStore } from "@/store/locale-store";
import { History, TrendingUp, TrendingDown } from "lucide-react";

type HistoryTab = "positions" | "orders" | "transactions";

const HISTORY_POSITIONS = [
  { id: "POS-091", pair: "BTC-USDT", side: "Long",  leverage: 10, entryPrice: 60000, closePrice: 63000, size: 0.1, pnl: 300,   pnlPct: 5.0,  closedAt: "2024-09-20 15:22" },
  { id: "POS-090", pair: "ETH-USDT", side: "Short", leverage: 5,  entryPrice: 3600,  closePrice: 3500,  size: 0.5, pnl: 50,    pnlPct: 2.78, closedAt: "2024-09-20 11:05" },
  { id: "POS-089", pair: "SOL-USDT", side: "Long",  leverage: 20, entryPrice: 155,   closePrice: 140,   size: 10,  pnl: -150,  pnlPct: -9.7, closedAt: "2024-09-19 22:40" },
  { id: "POS-088", pair: "BNB-USDT", side: "Long",  leverage: 3,  entryPrice: 550,   closePrice: 580,   size: 0.2, pnl: 6,     pnlPct: 1.8,  closedAt: "2024-09-19 09:10" },
];

const HISTORY_ORDERS = [
  { id: "ORD-091", pair: "BTC-USDT", type: "Limit",  side: "Long",  price: 63000, amount: 0.1,  status: "filled",    time: "2024-09-20 15:20" },
  { id: "ORD-090", pair: "ETH-USDT", type: "Market", side: "Short", price: 3600,  amount: 0.5,  status: "filled",    time: "2024-09-20 10:55" },
  { id: "ORD-089", pair: "SOL-USDT", type: "Limit",  side: "Long",  price: 160,   amount: 10,   status: "cancelled", time: "2024-09-19 20:00" },
];

const HISTORY_TX = [
  { id: "TX-012", type: "Deposit",    asset: "USDT", amount: 500,   status: "completed", date: "2024-09-18 10:00" },
  { id: "TX-011", type: "Withdrawal", asset: "BTC",  amount: 0.01,  status: "completed", date: "2024-09-17 14:30" },
  { id: "TX-010", type: "Deposit",    asset: "USDT", amount: 1000,  status: "completed", date: "2024-09-15 09:00" },
];

const TABS: { key: HistoryTab; label: string }[] = [
  { key: "positions",    label: "Closed Positions" },
  { key: "orders",      label: "Order History" },
  { key: "transactions", label: "Transactions" },
];

export default function HistoryPage() {
  const { t } = useLocaleStore();
  const [tab, setTab] = useState<HistoryTab>("positions");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <History className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">History</h1>
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

          {/* Closed Positions */}
          {tab === "positions" && (
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">Pair</th>
                  <th className="px-6 py-4 font-medium">Side</th>
                  <th className="px-6 py-4 font-medium">Size</th>
                  <th className="px-6 py-4 font-medium">Leverage</th>
                  <th className="px-6 py-4 font-medium">Entry</th>
                  <th className="px-6 py-4 font-medium">Close</th>
                  <th className="px-6 py-4 font-medium">Realized PnL</th>
                  <th className="px-6 py-4 font-medium">Closed At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {HISTORY_POSITIONS.map((p) => (
                  <tr key={p.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4 font-bold">{p.pair}</td>
                    <td className={`px-6 py-4 font-semibold ${p.side === "Long" ? "text-success" : "text-danger"}`}>
                      <div className="flex items-center gap-1">
                        {p.side === "Long" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {p.side}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono">{p.size}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-bold border border-primary/20">{p.leverage}x</span>
                    </td>
                    <td className="px-6 py-4 font-mono">${p.entryPrice.toLocaleString()}</td>
                    <td className="px-6 py-4 font-mono">${p.closePrice.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className={p.pnl >= 0 ? "text-success" : "text-danger"}>
                        <span className="font-bold">{p.pnl >= 0 ? "+" : ""}${p.pnl.toFixed(2)}</span>
                        <span className="text-xs ml-1 opacity-70">({p.pnlPct >= 0 ? "+" : ""}{p.pnlPct.toFixed(2)}%)</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground whitespace-nowrap">{p.closedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Order History */}
          {tab === "orders" && (
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">Order ID</th>
                  <th className="px-6 py-4 font-medium">Pair</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Side</th>
                  <th className="px-6 py-4 font-medium">Price</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {HISTORY_ORDERS.map((o) => (
                  <tr key={o.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{o.id}</td>
                    <td className="px-6 py-4 font-bold">{o.pair}</td>
                    <td className="px-6 py-4 text-muted-foreground">{o.type}</td>
                    <td className={`px-6 py-4 font-semibold ${o.side === "Long" ? "text-success" : "text-danger"}`}>{o.side}</td>
                    <td className="px-6 py-4 font-mono">${o.price.toLocaleString()}</td>
                    <td className="px-6 py-4 font-mono">{o.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${
                        o.status === "filled" ? "bg-success/10 text-success border-success/20" : "bg-muted/30 text-muted-foreground border-border"
                      }`}>{o.status}</span>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground whitespace-nowrap">{o.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Transactions */}
          {tab === "transactions" && (
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">Tx ID</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Asset</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {HISTORY_TX.map((tx) => (
                  <tr key={tx.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{tx.id}</td>
                    <td className={`px-6 py-4 font-semibold ${tx.type === "Deposit" ? "text-success" : "text-warning"}`}>{tx.type}</td>
                    <td className="px-6 py-4 font-bold">{tx.asset}</td>
                    <td className="px-6 py-4 font-mono">{tx.amount}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20 capitalize">
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground whitespace-nowrap">{tx.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

        </div>
      </Card>
    </div>
  );
}
