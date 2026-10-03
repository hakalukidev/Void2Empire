"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Lock, MessageSquare, ArrowRight } from "lucide-react";
import { AGENT_PRO_FEE } from "@/services/p2p.service";
import { formatDecimalString } from "@/lib/utils/decimal";
import { useLocaleStore } from "@/store/locale-store";

// Mock: Replace with real auth store check
const MOCK_AGENT_LEVEL: "none" | "level1" | "pro" = "none"; // "none" | "level1" | "pro"

const STEPS = [
  { step: 1, labelKey: "p2p.step1_label", descKey: "p2p.step1_desc" },
  { step: 2, labelKey: "p2p.step2_label", descKey: "p2p.step2_desc" },
  { step: 3, labelKey: "p2p.step3_label", descKey: "p2p.step3_desc" },
  { step: 4, labelKey: "p2p.step4_label", descKey: "p2p.step4_desc" },
  { step: 5, labelKey: "p2p.step5_label", descKey: "p2p.step5_desc" },
  { step: 6, labelKey: "p2p.step6_label", descKey: "p2p.step6_desc" },
];

export default function CompanyDirectBuyPage() {
  const { t } = useLocaleStore();
  const isPro = MOCK_AGENT_LEVEL === "pro";

  if (!isPro) {
    return (
      <div className="p-4 sm:p-6 max-w-[600px] mx-auto mt-6 sm:mt-10">
        <Card className="p-8 text-center bg-card border-border space-y-4">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold">{t("p2p.company_restricted")}</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {t("p2p.company_restricted_before")}{" "}
            <strong className="text-emerald-700 dark:text-emerald-400">{t("p2p.company_restricted_strong")}</strong>{" "}
            {t("p2p.company_restricted_after")}
          </p>
          <div className="p-4 bg-secondary/30 rounded-lg border border-border text-left text-sm space-y-2">
            <p className="font-semibold text-foreground">{t("p2p.company_to_get_access")}</p>
            <p className="text-muted-foreground">{t("p2p.company_access_1_before")}${formatDecimalString(AGENT_PRO_FEE, 0)} {t("p2p.company_access_1_after")}</p>
            <p className="text-muted-foreground">{t("p2p.company_access_2")}</p>
          </div>
          <Link href="/p2p/agent">
            <Button className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold w-full gap-2">
              🟢 {t("p2p.company_upgrade_cta")} <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-[900px] mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Building2 className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("p2p.company_title")}</h1>
          <p className="text-sm text-muted-foreground">{t("p2p.company_sub")}</p>
        </div>
      </div>

      {/* CTA Card */}
      <Card className="p-6 bg-emerald-400/5 border-emerald-400/30 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-lg">{t("p2p.company_ready")}</p>
          <p className="text-sm text-muted-foreground mt-1">{t("p2p.company_ready_desc")}</p>
        </div>
        <Link href="/support?subject=Company Direct USDT Purchase">
          <Button className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold gap-2 shrink-0">
            <MessageSquare className="w-4 h-4" /> {t("p2p.company_open_chat")}
          </Button>
        </Link>
      </Card>

      {/* How it works */}
      <Card className="p-5 bg-card border-border">
        <h2 className="font-semibold text-lg mb-5">{t("p2p.how_it_works")}</h2>
        <div className="space-y-4">
          {STEPS.map((s, i) => (
            <div key={s.step} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-emerald-400/15 border border-emerald-400/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">
                  {s.step}
                </div>
                {i < STEPS.length - 1 && <div className="w-0.5 flex-1 bg-border mt-2 mb-1 min-h-[20px]" />}
              </div>
              <div className="pb-4">
                <p className="font-semibold text-sm">{t(s.labelKey)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t(s.descKey)}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Direct purchases are created by Support, and the API does not serve them yet. */}
      <Card className="overflow-hidden bg-card border-border">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold">{t("p2p.recent_purchases")}</h2>
        </div>
        <div className="px-5 py-10 text-center text-sm text-muted-foreground">
          {t("p2p.no_purchases")}
        </div>
      </Card>
    </div>
  );
}
