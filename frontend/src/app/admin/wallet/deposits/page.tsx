"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowDownCircle, CheckCircle2, XCircle, Clock } from "lucide-react";

type DepositStatus = "pending" | "completed" | "failed" | "on_hold";

const MOCK_DEPOSITS = [
  { id: "DEP-001", user: "Rafiq Ahmed",    email: "rafiq@example.com",   asset: "USDT", amount: 500,  network: "TRC20",   method: "Crypto",       status: "pending"   as DepositStatus, date: "2024-09-21 17:30" },
  { id: "DEP-002", user: "Sadia Islam",    email: "sadia@example.com",   asset: "BTC",  amount: 0.01, network: "Bitcoin",  method: "Crypto",       status: "completed" as DepositStatus, date: "2024-09-21 16:10" },
  { id: "DEP-003", user: "Nasrin Akter",   email: "nasrin@example.com",  asset: "USDT", amount: 1000, network: "ERC20",   method: "Crypto",       status: "completed" as DepositStatus, date: "2024-09-21 15:00" },
  { id: "DEP-004", user: "Tahmina Begum",  email: "tahmina@example.com", asset: "USDT", amount: 250,  network: "TRC20",   method: "SSLCOMMERZ",   status: "pending"   as DepositStatus, date: "2024-09-21 14:20" },
  { id: "DEP-005", user: "Karim Hossain",  email: "karim@example.com",   asset: "ETH",  amount: 0.5,  network: "ERC20",   method: "Crypto",       status: "on_hold"   as DepositStatus, date: "2024-09-20 11:05" },
  { id: "DEP-006", user: "Jamal Uddin",    email: "jamal@example.com",   asset: "USDT", amount: 100,  network: "TRC20",   method: "Crypto",       status: "failed"    as DepositStatus, date: "2024-09-20 09:00" },
];

const STATUS_STYLE: Record<DepositStatus, string> = {
  pending:   "bg-warning/10 text-warning border-warning/20",
  completed: "bg-success/10 text-success border-success/20",
  failed:    "bg-danger/10 text-danger border-danger/20",
  on_hold:   "bg-primary/10 text-primary border-primary/20",
};

const STATUS_ICON: Record<DepositStatus, React.ReactNode> = {
  pending:   <Clock className="w-3 h-3" />,
  completed: <CheckCircle2 className="w-3 h-3" />,
  failed:    <XCircle className="w-3 h-3" />,
  on_hold:   <Clock className="w-3 h-3" />,
};

export default function AdminDepositsPage() {
  const [statusFilter, setStatusFilter] = useState<DepositStatus | "all">("all");
  const [deposits, setDeposits] = useState(MOCK_DEPOSITS);

  const filtered = statusFilter === "all" ? deposits : deposits.filter((d) => d.status === statusFilter);

  const totalDeposited = deposits.filter(d => d.status === "completed" && d.asset === "USDT").reduce((sum, d) => sum + d.amount, 0);
  const pendingCount = deposits.filter(d => d.status === "pending").length;

  const approve = (id: string) => setDeposits(prev => prev.map(d => d.id === id ? { ...d, status: "completed" as DepositStatus } : d));
  const reject  = (id: string) => setDeposits(prev => prev.map(d => d.id === id ? { ...d, status: "failed"    as DepositStatus } : d));

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center gap-3">
        <ArrowDownCircle className="w-6 h-6 text-success" />
        <h1 className="text-2xl font-bold tracking-tight">Deposits</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="p-5 bg-card border-border border-l-4 border-l-success">
          <p className="text-xs text-muted-foreground mb-1">Total Deposited (USDT)</p>
          <p className="text-2xl font-bold text-success">${totalDeposited.toLocaleString()}</p>
        </Card>
        <Card className="p-5 bg-card border-border border-l-4 border-l-warning">
          <p className="text-xs text-muted-foreground mb-1">Pending Review</p>
          <p className="text-2xl font-bold text-warning">{pendingCount}</p>
        </Card>
        <Card className="p-5 bg-card border-border border-l-4 border-l-primary">
          <p className="text-xs text-muted-foreground mb-1">Total Transactions</p>
          <p className="text-2xl font-bold">{deposits.length}</p>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-1 bg-secondary/30 p-1 rounded-lg border border-border w-fit">
        {(["all", "pending", "completed", "on_hold", "failed"] as const).map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${statusFilter === s ? "bg-card text-foreground border border-border shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            {s.replace("_", " ")}
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
                <th className="px-5 py-4 font-medium hidden md:table-cell">Network</th>
                <th className="px-5 py-4 font-medium hidden md:table-cell">Method</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium hidden lg:table-cell">Date</th>
                <th className="px-5 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="px-5 py-12 text-center text-muted-foreground">No deposits found.</td></tr>
              ) : filtered.map((d) => (
                <tr key={d.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{d.id}</td>
                  <td className="px-5 py-4">
                    <div className="font-semibold text-sm">{d.user}</div>
                    <div className="text-xs text-muted-foreground">{d.email}</div>
                  </td>
                  <td className="px-5 py-4 font-bold">{d.asset}</td>
                  <td className="px-5 py-4 font-mono font-medium">{d.amount}</td>
                  <td className="px-5 py-4 text-muted-foreground hidden md:table-cell">{d.network}</td>
                  <td className="px-5 py-4 text-muted-foreground hidden md:table-cell">{d.method}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${STATUS_STYLE[d.status]}`}>
                      {STATUS_ICON[d.status]}{d.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-muted-foreground whitespace-nowrap hidden lg:table-cell">{d.date}</td>
                  <td className="px-5 py-4 text-right">
                    {d.status === "pending" || d.status === "on_hold" ? (
                      <div className="flex justify-end gap-2">
                        <Button size="sm" className="h-7 text-xs bg-success hover:bg-success/90 text-success-fg" onClick={() => approve(d.id)}>Approve</Button>
                        <Button size="sm" variant="secondary" className="h-7 text-xs text-danger border-danger/30 hover:bg-danger/10" onClick={() => reject(d.id)}>Reject</Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
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
