"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocaleStore } from "@/store/locale-store";
import {
  REFERRAL_REWARD_PERCENT,
  fetchReferralEarnings,
  fetchReferralLink,
  fetchReferralSummary,
  type ReferralEarning,
  type ReferralSummary,
} from "@/services/referral.service";
import { formatDecimalString } from "@/lib/utils/decimal";
import { Copy, Users, DollarSign, Percent, CheckCircle2, Info } from "lucide-react";

export default function ReferralPage() {
  const { t } = useLocaleStore();
  const [copied, setCopied] = useState(false);
  const [link, setLink] = useState("");
  const [summary, setSummary] = useState<ReferralSummary | null>(null);
  const [earnings, setEarnings] = useState<ReferralEarning[]>([]);

  useEffect(() => {
    fetchReferralLink().then(setLink);
    fetchReferralSummary().then(setSummary);
    fetchReferralEarnings().then(setEarnings);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">{t("referral.title")}</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="flex items-center p-6 gap-4 border-l-4 border-l-primary bg-card">
          <div className="p-3 bg-primary/10 rounded-full text-primary">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t("referral.total_referrals")}</p>
            <h2 className="text-2xl font-bold">{summary?.totalReferrals ?? 0}</h2>
          </div>
        </Card>

        <Card className="flex items-center p-6 gap-4 border-l-4 border-l-success bg-card">
          <div className="p-3 bg-success/10 rounded-full text-success">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t("referral.total_earned")}</p>
            <h2 className="text-2xl font-bold text-success">
              +${formatDecimalString(summary?.totalEarned ?? "0", 2)}
            </h2>
          </div>
        </Card>

        <Card className="flex items-center p-6 gap-4 border-l-4 border-l-warning bg-card">
          <div className="p-3 bg-warning/10 rounded-full text-warning">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t("referral.reward_rate")}</p>
            <h2 className="text-2xl font-bold">{REFERRAL_REWARD_PERCENT}%</h2>
            <p className="text-xs text-muted-foreground">{t("referral.per_deposit")}</p>
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 bg-card border-border h-fit">
          <h2 className="text-lg font-semibold mb-2">{t("referral.your_link")}</h2>
          <p className="text-sm text-muted-foreground mb-6">{t("referral.share")}</p>

          <div className="flex gap-2">
            <Input value={link} readOnly className="bg-secondary/30 text-foreground font-medium" />
            <Button variant="primary" onClick={handleCopy} className="gap-2 shrink-0 w-24">
              {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? t("common.copied") : t("common.copy")}
            </Button>
          </div>

          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{t("referral.link_sample")}</p>

          <div className="mt-6 space-y-2 border-t border-border pt-4">
            <p className="flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {t("referral.basis_note")}
            </p>
            <p className="flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {t("referral.permanent_note")}
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">{t("referral.rules_note")}</p>
          </div>
        </Card>

        <Card className="p-0 overflow-hidden bg-card border-border">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold">{t("referral.earnings_title")}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] whitespace-nowrap text-sm text-left">
              <thead className="bg-secondary/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 font-medium">{t("referral.referred_user")}</th>
                  <th className="px-6 py-3 font-medium text-right">{t("referral.deposit_amount")}</th>
                  <th className="px-6 py-3 font-medium text-right">{t("referral.reward")}</th>
                  <th className="px-6 py-3 font-medium text-right">{t("referral.credited_at")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {earnings.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                      {t("referral.no_earnings")}
                    </td>
                  </tr>
                ) : (
                  earnings.map((entry) => (
                    <tr key={entry.id}>
                      <td className="px-6 py-3 font-medium">{entry.referredUser}</td>
                      <td className="px-6 py-3 text-right font-mono text-muted-foreground">
                        ${formatDecimalString(entry.depositAmount, 2)}
                      </td>
                      <td className="px-6 py-3 text-right font-mono font-semibold text-success">
                        +${formatDecimalString(entry.rewardAmount, 4)}
                      </td>
                      <td className="px-6 py-3 text-right text-muted-foreground">{entry.creditedAt}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
