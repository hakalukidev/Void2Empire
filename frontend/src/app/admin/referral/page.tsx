"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HandCoins, Save, Plus } from "lucide-react";

const MOCK_PLANS = [
  { id: 1, name: "Bronze Starter", minAmount: 100, apy: 5, duration: 30, active: true },
  { id: 2, name: "Silver Growth", minAmount: 1000, apy: 12, duration: 90, active: true },
  { id: 3, name: "Gold Elite", minAmount: 5000, apy: 25, duration: 180, active: false },
];

export default function AdminReferralPage() {
  const [rate, setRate] = useState(20);
  const [plans, setPlans] = useState(MOCK_PLANS);

  const togglePlan = (id: number) => setPlans(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto">
      <div className="flex items-center gap-3">
        <HandCoins className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Referral & Funding Settings</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Referral Settings */}
        <Card className="p-5 bg-card border-border space-y-4">
          <h2 className="font-semibold text-lg border-b border-border pb-2">Referral Program</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Global Commission Rate (%)</label>
              <div className="flex gap-3">
                <Input type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))} className="bg-secondary/30 w-32" />
                <Button className="gap-2 bg-primary hover:bg-primary/90"><Save className="w-4 h-4" /> Save</Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="p-4 bg-secondary/30 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground mb-1">Total Referrals</p>
                <p className="text-xl font-bold">1,420</p>
              </div>
              <div className="p-4 bg-secondary/30 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground mb-1">Total Paid (USDT)</p>
                <p className="text-xl font-bold text-success">$14,500</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Funding Plans */}
        <Card className="p-5 bg-card border-border space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h2 className="font-semibold text-lg">Funding Plans</h2>
            <Button size="sm" variant="secondary" className="h-7 text-xs gap-1"><Plus className="w-3 h-3" /> New Plan</Button>
          </div>
          <div className="space-y-3">
            {plans.map((plan) => (
              <div key={plan.id} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg border border-border">
                <div>
                  <p className="font-semibold">{plan.name}</p>
                  <p className="text-xs text-muted-foreground">Min: ${plan.minAmount} • APY: {plan.apy}% • {plan.duration} days</p>
                </div>
                <button onClick={() => togglePlan(plan.id)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${plan.active ? "bg-success" : "bg-secondary border border-border"}`}>
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${plan.active ? "translate-x-4" : "translate-x-1"}`} />
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
