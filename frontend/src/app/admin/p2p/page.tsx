"use client";

import { Card } from "@/components/ui/card";
import { SampleBadge } from "@/components/home/sample-badge";
import { ArrowLeftRight, ShieldAlert } from "lucide-react";
import type { OrderStatus } from "@/services/p2p.service";

// P2P is USDT-only (REQ-111) — no other asset may appear in this table.
interface AdminP2PTrade {
  id: string;
  seller: string;
  buyer: string;
  asset: "USDT";
  amount: string; // decimal string (Sec46 rule #40)
  rate: string; // fiat per 1 USDT, set by the post creator (REQ-125)
  totalFiat: string;
  method: string;
  status: OrderStatus;
  date: string;
}

const MOCK_P2P: AdminP2PTrade[] = [
  { id: "P2P-1", seller: "Rafiq Ahmed", buyer: "Jane Doe", asset: "USDT", amount: "100", rate: "120", totalFiat: "12000", method: "bKash", status: "disputed", date: "2024-09-21" },
  { id: "P2P-2", seller: "Karim Hossain", buyer: "John Smith", asset: "USDT", amount: "250", rate: "119", totalFiat: "29750", method: "Bank Transfer", status: "paid", date: "2024-09-20" },
  { id: "P2P-3", seller: "Sadia Islam", buyer: "—", asset: "USDT", amount: "50", rate: "121", totalFiat: "6050", method: "Nagad", status: "pending", date: "2024-09-21" },
  { id: "P2P-4", seller: "Nasrin Pro", buyer: "Amin R.", asset: "USDT", amount: "1000", rate: "118", totalFiat: "118000", method: "bKash", status: "completed", date: "2024-09-19" },
];

const STATUS_STYLE: Record<OrderStatus, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  paid: "bg-primary/10 text-primary border-primary/20",
  released: "bg-success/10 text-success border-success/20",
  completed: "bg-success/10 text-success border-success/20",
  cancelled: "bg-secondary/50 text-muted-foreground border-border",
  disputed: "bg-danger/10 text-danger border-danger/20",
};

export default function AdminP2PPage() {
  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1200px] mx-auto">
      <div className="flex flex-wrap items-center gap-3">
        <ArrowLeftRight className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">P2P Management</h1>
          <p className="text-sm text-muted-foreground">Permission: p2p.manage</p>
        </div>
        <SampleBadge className="ml-auto" />
      </div>

      {/* No P2P backend exists yet, so the counters above the table would be invented totals. */}
      <div className="flex gap-2 p-3 bg-secondary/30 rounded-lg border border-border text-xs text-muted-foreground">
        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-danger" />
        <p>
          Disputes are listed here, but their outcome rules are not settled: the client&apos;s P2P
          document cuts off mid-sentence exactly at the fake-payment / refund / cancellation rule
          (DR-064), so no resolution action is offered until that is provided.
        </p>
      </div>

      <Card className="overflow-hidden bg-card border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground">
              <tr>
                <th className="px-5 py-4 font-medium">Order ID</th>
                <th className="px-5 py-4 font-medium">Seller / Buyer</th>
                <th className="px-5 py-4 font-medium">Amount</th>
                <th className="px-5 py-4 font-medium">Rate</th>
                <th className="px-5 py-4 font-medium">Total (Fiat)</th>
                <th className="px-5 py-4 font-medium">Method</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {MOCK_P2P.map((t) => (
                <tr key={t.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{t.id}</td>
                  <td className="px-5 py-4">
                    <div className="text-sm font-semibold">{t.seller}</div>
                    <div className="text-xs text-muted-foreground">→ {t.buyer}</div>
                  </td>
                  <td className="px-5 py-4 font-mono font-bold">{t.amount} <span className="text-primary">{t.asset}</span></td>
                  <td className="px-5 py-4 font-mono">{t.rate}</td>
                  <td className="px-5 py-4 font-mono">{t.totalFiat} BDT</td>
                  <td className="px-5 py-4 text-muted-foreground">{t.method}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${STATUS_STYLE[t.status]}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-muted-foreground">{t.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
