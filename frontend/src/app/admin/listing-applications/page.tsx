"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle2, XCircle, Clock } from "lucide-react";

type AppStatus = "pending" | "approved" | "rejected";

const MOCK_APPS = [
  { id: "APP-001", user: "John Doe", email: "john@example.com", project: "DeFi Protocol", symbol: "DEFI", status: "pending" as AppStatus, date: "2024-09-21" },
  { id: "APP-002", user: "Jane Smith", email: "jane@example.com", project: "GameToken", symbol: "GAME", status: "approved" as AppStatus, date: "2024-09-20" },
  { id: "APP-003", user: "Alice Lee", email: "alice@example.com", project: "MemeCoin", symbol: "MEME", status: "rejected" as AppStatus, date: "2024-09-19" },
];

const STATUS_STYLE: Record<AppStatus, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  approved: "bg-success/10 text-success border-success/20",
  rejected: "bg-danger/10 text-danger border-danger/20",
};

export default function ListingAppsPage() {
  const [apps, setApps] = useState(MOCK_APPS);

  const approve = (id: string) => setApps(prev => prev.map(a => a.id === id ? { ...a, status: "approved" as AppStatus } : a));
  const reject = (id: string) => setApps(prev => prev.map(a => a.id === id ? { ...a, status: "rejected" as AppStatus } : a));

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto">
      <div className="flex items-center gap-3">
        <FileText className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Listing Applications</h1>
      </div>

      <Card className="overflow-hidden bg-card border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground">
              <tr>
                <th className="px-5 py-4 font-medium">App ID</th>
                <th className="px-5 py-4 font-medium">Applicant</th>
                <th className="px-5 py-4 font-medium">Project</th>
                <th className="px-5 py-4 font-medium">Symbol</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium">Date</th>
                <th className="px-5 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {apps.map((app) => (
                <tr key={app.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{app.id}</td>
                  <td className="px-5 py-4">
                    <div className="font-semibold">{app.user}</div>
                    <div className="text-xs text-muted-foreground">{app.email}</div>
                  </td>
                  <td className="px-5 py-4 font-medium">{app.project}</td>
                  <td className="px-5 py-4 font-bold text-primary">{app.symbol}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${STATUS_STYLE[app.status]}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-muted-foreground">{app.date}</td>
                  <td className="px-5 py-4 text-right">
                    {app.status === "pending" ? (
                      <div className="flex justify-end gap-2">
                        <Button size="sm" className="h-7 text-xs bg-success hover:bg-success/90 text-success-fg" onClick={() => approve(app.id)}>Approve</Button>
                        <Button size="sm" variant="secondary" className="h-7 text-xs text-danger border-danger/30 hover:bg-danger/10" onClick={() => reject(app.id)}>Reject</Button>
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
