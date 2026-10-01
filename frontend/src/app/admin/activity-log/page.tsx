"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Activity, Search, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const MOCK_LOGS = [
  { id: "L-001", time: "2024-09-21 18:30:05", actor: "Admin", action: "Settings Update", details: "Changed Maker Fee to 0.02%", ip: "192.168.1.1" },
  { id: "L-002", time: "2024-09-21 17:15:22", actor: "System", action: "Liquidation", details: "Liquidated position P-9912", ip: "localhost" },
  { id: "L-003", time: "2024-09-21 16:45:10", actor: "Admin", action: "Withdrawal Approval", details: "Approved WD-003 for 500 USDT", ip: "192.168.1.1" },
  { id: "L-004", time: "2024-09-21 15:20:00", actor: "User: Rafiq Ahmed", action: "Login", details: "Successful login", ip: "103.111.222.5" },
  { id: "L-005", time: "2024-09-21 14:10:33", actor: "User: Sadia Islam", action: "Order Placed", details: "Limit Buy 0.1 BTC at 64000", ip: "103.111.222.6" },
];

export default function AdminActivityLogPage() {
  const [search, setSearch] = useState("");
  
  const filtered = MOCK_LOGS.filter(log => 
    log.actor.toLowerCase().includes(search.toLowerCase()) || 
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    log.details.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Activity Log</h1>
        </div>
        <Button variant="outline" className="gap-2 bg-secondary border-border hover:bg-secondary/80">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      <Card className="p-4 bg-card border-border">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by actor, action, or details..." 
            className="pl-9 bg-secondary/30" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
      </Card>

      <Card className="overflow-hidden bg-card border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground">
              <tr>
                <th className="px-5 py-4 font-medium">Log ID</th>
                <th className="px-5 py-4 font-medium">Timestamp</th>
                <th className="px-5 py-4 font-medium">Actor</th>
                <th className="px-5 py-4 font-medium">Action</th>
                <th className="px-5 py-4 font-medium">Details</th>
                <th className="px-5 py-4 font-medium hidden md:table-cell">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-mono text-xs">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-5 py-4 text-muted-foreground">{log.id}</td>
                  <td className="px-5 py-4 text-muted-foreground">{log.time}</td>
                  <td className="px-5 py-4 font-sans font-medium text-foreground">{log.actor}</td>
                  <td className="px-5 py-4 font-sans">
                    <span className="px-2 py-0.5 rounded bg-secondary text-foreground border border-border">{log.action}</span>
                  </td>
                  <td className="px-5 py-4 font-sans text-muted-foreground">{log.details}</td>
                  <td className="px-5 py-4 text-muted-foreground hidden md:table-cell">{log.ip}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-muted-foreground font-sans text-sm">No logs found matching your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
