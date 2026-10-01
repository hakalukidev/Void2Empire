"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, CheckCircle2, XCircle } from "lucide-react";

type P2PStatus = "active" | "completed" | "disputed";

const MOCK_P2P = [
  { id: "P2P-1", seller: "Rafiq Ahmed", buyer: "Jane Doe", asset: "USDT", amount: 100, price: 120, method: "bKash", status: "disputed" as P2PStatus, date: "2024-09-21" },
  { id: "P2P-2", seller: "Karim Hossain", buyer: "John Smith", asset: "BTC", amount: 0.1, price: 65000, method: "Bank Transfer", status: "completed" as P2PStatus, date: "2024-09-20" },
  { id: "P2P-3", seller: "Sadia Islam", buyer: "-", asset: "USDT", amount: 50, price: 119, method: "Nagad", status: "active" as P2PStatus, date: "2024-09-21" },
];

const STATUS_STYLE: Record<P2PStatus, string> = {
  active: "bg-primary/10 text-primary border-primary/20",
  completed: "bg-success/10 text-success border-success/20",
  disputed: "bg-danger/10 text-danger border-danger/20",
};

export default function AdminP2PPage() {
  const [trades, setTrades] = useState(MOCK_P2P);

  const resolveDispute = (id: string, winner: "buyer" | "seller") => {
    // In a real app, this would release funds to the winner
    setTrades(prev => prev.map(t => t.id === id ? { ...t, status: "completed" as P2PStatus } : t));
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1200px] mx-auto">
      <div className="flex items-center gap-3">
        <ArrowLeftRight className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">P2P Management</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4 bg-card border-border"><p className="text-xs text-muted-foreground">Active Listings</p><p className="text-2xl font-bold">124</p></Card>
        <Card className="p-4 bg-card border-border border-l-4 border-l-danger"><p className="text-xs text-muted-foreground">Open Disputes</p><p className="text-2xl font-bold text-danger">3</p></Card>
        <Card className="p-4 bg-card border-border border-l-4 border-l-success"><p className="text-xs text-muted-foreground">Completed Today</p><p className="text-2xl font-bold text-success">45</p></Card>
      </div>

      <Card className="overflow-hidden bg-card border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground">
              <tr>
                <th className="px-5 py-4 font-medium">Trade ID</th>
                <th className="px-5 py-4 font-medium">Seller / Buyer</th>
                <th className="px-5 py-4 font-medium">Asset & Amount</th>
                <th className="px-5 py-4 font-medium">Price (Fiat)</th>
                <th className="px-5 py-4 font-medium">Method</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {trades.map((t) => (
                <tr key={t.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{t.id}</td>
                  <td className="px-5 py-4">
                    <div className="text-sm font-semibold">{t.seller}</div>
                    <div className="text-xs text-muted-foreground">→ {t.buyer}</div>
                  </td>
                  <td className="px-5 py-4 font-bold">{t.amount} <span className="text-primary">{t.asset}</span></td>
                  <td className="px-5 py-4 font-mono">{t.price}</td>
                  <td className="px-5 py-4 text-muted-foreground">{t.method}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${STATUS_STYLE[t.status]}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    {t.status === "disputed" ? (
                      <div className="flex justify-end gap-2">
                        <Button size="sm" className="h-7 text-xs bg-primary" onClick={() => resolveDispute(t.id, "buyer")}>Favor Buyer</Button>
                        <Button size="sm" variant="secondary" className="h-7 text-xs text-muted-foreground" onClick={() => resolveDispute(t.id, "seller")}>Favor Seller</Button>
                      </div>
                    ) : <span className="text-xs text-muted-foreground">—</span>}
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
