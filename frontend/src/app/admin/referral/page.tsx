"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { REFERRAL_REWARD_PERCENT } from "@/services/referral.service";
import { formatDecimalString, isPositiveDecimal } from "@/lib/utils/decimal";
import { HandCoins, Save, ExternalLink } from "lucide-react";

// The rate the client confirmed in clarification v20 (Q39): 0.01% of each
// DEPOSIT a referred user makes. REQ-079 still lets an admin reconfigure it, so
// the field is editable — but it starts from the confirmed number, and it is
// handled as a decimal string, never a float (Sec46 rule #40).

export default function AdminReferralPage() {
  const [ratePercent, setRatePercent] = useState(REFERRAL_REWARD_PERCENT);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1200px] mx-auto">
      <div className="flex items-center gap-3">
        <HandCoins className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Referral Program Settings</h1>
      </div>

      <Card className="p-5 bg-card border-border space-y-4">
        <div>
          <h2 className="font-semibold text-lg border-b border-border pb-2">Reward Rule</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            The reward is a share of each deposit the referred user makes, not of their trading
            fees, and the referral relationship never expires.
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
            Reward rate (% of each deposit)
          </label>
          <div className="flex gap-3">
            {/* The Save button does nothing yet: no referral_rates table is exposed by
                the API, so a saved rate would be lost on reload. */}
            <Input
              value={ratePercent}
              onChange={(e) => setRatePercent(e.target.value)}
              inputMode="decimal"
              className="bg-secondary/30 w-32 font-mono"
            />
            <Button disabled={!isPositiveDecimal(ratePercent)} className="gap-2 bg-primary hover:bg-primary/90">
              <Save className="w-4 h-4" /> Save
            </Button>
          </div>
          {!isPositiveDecimal(ratePercent) && (
            <p className="mt-2 text-xs text-danger">Enter a decimal rate greater than zero.</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
          <div className="p-4 bg-secondary/30 rounded-lg border border-border">
            <p className="text-xs text-muted-foreground mb-1">Total Referrals</p>
            {/* No referral ledger is served by the API yet, so these report nothing
                instead of showing invented totals on a financial screen. */}
            <p className="text-xl font-bold">0</p>
          </div>
          <div className="p-4 bg-secondary/30 rounded-lg border border-border">
            <p className="text-xs text-muted-foreground mb-1">Total Paid (USDT)</p>
            <p className="text-xl font-bold text-success">${formatDecimalString("0", 2)}</p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Multi-level referral structure, reward caps, reversal handling and payout restrictions are
          still awaiting a written decision, so they are not configurable here.
        </p>
      </Card>

      {/* The old "Funding Plans" card on this screen offered Bronze/Silver/Gold plans
          with APY figures the client never defined. The funding product is Void2Empire
          Funding (VUSDT, WA-1) and is managed on its own page. */}
      <Card className="p-5 bg-card border-border">
        <h2 className="font-semibold text-lg">Funding System</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Void2Empire Funding (VUSDT) product settings live in their own section.
        </p>
        <Link
          href="/admin/funding-system"
          className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-secondary px-4 text-sm font-medium transition-colors hover:opacity-90"
        >
          <ExternalLink className="w-4 h-4" /> Manage Funding System
        </Link>
      </Card>
    </div>
  );
}
