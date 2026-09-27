"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Wallet } from "lucide-react";

type TxType = "deposit" | "withdrawal" | "trade_fee" | "referral_reward" | "p2p" | "funding";

const TX_TYPE_STYLE: Record<TxType, string> = {
  deposit:          "bg-success/10 text-success border-success/20",
  withdrawal:       "bg-warning/10 text-warning border-warning/20",
  trade_fee:        "bg-primary/10 text-primary border-primary/20",
  referral_reward:  "bg-fuchsia-400/10 text-fuchsia-700 dark:text-fuchsia-400 border-fuchsia-400/20",
  p2p:              "bg-cyan-400/10 text-cyan-700 dark:text-cyan-400 border-cyan-400/20",
  funding:          "bg-amber-400/10 text-amber-700 dark:text-amber-400 border-amber-400/20",
};

const TX_TYPE_LABEL: Record<TxType, string> = {
  deposit:         "Deposit",
  withdrawal:      "Withdrawal",
  trade_fee:       "Trade Fee",
  referral_reward: "Referral Reward",
  p2p:             "P2P Trade",
  funding:         "Funding",
};

const MOCK_TRANSACTIONS = [
  { id: "TX-001", user: "Rafiq Ahmed",    asset: "USDT", amount: 500,    fee: 0,     type: "deposit"         as TxType, status: "completed", date: "2024-09-21 17:30" },
  { id: "TX-002", user: "Sadia Islam",    asset: "USDT", amount: 200,    fee: 1,     type: "withdrawal"      as TxType, status: "pending",   date: "2024-09-21 18:00" },
  { id: "TX-003", user: "Rafiq Ahmed",    asset: "USDT", amount: 4.8,    fee: 0,     type: "trade_fee"       as TxType, status: "completed", date: "2024-09-21 16:00" },
  { id: "TX-004", user: "Nasrin Akter",   asset: "USDT", amount: 25,     fee: 0,     type: "referral_reward" as TxType, status: "completed", date: "2024-09-20 14:00" },
  { id: "TX-005", user: "Karim Hossain",  asset: "USDT", amount: 150,    fee: 2,     type: "p2p"             as TxType, status: "completed", date: "2024-09-20 11:00" },
  { id: "TX-006", user: "Tahmina Begum",  asset: "USDT", amount: 1000,   fee: 0,     type: "deposit"         as TxType, status: "completed", date: "2024-09-19 09:00" },
  { id: "TX-007", user: "Arif Chowdhury", asset: "USDT", amount: 100,    fee: 10,    type: "funding"         as TxType, status: "completed", date: "2024-09-19 08:00" },
];

export default function AdminTransactionsPage() {
  const [typeFilter, setTypeFilter] = useState<TxType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "pending" | "failed">("all");

  const filtered = MOCK_TRANSACTIONS.filter((tx) => {
    const matchType   = typeFilter   === "all" || tx.type   === typeFilter;
    const matchStatus = statusFilter === "all" || tx.status === statusFilter;
    return matchType && matchStatus;
  });

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center gap-3">
        <Wallet className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">All Transactions</h1>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-card border-border">
          <p className="text-xs text-muted-foreground">Total Transactions</p>
          <p className="text-2xl font-bold mt-1">{MOCK_TRANSACTIONS.length}</p>
        </Card>
        <Card className="p-4 bg-card border-border">
          <p className="text-xs text-muted-foreground">Total Volume (USDT)</p>
          <p className="text-2xl font-bold mt-1">${MOCK_TRANSACTIONS.reduce((s, t) => s + t.amount, 0).toLocaleString()}</p>
        </Card>
        <Card className="p-4 bg-card border-border">
          <p className="text-xs text-muted-foreground">Total Fees Collected</p>
          <p className="text-2xl font-bold mt-1 text-success">${MOCK_TRANSACTIONS.reduce((s, t) => s + t.fee, 0).toFixed(2)}</p>
        </Card>
        <Card className="p-4 bg-card border-border">
          <p className="text-xs text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold mt-1 text-warning">{MOCK_TRANSACTIONS.filter(t => t.status === "pending").length}</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 bg-secondary/30 p-1 rounded-lg border border-border w-fit flex-wrap">
          {(["all", "deposit", "withdrawal", "trade_fee", "referral_reward", "p2p", "funding"] as const).map((t) => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${typeFilter === t ? "bg-card text-foreground border border-border shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              {t === "all" ? "All Types" : TX_TYPE_LABEL[t as TxType] ?? t}
            </button>
          ))}
        </div>

        <div className="flex gap-1 bg-secondary/30 p-1 rounded-lg border border-border w-fit">
          {(["all", "completed", "pending", "failed"] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${statusFilter === s ? "bg-card text-foreground border border-border shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden bg-card border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground">
              <tr>
                <th className="px-5 py-4 font-medium">Tx ID</th>
                <th className="px-5 py-4 font-medium">User</th>
                <th className="px-5 py-4 font-medium">Type</th>
                <th className="px-5 py-4 font-medium">Asset</th>
                <th className="px-5 py-4 font-medium">Amount</th>
                <th className="px-5 py-4 font-medium hidden md:table-cell">Fee</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium hidden lg:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-muted-foreground">No transactions found.</td></tr>
              ) : filtered.map((tx) => (
                <tr key={tx.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{tx.id}</td>
                  <td className="px-5 py-4 font-semibold">{tx.user}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${TX_TYPE_STYLE[tx.type]}`}>
                      {TX_TYPE_LABEL[tx.type]}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-bold">{tx.asset}</td>
                  <td className="px-5 py-4 font-mono font-medium">{tx.amount}</td>
                  <td className="px-5 py-4 font-mono text-muted-foreground text-xs hidden md:table-cell">{tx.fee}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${
                      tx.status === "completed" ? "bg-success/10 text-success border-success/20" :
                      tx.status === "pending"   ? "bg-warning/10 text-warning border-warning/20" :
                      "bg-danger/10 text-danger border-danger/20"
                    }`}>{tx.status}</span>
                  </td>
                  <td className="px-5 py-4 text-xs text-muted-foreground whitespace-nowrap hidden lg:table-cell">{tx.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
