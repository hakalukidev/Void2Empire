"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocaleStore } from "@/store/locale-store";
import { compareDecimalStrings, isPositiveDecimal } from "@/lib/utils/decimal";
import {
  fetchFundingRatios,
  fetchFundingMilestones,
  fetchActiveFundingPurchase,
  purchaseFunding,
  closeFundingPurchase,
  quoteFunding,
  type FundingRatioConfig,
  type FundingMilestone,
  type FundingPurchase,
} from "@/services/funding.service";
import toast from "react-hot-toast";
import { Lock, TrendingUp, Info } from "lucide-react";

export default function FundingPage() {
  const { t } = useLocaleStore();
  const [config, setConfig] = useState<FundingRatioConfig | null>(null);
  const [milestones, setMilestones] = useState<FundingMilestone[]>([]);
  const [active, setActive] = useState<FundingPurchase | null>(null);
  const [customPaid, setCustomPaid] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchFundingRatios().then(setConfig);
    fetchFundingMilestones().then(setMilestones);
    fetchActiveFundingPurchase().then(setActive);
  }, []);

  const ratio = config?.ratio ?? 10;
  const paidAmount = selectedPreset ?? customPaid;
  const liveFunding = useMemo(() => quoteFunding(paidAmount, ratio), [paidAmount, ratio]);

  const amountValid =
    isPositiveDecimal(paidAmount) &&
    !!config &&
    compareDecimalStrings(paidAmount, config.minAmount) >= 0 &&
    compareDecimalStrings(paidAmount, config.maxAmount) <= 0;

  const onConfirm = async () => {
    if (!amountValid || submitting) return;
    setSubmitting(true);
    try {
      const purchase = await purchaseFunding(paidAmount, ratio);
      setActive(purchase);
      toast.success(t("funding.purchase_success"));
    } catch {
      toast.error(t("funding.invalid_amount"));
    } finally {
      setSubmitting(false);
    }
  };

  const onClose = async () => {
    if (!active) return;
    const { profitCredited } = await closeFundingPurchase(active.id);
    setActive(null);
    toast.success(`${t("funding.close_success")}: ${profitCredited} ${config?.currency ?? "USDT"}`);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("funding.title")}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{t("funding.subtitle")}</p>
      </div>

      {active ? (
        <ActivePosition
          purchase={active}
          currency={config?.currency ?? "USDT"}
          milestones={milestones}
          onClose={onClose}
          t={t}
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Purchase panel */}
          <Card className="border-border bg-card p-6 lg:col-span-2">
            <h2 className="mb-4 text-lg font-semibold">{t("funding.choose")}</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {config?.presets.map((p) => (
                <button
                  key={p.paid}
                  onClick={() => {
                    setSelectedPreset(p.paid);
                    setCustomPaid("");
                  }}
                  className={`rounded-lg border p-4 text-left transition-colors ${
                    selectedPreset === p.paid
                      ? "border-primary bg-primary/10"
                      : "border-border bg-secondary/20 hover:bg-secondary/40"
                  }`}
                >
                  <p className="text-xs text-muted-foreground">{t("funding.you_pay")}</p>
                  <p className="text-xl font-bold">
                    {p.paid} <span className="text-sm text-muted-foreground">{config.currency}</span>
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">{t("funding.you_get")}</p>
                  <p className="text-lg font-semibold text-primary">
                    {p.funding} <span className="text-sm text-muted-foreground">{config.currency}</span>
                  </p>
                </button>
              ))}
            </div>

            <div className="mt-6">
              <label className="mb-1.5 block text-sm font-medium">{t("funding.custom_amount")}</label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min={config?.minAmount}
                  max={config?.maxAmount}
                  step="any"
                  placeholder="0.00"
                  value={customPaid}
                  onChange={(e) => {
                    setCustomPaid(e.target.value);
                    setSelectedPreset(null);
                  }}
                  className="bg-secondary/30"
                />
                <span className="text-sm text-muted-foreground">→</span>
                <div className="rounded-md border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
                  {isPositiveDecimal(paidAmount) ? liveFunding : "0"} {config?.currency ?? "USDT"}
                </div>
              </div>
              {config && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {t("funding.min")} {config.minAmount} · {t("funding.max")} {config.maxAmount} ·{" "}
                  {t("funding.ratio_note")}
                </p>
              )}
              {paidAmount && !amountValid && (
                <p className="mt-1 text-xs text-destructive">{t("funding.invalid_amount")}</p>
              )}
            </div>

            <Button
              onClick={onConfirm}
              disabled={!amountValid || submitting}
              className="mt-6 w-full sm:w-auto"
            >
              {t("funding.confirm")}
              {isPositiveDecimal(paidAmount) && amountValid && ` — ${liveFunding} ${config?.currency ?? ""}`}
            </Button>
          </Card>

          {/* Restricted balance explainer + milestones */}
          <div className="space-y-6">
            <Card className="border-warning/40 bg-warning/5 p-5">
              <div className="mb-2 flex items-center gap-2">
                <Lock className="h-5 w-5 text-warning" />
                <h3 className="text-sm font-semibold">{t("funding.restricted_title")}</h3>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {t("funding.restricted_desc")}
              </p>
            </Card>

            <MilestoneTable milestones={milestones} note={t("funding.milestone_note")} title={t("funding.milestones_title")} />
          </div>
        </div>
      )}
    </div>
  );
}

function MilestoneTable({
  milestones,
  title,
  note,
}: {
  milestones: FundingMilestone[];
  title: string;
  note: string;
}) {
  return (
    <Card className="border-border bg-card p-5">
      <div className="mb-3 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-success" />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="overflow-x-auto">
      <table className="w-full whitespace-nowrap text-sm">
        <thead className="text-xs text-muted-foreground">
          <tr>
            <th className="py-1 text-left font-medium">Profit</th>
            <th className="py-1 text-right font-medium">Reward</th>
          </tr>
        </thead>
        <tbody>
          {milestones.map((m) => (
            <tr key={m.profitPct} className="border-t border-border">
              <td className="py-1.5 font-medium">{m.profitPct}%</td>
              <td className="py-1.5 text-right text-success">{m.rewardMultiplier}×</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      <p className="mt-3 flex gap-1.5 text-xs leading-relaxed text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        {note}
      </p>
    </Card>
  );
}

function ActivePosition({
  purchase,
  currency,
  milestones,
  onClose,
  t,
}: {
  purchase: FundingPurchase;
  currency: string;
  milestones: FundingMilestone[];
  onClose: () => void;
  t: (key: string) => string;
}) {
  const rows = [
    { label: t("funding.active.funding_balance"), value: `${purchase.fundingAmount} ${currency}` },
    { label: t("funding.active.current_loss"), value: `${purchase.currentLoss} ${currency}` },
    { label: t("funding.active.max_loss"), value: `${purchase.maxLossThreshold} ${currency}` },
    {
      label: t("funding.active.milestone"),
      value: purchase.highestMilestonePct ? `${purchase.highestMilestonePct}%` : "—",
    },
    { label: t("funding.active.eligible_reward"), value: `${purchase.eligibleReward} ${currency}` },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="border-border bg-card p-6 lg:col-span-2">
        <h2 className="mb-4 text-lg font-semibold">{t("funding.active.title")}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {rows.map((r) => (
            <div key={r.label} className="rounded-lg border border-border bg-secondary/20 p-4">
              <p className="text-xs text-muted-foreground">{r.label}</p>
              <p className="mt-1 text-lg font-bold">{r.value}</p>
            </div>
          ))}
        </div>

        <p className="mt-4 flex gap-1.5 text-xs leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {t("funding.active.no_redeem")}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          {/* REQ-104: no redeem button. "Continue Trading" simply keeps the position open. */}
          <Button variant="secondary">{t("funding.active.continue")}</Button>
          <Button variant="primary" onClick={onClose}>
            {t("funding.active.close")}
          </Button>
        </div>
      </Card>

      <MilestoneTable milestones={milestones} note={t("funding.milestone_note")} title={t("funding.milestones_title")} />
    </div>
  );
}
