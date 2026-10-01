"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpCircle, CheckCircle2, XCircle, Clock, Copy } from "lucide-react";

type WithdrawalStatus = "pending" | "completed" | "failed" | "processing";

const MOCK_WITHDRAWALS = [
  { id: "WD-001", user: "Rafiq Ahmed",   email: "rafiq@example.com",   asset: "USDT", amount: 200,  address: "TRX9...xQ4m", network: "TRC20",  fee: 1,    status: "pending"    as WithdrawalStatus, date: "2024-09-21 18:00" },
  { id: "WD-002", user: "Sadia Islam",   email: "sadia@example.com",   asset: "BTC",  amount: 0.005,address: "1A2B...9K3L", network: "Bitcoin", fee: 0.0001, status: "processing" as WithdrawalStatus, date: "2024-09-21 16:30" },
  { id: "WD-003", user: "Nasrin Akter",  email: "nasrin@example.com",  asset: "USDT", amount: 500,  address: "TRX7...mN2p", network: "TRC20",  fee: 1,    status: "completed"  as WithdrawalStatus, date: "2024-09-21 14:00" },
  { id: "WD-004", user: "Arif Chowdhury",email: "arif@example.com",    asset: "ETH",  amount: 0.2,  address: "0x3F...7a9d", network: "ERC20",  fee: 0.002,status: "pending"    as WithdrawalStatus, date: "2024-09-20 12:00" },
  { id: "WD-005", user: "Jamal Uddin",   email: "jamal@example.com",   asset: "USDT", amount: 50,   address: "TRX2...kK8q", network: "TRC20",  fee: 1,    status: "failed"     as WithdrawalStatus, date: "2024-09-20 09:00" },
];

const STATUS_STYLE: Record<WithdrawalStatus, string> = {
  pending:    "bg-warning/10 text-warning border-warning/20",
  processing: "bg-primary/10 text-primary border-primary/20",
  completed:  "bg-success/10 text-success border-success/20",
  failed:     "bg-danger/10 text-danger border-danger/20",
};

export default function AdminWithdrawalsPage() {
  const [statusFilter, setStatusFilter] = useState<WithdrawalStatus | "all">("all");
  const [withdrawals, setWithdrawals] = useState(MOCK_WITHDRAWALS);

  const filtered = statusFilter === "all" ? withdrawals : withdrawals.filter((w) => w.status === statusFilter);
  const pendingValue = withdrawals.filter(w => w.status === "pending" && w.asset === "USDT").reduce((sum, w) => sum + w.amount, 0);
  const pendingCount = withdrawals.filter(w => w.status === "pending" || w.status === "processing").length;
  const totalWithdrawn = withdrawals.filter(w => w.status === "completed" && w.asset === "USDT").reduce((sum, w) => sum + w.amount, 0);

  const approve = (id: string) => setWithdrawals(prev => prev.map(w => w.id === id ? { ...w, status: "processing" as WithdrawalStatus } : w));
  const reject  = (id: string) => setWithdrawals(prev => prev.map(w => w.id === id ? { ...w, status: "failed"     as WithdrawalStatus } : w));

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center gap-3">
        <ArrowUpCircle className="w-6 h-6 text-warning" />
        <h1 className="text-2xl font-bold tracking-tight">Withdrawals</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="p-5 bg-card border-border border-l-4 border-l-warning">
          <p className="text-xs text-muted-foreground mb-1">Pending Value (USDT)</p>
          <p className="text-2xl font-bold text-warning">${pendingValue.toLocaleString()}</p>
        </Card>
        <Card className="p-5 bg-card border-border border-l-4 border-l-primary">
          <p className="text-xs text-muted-foreground mb-1">Pending / Processing</p>
          <p className="text-2xl font-bold text-primary">{pendingCount}</p>
        </Card>
        <Card className="p-5 bg-card border-border border-l-4 border-l-success">
          <p className="text-xs text-muted-foreground mb-1">Total Withdrawn (USDT)</p>
          <p className="text-2xl font-bold">${totalWithdrawn.toLocaleString()}</p>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-1 bg-secondary/30 p-1 rounded-lg border border-border w-fit">
        {(["all", "pending", "processing", "completed", "failed"] as const).map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${statusFilter === s ? "bg-card text-foreground border border-border shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <Card className="overflow-hidden bg-card border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground">
              <tr>
                <th className="px-5 py-4 font-medium">Tx ID</th>
                <th className="px-5 py-4 font-medium">User</th>
                <th className="px-5 py-4 font-medium">Asset</th>
                <th className="px-5 py-4 font-medium">Amount</th>
                <th className="px-5 py-4 font-medium">Fee</th>
                <th className="px-5 py-4 font-medium hidden md:table-cell">Destination</th>
                <th className="px-5 py-4 font-medium hidden md:table-cell">Network</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium hidden lg:table-cell">Date</th>
                <th className="px-5 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr><td colSpan={10} className="px-5 py-12 text-center text-muted-foreground">No withdrawals found.</td></tr>
              ) : filtered.map((w) => (
                <tr key={w.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{w.id}</td>
                  <td className="px-5 py-4">
                    <div className="font-semibold text-sm">{w.user}</div>
                    <div className="text-xs text-muted-foreground">{w.email}</div>
                  </td>
                  <td className="px-5 py-4 font-bold">{w.asset}</td>
                  <td className="px-5 py-4 font-mono font-medium">{w.amount}</td>
                  <td className="px-5 py-4 font-mono text-muted-foreground text-xs">{w.fee}</td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <div className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
                      {w.address}
                      <button className="text-muted-foreground hover:text-foreground ml-1"><Copy className="w-3 h-3" /></button>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground hidden md:table-cell text-xs">{w.network}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${STATUS_STYLE[w.status]}`}>
                      {w.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-muted-foreground whitespace-nowrap hidden lg:table-cell">{w.date}</td>
                  <td className="px-5 py-4 text-right">
                    {w.status === "pending" ? (
                      <div className="flex justify-end gap-2">
                        <Button size="sm" className="h-7 text-xs bg-success hover:bg-success/90 text-success-fg" onClick={() => approve(w.id)}>Approve</Button>
                        <Button size="sm" variant="secondary" className="h-7 text-xs text-danger border-danger/30 hover:bg-danger/10" onClick={() => reject(w.id)}>Reject</Button>
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
