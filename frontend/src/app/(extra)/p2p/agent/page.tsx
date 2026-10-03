"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AgentBadgeDisplay } from "@/components/p2p/agent-badge";
import {
  getAgentInfo,
  AgentInfo,
  AGENT_LEVEL_1_FEE,
  AGENT_PRO_FEE,
} from "@/services/p2p.service";
import { formatDecimalString } from "@/lib/utils/decimal";
import { useLocaleStore } from "@/store/locale-store";
import { AlertTriangle, CheckCircle2, Info, MessageSquare, Shield, XCircle } from "lucide-react";

// Tier copy lives in the message files; this table holds only keys and confirmed constants.
const TIERS = [
  {
    level: "level1" as const,
    nameKey: "p2p.tier_level1",
    badge: "level1" as const,
    fee: AGENT_LEVEL_1_FEE,
    // The $200 figure comes from WA-3 §4 alone. v20 restated the Agent Registration Fee as
    // $1,000 without separating the tiers, so this price is carried as unconfirmed.
    feeConfirmed: false,
    features: [
      { textKey: "p2p.feature_marketplace", ok: true },
      { textKey: "p2p.feature_posts", ok: true },
      { textKey: "p2p.feature_company", ok: false },
    ],
  },
  {
    level: "pro" as const,
    nameKey: "p2p.tier_pro",
    badge: "pro" as const,
    fee: AGENT_PRO_FEE,
    feeConfirmed: true,
    features: [
      { textKey: "p2p.feature_marketplace", ok: true },
      { textKey: "p2p.feature_posts", ok: true },
      { textKey: "p2p.feature_company_exclusive", ok: true },
    ],
  },
];

export default function AgentRegistrationPage() {
  const { t } = useLocaleStore();
  const [agentInfo, setAgentInfo] = useState<AgentInfo | null>(null);

  useEffect(() => { getAgentInfo().then(setAgentInfo); }, []);

  const currentLevel = agentInfo?.level ?? "none";

  return (
    <div className="p-4 md:p-6 max-w-[900px] mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("p2p.agent_title")}</h1>
          <p className="text-sm text-muted-foreground">{t("p2p.agent_sub")}</p>
        </div>
      </div>

      {/* Registration is a Support-mediated payment, not a wallet debit. */}
      <div className="flex gap-2 p-3 bg-secondary/30 rounded-lg border border-border text-xs text-muted-foreground">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <p>{t("p2p.agent_info_note")}</p>
      </div>

      {/* Current status */}
      <Card className="p-4 bg-card border-border flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs text-muted-foreground mb-1">{t("p2p.current_level")}</p>
          {currentLevel === "none" ? (
            <span className="text-sm font-medium text-muted-foreground">{t("p2p.normal_user")}</span>
          ) : (
            <AgentBadgeDisplay badge={currentLevel} size="md" />
          )}
        </div>
        {agentInfo && (
          <div className="flex gap-6 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">{t("p2p.completed_trades")}</p>
              <p className="font-bold">{agentInfo.completedTrades}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("p2p.account_age")}</p>
              <p className="font-bold">{agentInfo.accountAgeDays} {t("p2p.days")}</p>
            </div>
          </div>
        )}
      </Card>

      {/* Tier Cards */}
      <div className="grid md:grid-cols-2 gap-5">
        {TIERS.map(tier => {
          const isActive = currentLevel === tier.level;
          const isHeldByHigherTier = tier.level === "level1" && currentLevel === "pro";
          const isPro = tier.level === "pro";

          return (
            <Card key={tier.level} className={`p-6 border-2 flex flex-col gap-5 ${isActive ? (isPro ? "border-emerald-400/40 bg-emerald-400/5" : "border-yellow-400/40 bg-yellow-400/5") : "border-border bg-card"}`}>
              <div className="flex items-start justify-between">
                <div>
                  <AgentBadgeDisplay badge={tier.badge} size="md" />
                  <p className={`text-lg font-semibold mt-2 ${isPro ? "text-emerald-700 dark:text-emerald-400" : "text-yellow-700 dark:text-yellow-400"}`}>
                    {t(tier.nameKey)}
                  </p>
                  <p className={`text-3xl font-bold mt-1 ${isPro ? "text-emerald-700 dark:text-emerald-400" : "text-yellow-700 dark:text-yellow-400"}`}>
                    ${formatDecimalString(tier.fee, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">{t("p2p.one_time_fee")}</p>
                </div>
                {isActive && (
                  <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-success/15 text-success border border-success/20">{t("p2p.active_badge")}</span>
                )}
              </div>

              {!tier.feeConfirmed && (
                <p className="flex gap-1.5 text-xs leading-relaxed text-warning">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  {t("p2p.fee_unconfirmed")}
                </p>
              )}

              <ul className="space-y-2.5 flex-1">
                {tier.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm">
                    {f.ok
                      ? <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                      : <XCircle className="w-4 h-4 text-muted-foreground/40 shrink-0 mt-0.5" />}
                    <span className={f.ok ? "text-foreground" : "text-muted-foreground line-through"}>{t(f.textKey)}</span>
                  </li>
                ))}
              </ul>

              {isActive ? (
                <div className="text-center text-sm font-medium text-muted-foreground py-2">{t("p2p.currently_active")}</div>
              ) : isHeldByHigherTier ? (
                <div className="text-center text-sm text-muted-foreground py-2">{t("p2p.held_by_pro")}</div>
              ) : (
                <Link href="/support" className="w-full">
                  <Button
                    className={`w-full font-bold py-3 gap-2 ${isPro ? "bg-emerald-700 hover:bg-emerald-800 text-white" : "bg-yellow-500 hover:bg-yellow-600 text-black"}`}>
                    <MessageSquare className="w-4 h-4" />
                    {t("p2p.apply_via_support")}
                  </Button>
                </Link>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
