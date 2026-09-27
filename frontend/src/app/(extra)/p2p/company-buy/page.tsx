"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Lock, MessageSquare, ArrowRight, CheckCircle2 } from "lucide-react";

// Mock: Replace with real auth store check
const MOCK_AGENT_LEVEL: "none" | "level1" | "pro" = "none"; // "none" | "level1" | "pro"

const STEPS = [
  { step: 1, label: "Contact Support", desc: "Open a support chat and inform them you want to buy USDT directly from the company." },
  { step: 2, label: "State Amount", desc: "Tell the support agent how much USDT you want to purchase." },
  { step: 3, label: "Receive Payment Info", desc: "Support will provide payment details and instructions." },
  { step: 4, label: "Make Payment", desc: "Complete the payment using the provided details." },
  { step: 5, label: "Company Verifies", desc: "The company verifies your payment (usually within 1–2 hours on business days)." },
  { step: 6, label: "USDT Credited", desc: "Once verified, USDT is credited directly to your platform wallet." },
];

const MOCK_RECENT_PURCHASES = [
  { id: "CP-001", amount: 1000, status: "Completed", date: "2024-09-20" },
  { id: "CP-002", amount: 500, status: "Pending Verification", date: "2024-09-22" },
];

export default function CompanyDirectBuyPage() {
  const isPro = MOCK_AGENT_LEVEL === "pro";

  if (!isPro) {
    return (
      <div className="p-6 max-w-[600px] mx-auto mt-10">
        <Card className="p-8 text-center bg-card border-border space-y-4">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Access Restricted</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Company Direct USDT Purchase is an <strong className="text-emerald-400">exclusive privilege for Level Pro Agents</strong> only.
            Normal users and Level 1 Agents cannot access this feature.
          </p>
          <div className="p-4 bg-secondary/30 rounded-lg border border-border text-left text-sm space-y-2">
            <p className="font-semibold text-foreground">To get access:</p>
            <p className="text-muted-foreground">1. Upgrade to Level Pro Agent ($1,000 one-time fee)</p>
            <p className="text-muted-foreground">2. Then return to this page to purchase USDT directly from the company</p>
          </div>
          <Link href="/p2p/agent">
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold w-full gap-2">
              🟢 Upgrade to Level Pro <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-[900px] mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Building2 className="w-6 h-6 text-emerald-400" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Company Direct USDT Purchase</h1>
          <p className="text-sm text-muted-foreground">Exclusive to Level Pro Agents — buy USDT directly from Void2Empire</p>
        </div>
      </div>

      {/* CTA Card */}
      <Card className="p-6 bg-emerald-400/5 border-emerald-400/30 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-lg">Ready to purchase?</p>
          <p className="text-sm text-muted-foreground mt-1">Contact our support team to initiate your direct USDT purchase.</p>
        </div>
        <Link href="/support?subject=Company Direct USDT Purchase">
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold gap-2 shrink-0">
            <MessageSquare className="w-4 h-4" /> Open Support Chat
          </Button>
        </Link>
      </Card>

      {/* How it works */}
      <Card className="p-5 bg-card border-border">
        <h2 className="font-semibold text-lg mb-5">How It Works</h2>
        <div className="space-y-4">
          {STEPS.map((s, i) => (
            <div key={s.step} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-emerald-400/15 border border-emerald-400/30 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">
                  {s.step}
                </div>
                {i < STEPS.length - 1 && <div className="w-0.5 flex-1 bg-border mt-2 mb-1 min-h-[20px]" />}
              </div>
              <div className="pb-4">
                <p className="font-semibold text-sm">{s.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Purchases */}
      <Card className="overflow-hidden bg-card border-border">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold">Recent Company Purchases</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-medium text-left">ID</th>
              <th className="px-5 py-3 font-medium text-left">Amount (USDT)</th>
              <th className="px-5 py-3 font-medium text-left">Status</th>
              <th className="px-5 py-3 font-medium text-left">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {MOCK_RECENT_PURCHASES.map(p => (
              <tr key={p.id} className="hover:bg-secondary/20 transition-colors">
                <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{p.id}</td>
                <td className="px-5 py-3 font-bold">{p.amount}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
                    p.status === "Completed" ? "bg-success/10 text-success border-success/20" : "bg-warning/10 text-warning border-warning/20"
                  }`}>
                    {p.status === "Completed" && <CheckCircle2 className="w-3 h-3" />}
                    {p.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{p.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
