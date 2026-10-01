"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AgentBadgeDisplay } from "@/components/p2p/agent-badge";
import { getAgentInfo, applyForAgent, AgentInfo } from "@/services/p2p.service";
import { CheckCircle2, Lock, Shield, XCircle } from "lucide-react";

const TIERS = [
  {
    level: "level1" as const,
    name: "Level 1 Agent",
    badge: "level1" as const,
    fee: 200,
    color: "yellow",
    features: [
      { text: "Create Buy/Sell Posts immediately (no waiting period)", ok: true },
      { text: "Sell USDT to public via Marketplace", ok: true },
      { text: "Company Direct USDT Purchase", ok: false },
    ],
  },
  {
    level: "pro" as const,
    name: "Level Pro Agent",
    badge: "pro" as const,
    fee: 1000,
    color: "emerald",
    features: [
      { text: "Create Buy/Sell Posts immediately (no waiting period)", ok: true },
      { text: "Sell USDT to public via Marketplace", ok: true },
      { text: "Company Direct USDT Purchase (exclusive)", ok: true },
    ],
  },
];

export default function AgentRegistrationPage() {
  const [agentInfo, setAgentInfo] = useState<AgentInfo | null>(null);
  const [applying, setApplying] = useState<"level1" | "pro" | null>(null);
  const [showConfirm, setShowConfirm] = useState<"level1" | "pro" | null>(null);

  useEffect(() => { getAgentInfo().then(setAgentInfo); }, []);

  const handleApply = async (level: "level1" | "pro") => {
    setApplying(level);
    await applyForAgent(level);
    setApplying(null);
    setShowConfirm(null);
    // In real app, refresh agent info from server
    setAgentInfo(prev => prev ? { ...prev, level } : prev);
  };

  const currentLevel = agentInfo?.level ?? "none";

  return (
    <div className="p-4 md:p-6 max-w-[900px] mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agent Registration</h1>
          <p className="text-sm text-muted-foreground">Upgrade your account to unlock more P2P trading privileges</p>
        </div>
      </div>

      {/* Current status */}
      <Card className="p-4 bg-card border-border flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Your Current Level</p>
          {currentLevel === "none" ? (
            <span className="text-sm font-medium text-muted-foreground">Normal User</span>
          ) : (
            <AgentBadgeDisplay badge={currentLevel} size="md" />
          )}
        </div>
        {agentInfo && (
          <div className="flex gap-6 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Completed Trades</p>
              <p className="font-bold">{agentInfo.completedTrades}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Account Age</p>
              <p className="font-bold">{agentInfo.accountAgeDays} days</p>
            </div>
          </div>
        )}
      </Card>

      {/* Tier Cards */}
      <div className="grid md:grid-cols-2 gap-5">
        {TIERS.map(tier => {
          const isActive = currentLevel === tier.level;
          const isUpgrade = tier.level === "pro" && currentLevel === "level1";
          const isLocked = tier.level === "level1" && currentLevel === "pro";
          const isPro = tier.level === "pro";

          return (
            <Card key={tier.level} className={`p-6 border-2 flex flex-col gap-5 ${isActive ? (isPro ? "border-emerald-400/40 bg-emerald-400/5" : "border-yellow-400/40 bg-yellow-400/5") : "border-border bg-card"}`}>
              <div className="flex items-start justify-between">
                <div>
                  <AgentBadgeDisplay badge={tier.badge} size="md" />
                  <p className={`text-3xl font-bold mt-3 ${isPro ? "text-emerald-700 dark:text-emerald-400" : "text-yellow-700 dark:text-yellow-400"}`}>
                    ${tier.fee.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">One-time registration fee</p>
                </div>
                {isActive && (
                  <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-success/15 text-success border border-success/20">ACTIVE</span>
                )}
              </div>

              <ul className="space-y-2.5 flex-1">
                {tier.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm">
                    {f.ok
                      ? <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                      : <XCircle className="w-4 h-4 text-muted-foreground/40 shrink-0 mt-0.5" />}
                    <span className={f.ok ? "text-foreground" : "text-muted-foreground line-through"}>{f.text}</span>
                  </li>
                ))}
              </ul>

              {isActive ? (
                <div className="text-center text-sm font-medium text-muted-foreground py-2">Currently Active</div>
              ) : isLocked ? (
                <div className="text-center text-sm text-muted-foreground py-2 flex items-center justify-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> Downgrade not available
                </div>
              ) : (
                <Button
                  onClick={() => setShowConfirm(tier.level)}
                  className={`w-full font-bold py-3 ${isPro ? "bg-emerald-700 hover:bg-emerald-800 text-white" : "bg-yellow-500 hover:bg-yellow-600 text-black"}`}>
                  {isUpgrade ? `Upgrade to Level Pro` : `Apply for ${tier.name}`}
                </Button>
              )}
            </Card>
          );
        })}
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-sm p-6 bg-card border-border space-y-4">
            <h2 className="font-bold text-lg">Confirm Application</h2>
            <p className="text-sm text-muted-foreground">
              You are applying for <strong className="text-foreground">{TIERS.find(t => t.level === showConfirm)?.name}</strong>.
              A fee of <strong className="text-foreground">${TIERS.find(t => t.level === showConfirm)?.fee}</strong> will be deducted from your wallet balance.
            </p>
            <div className="flex gap-3">
              <Button onClick={() => setShowConfirm(null)} variant="secondary" className="flex-1">Cancel</Button>
              <Button
                onClick={() => handleApply(showConfirm)}
                disabled={applying === showConfirm}
                className="flex-1 bg-primary text-primary-foreground font-bold">
                {applying === showConfirm ? "Processing..." : "Confirm & Pay"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
