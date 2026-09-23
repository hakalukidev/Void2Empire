"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { 
  getFundingStats, 
  getAdminFundingHistory, 
  FundingStats, 
  AdminFundingSettlement 
} from "@/services/futures-fees.service";
import { DollarSign, Clock, LayoutDashboard, History } from "lucide-react";

export default function AdminFundingManagementPage() {
  const [stats, setStats] = useState<FundingStats | null>(null);
  const [history, setHistory] = useState<AdminFundingSettlement[]>([]);

  useEffect(() => {
    getFundingStats().then(setStats);
    getAdminFundingHistory().then(setHistory);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Funding Management</h1>
        <p className="text-muted-foreground mt-1">
          Monitor futures funding settlements and company fees collected.
        </p>
      </div>

      {/* Stats row */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card border-border p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Total Funding Settled</h3>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <div className="text-2xl font-bold">${stats.totalFundingCollected.toLocaleString()}</div>
            </div>
          </Card>
          <Card className="bg-card border-border border-l-4 border-l-primary p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Company Fee Earned</h3>
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">${stats.companyFeeEarned.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">2% of total funding</p>
            </div>
          </Card>
          <Card className="bg-card border-border p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Settlements Today</h3>
              <History className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.settlementsToday}</div>
            </div>
          </Card>
          <Card className="bg-card border-border p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Active Markets</h3>
              <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.activeMarketsWithFunding}</div>
            </div>
          </Card>
        </div>
      )}

      {/* History Table */}
      <Card className="border-border p-0 overflow-hidden">
        <div className="flex items-center gap-2 p-5 border-b border-border bg-card">
          <Clock className="h-5 w-5" />
          <h3 className="text-lg font-semibold tracking-tight">Recent Settlements</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground">
              <tr>
                <th className="px-5 py-4 font-medium">Settlement ID</th>
                <th className="px-5 py-4 font-medium">Market</th>
                <th className="px-5 py-4 font-medium">Direction</th>
                <th className="px-5 py-4 font-medium">Total Long Paid</th>
                <th className="px-5 py-4 font-medium">Total Short Paid</th>
                <th className="px-5 py-4 font-medium">Company Fee (2%)</th>
                <th className="px-5 py-4 font-medium">Settled At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {history.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-muted-foreground">No settlements found.</td></tr>
              ) : history.map(row => (
                <tr key={row.id} className="hover:bg-secondary/20 bg-card">
                  <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{row.id}</td>
                  <td className="px-5 py-4 font-bold">{row.pair}</td>
                  <td className="px-5 py-4">
                    <span className="capitalize px-2 py-0.5 rounded text-[10px] font-bold bg-secondary text-foreground border border-border">
                      {row.direction === "long_pays_short" ? "Long → Short" : "Short → Long"}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-mono text-danger">{row.totalLongPaid > 0 ? `$${row.totalLongPaid.toFixed(2)}` : "-"}</td>
                  <td className="px-5 py-4 font-mono text-danger">{row.totalShortPaid > 0 ? `$${row.totalShortPaid.toFixed(2)}` : "-"}</td>
                  <td className="px-5 py-4 font-mono text-primary font-bold">${row.companyFee.toFixed(3)}</td>
                  <td className="px-5 py-4 text-xs text-muted-foreground">{row.settledAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
