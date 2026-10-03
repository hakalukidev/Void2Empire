"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  fetchAdminFundingConfig,
  saveAdminFundingConfig,
  fetchAdminMilestones,
  saveAdminMilestones,
  FUNDING_TRADING_LEVERAGE,
  type FundingRatioConfig,
  type FundingPreset,
  type FundingMilestone,
} from "@/services/funding.service";
import toast from "react-hot-toast";
import { Info, Plus, Trash2 } from "lucide-react";

export default function AdminFundingSystemPage() {
  const [config, setConfig] = useState<FundingRatioConfig | null>(null);
  const [milestones, setMilestones] = useState<FundingMilestone[]>([]);

  useEffect(() => {
    fetchAdminFundingConfig().then((c) => setConfig({ ...c, presets: c.presets.map((p) => ({ ...p })) }));
    fetchAdminMilestones().then((m) => setMilestones(m.map((x) => ({ ...x }))));
  }, []);

  if (!config) return null;

  const updatePreset = (i: number, patch: Partial<FundingPreset>) =>
    setConfig((c) => c && { ...c, presets: c.presets.map((p, idx) => (idx === i ? { ...p, ...patch } : p)) });

  const addPreset = () =>
    setConfig((c) => c && { ...c, presets: [...c.presets, { paid: "", funding: "" }] });

  const removePreset = (i: number) =>
    setConfig((c) => c && { ...c, presets: c.presets.filter((_, idx) => idx !== i) });

  const onSaveConfig = async () => {
    await saveAdminFundingConfig(config);
    toast.success("Funding ratio & presets saved");
  };

  const onSaveMilestones = async () => {
    await saveAdminMilestones(milestones);
    toast.success("Milestone table saved");
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Funding System (WA-1)</h1>
        <p className="mt-1 text-muted-foreground">
          Manage the funding purchase ratio, presets, bounds, and the profit-milestone reward
          table. <span>Permission: funding.manage</span>
        </p>
        <p className="mt-2 flex gap-1.5 text-xs leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          The Funding Balance is denominated in VUSDT and nothing else, and the Funding
          System&apos;s {FUNDING_TRADING_LEVERAGE}× trading leverage is fixed. Neither is a
          setting on this page — the ratio above is the purchase multiplier only.
        </p>
      </div>

      {/* Ratio & bounds */}
      <Card className="border-border bg-card p-5">
        <h2 className="mb-4 text-lg font-semibold">Ratio & Bounds</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Field label="Paid currency">
            <Input value={config.currency} onChange={(e) => setConfig({ ...config, currency: e.target.value })} />
          </Field>
          <Field label="Funding asset">
            {/* Read-only: the asset is a confirmed rule, not an admin setting. */}
            <div className="flex h-10 items-center rounded-md border border-input bg-secondary/30 px-3 text-sm font-medium">
              {config.fundingAsset}
            </div>
          </Field>
          <Field label="Ratio (×)">
            <Input
              type="number"
              value={config.ratio}
              onChange={(e) => setConfig({ ...config, ratio: Number(e.target.value) })}
            />
          </Field>
          <Field label="Min paid amount">
            <Input value={config.minAmount} onChange={(e) => setConfig({ ...config, minAmount: e.target.value })} />
          </Field>
          <Field label="Max paid amount">
            <Input value={config.maxAmount} onChange={(e) => setConfig({ ...config, maxAmount: e.target.value })} />
          </Field>
        </div>
      </Card>

      {/* Presets */}
      <Card className="border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Purchase Presets</h2>
          <Button size="sm" variant="secondary" onClick={addPreset} className="gap-1.5">
            <Plus className="h-4 w-4" /> Add preset
          </Button>
        </div>
        <div className="space-y-2">
          <div className="grid grid-cols-[1fr_1fr_auto] gap-3 text-xs font-medium text-muted-foreground">
            <span>Paid ({config.currency})</span>
            <span>Funding granted ({config.fundingAsset})</span>
            <span />
          </div>
          {config.presets.map((p, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_auto] items-center gap-3">
              <Input value={p.paid} onChange={(e) => updatePreset(i, { paid: e.target.value })} />
              <Input value={p.funding} onChange={(e) => updatePreset(i, { funding: e.target.value })} />
              <Button size="sm" variant="ghost" onClick={() => removePreset(i)} aria-label="Remove preset">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={onSaveConfig}>Save ratio & presets</Button>
        </div>
      </Card>

      {/* Milestones */}
      <Card className="border-border bg-card p-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Profit Milestones</h2>
          <Button
            size="sm"
            variant="secondary"
            className="gap-1.5"
            onClick={() => setMilestones([...milestones, { profitPct: 0, rewardMultiplier: 0 }])}
          >
            <Plus className="h-4 w-4" /> Add milestone
          </Button>
        </div>
        <p className="mb-4 flex gap-1.5 text-xs leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Reward = funding amount × multiplier, paid for the highest milestone reached at
          user-initiated close. The table is the source of truth — the formula beyond the seeded
          points is unresolved (DR-051) and must not be assumed in code.
        </p>
        <div className="space-y-2">
          <div className="grid grid-cols-[1fr_1fr_auto] gap-3 text-xs font-medium text-muted-foreground">
            <span>Profit %</span>
            <span>Reward multiplier (×)</span>
            <span />
          </div>
          {milestones.map((m, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_auto] items-center gap-3">
              <Input
                type="number"
                value={m.profitPct}
                onChange={(e) =>
                  setMilestones(milestones.map((x, idx) => (idx === i ? { ...x, profitPct: Number(e.target.value) } : x)))
                }
              />
              <Input
                type="number"
                value={m.rewardMultiplier}
                onChange={(e) =>
                  setMilestones(
                    milestones.map((x, idx) => (idx === i ? { ...x, rewardMultiplier: Number(e.target.value) } : x))
                  )
                }
              />
              <Button
                size="sm"
                variant="ghost"
                aria-label="Remove milestone"
                onClick={() => setMilestones(milestones.filter((_, idx) => idx !== i))}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={onSaveMilestones}>Save milestones</Button>
        </div>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
