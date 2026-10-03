"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarChart2, Save, Edit } from "lucide-react";
import {
  getAllFundingConfigs,
  updateFundingConfig,
  FundingConfig,
  FUNDING_RATE,
} from "@/services/futures-fees.service";
import { clampDecimalPlaces, divideDecimalByInteger, formatDecimalString, isPositiveDecimal, multiplyDecimalByInteger } from "@/lib/utils/decimal";
import { cn } from "@/lib/utils/cn";
import {
  BINARY_MAX_STAKE,
  BINARY_MIN_STAKE,
  BINARY_PAYOUT_RATES,
  DEFAULT_BINARY_EXPIRIES,
} from "@/services/binary.service";

// LEVERAGE_MAX is the client's confirmed answer (v14 Q7: 5x to 50x).
// Everything else in this page's default state is an UNCONFIRMED placeholder —
// no spec value and no v14 answer covers it, so it must not be treated as a
// business rule until the DR items are answered.
const LEVERAGE_MAX = 50;

export default function AdminTradingSettingsPage() {
  // Money- and rate-valued fields are decimal STRINGS (Sec46 rule #40); only
  // genuine counts (leverage multiple, open-position limit) stay numbers. A
  // Number("0.02") state posts 0.019999999552965164 to the API.
  const [fees, setFees] = useState({ maker: "0.02", taker: "0.04", withdrawEth: "0.005", withdrawUsdt: "1" });
  const [futures, setFutures] = useState({ defaultLeverage: 10, maxLeverage: LEVERAGE_MAX, minMargin: "10" });
  const [binary, setBinary] = useState({
    payoutRate: "0.85",
    expiries: DEFAULT_BINARY_EXPIRIES.map((e) => e.seconds),
  });
  const [risk, setRisk] = useState({ maxOpenPos: 50, maxPosSize: "50000", circuitBreaker: "15" });

  const [fundingConfigs, setFundingConfigs] = useState<FundingConfig[]>([]);
  const [editingFunding, setEditingFunding] = useState<FundingConfig | null>(null);
  
  // Modal states
  const [editRate, setEditRate] = useState("");
  const [editInterval, setEditInterval] = useState<number>(8);
  const [editDirection, setEditDirection] = useState<"long_pays_short" | "short_pays_long">("long_pays_short");

  useEffect(() => {
    getAllFundingConfigs().then(setFundingConfigs);
  }, []);

  const handleSave = () => {
    // Save logic here
  };

  const openFundingEdit = (config: FundingConfig) => {
    setEditingFunding(config);
    // The config stores a decimal fraction; the field shows percent.
    setEditRate(multiplyDecimalByInteger(config.fundingRate, 100));
    setEditInterval(config.fundingIntervalHours);
    setEditDirection(config.fundingDirection);
  };

  const saveFundingEdit = async () => {
    if (!editingFunding) return;
    // A non-numeric or non-positive entry must not silently become a 0% rate.
    if (!isPositiveDecimal(editRate)) return;
    const updates = {
      fundingRate: divideDecimalByInteger(editRate, 100),
      fundingIntervalHours: editInterval,
      fundingDirection: editDirection,
    };
    await updateFundingConfig(editingFunding.marketId, updates);
    setFundingConfigs(await getAllFundingConfigs());
    setEditingFunding(null);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1000px] mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart2 className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Trading Settings</h1>
        </div>
        <Button onClick={handleSave} className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
          <Save className="w-4 h-4" /> Save Changes
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Fees */}
        <Card className="p-5 bg-card border-border space-y-4">
          <h2 className="font-semibold text-lg border-b border-border pb-2">Fee Settings</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Maker Fee (%)</label>
              <Input type="number" value={fees.maker} onChange={(e) => setFees({ ...fees, maker: e.target.value })} className="bg-secondary/30" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Taker Fee (%)</label>
              <Input type="number" value={fees.taker} onChange={(e) => setFees({ ...fees, taker: e.target.value })} className="bg-secondary/30" />
            </div>
            <div className="pt-2">
              <label className="text-xs font-medium text-muted-foreground">Default Withdrawal Fee (USDT)</label>
              <Input type="number" value={fees.withdrawUsdt} onChange={(e) => setFees({ ...fees, withdrawUsdt: e.target.value })} className="bg-secondary/30" />
            </div>
          </div>
        </Card>

        {/* Futures */}
        <Card className="p-5 bg-card border-border space-y-4">
          <h2 className="font-semibold text-lg border-b border-border pb-2">Futures Settings</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Default Leverage (x)</label>
              <Input type="number" value={futures.defaultLeverage} onChange={(e) => setFutures({ ...futures, defaultLeverage: Number(e.target.value) })} className="bg-secondary/30" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Global Max Leverage (x)</label>
              <Input type="number" value={futures.maxLeverage} onChange={(e) => setFutures({ ...futures, maxLeverage: Number(e.target.value) })} className="bg-secondary/30" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Minimum Margin (USDT)</label>
              <Input type="number" value={futures.minMargin} onChange={(e) => setFutures({ ...futures, minMargin: e.target.value })} className="bg-secondary/30" />
            </div>
          </div>
        </Card>

        {/* Binary Options */}
        <Card className="p-5 bg-card border-border space-y-4">
          <h2 className="font-semibold text-lg border-b border-border pb-2">Binary Options</h2>
          <div className="space-y-3">
            <div className="pt-2">
              <label className="text-xs font-medium text-muted-foreground block mb-2">Binary payout band</label>
              <div className="flex flex-wrap gap-2">
                {BINARY_PAYOUT_RATES.map((rate) => {
                  const pct = multiplyDecimalByInteger(rate, 100);
                  return (
                    <button
                      key={rate}
                      onClick={() => setBinary({ ...binary, payoutRate: rate })}
                      className={cn(
                        "rounded border px-3 py-1.5 text-xs font-medium transition-colors",
                        binary.payoutRate === rate
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-secondary text-muted-foreground"
                      )}
                    >
                      {pct}%
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                v20 Step 11 confirms this band and nothing else. A market&apos;s rate is the
                admin&apos;s choice from it — the client never supplied a per-market mapping, so the
                user screen previews the whole band instead of one number.
              </p>
            </div>
            <div className="pt-2">
              <label className="text-xs font-medium text-muted-foreground block mb-2">
                Allowed expiry durations
              </label>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_BINARY_EXPIRIES.map((time) => {
                  const on = binary.expiries.includes(time.seconds);
                  return (
                    <button
                      key={time.seconds}
                      onClick={() =>
                        setBinary({
                          ...binary,
                          expiries: on
                            ? binary.expiries.filter((s) => s !== time.seconds)
                            : [...binary.expiries, time.seconds].sort((a, b) => a - b),
                        })
                      }
                      className={cn(
                        "rounded border px-3 py-1.5 text-xs font-medium transition-colors",
                        on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-secondary text-muted-foreground"
                      )}
                    >
                      {time.label}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                v20 Q13 names 15s, 30s, 1m, 5m, 30m and 1h, and says the admin may configure which
                of them are offered.
              </p>
            </div>
            <p className="rounded-lg border border-border bg-secondary/20 p-3 text-xs leading-relaxed text-muted-foreground">
              Stake range is fixed by the client at ${formatDecimalString(BINARY_MIN_STAKE, 0)}–$
              {formatDecimalString(BINARY_MAX_STAKE, 0)} per trade (v20 Q13), so it is not an
              operator setting here.
            </p>
          </div>
        </Card>

        {/* Risk Management */}
        <Card className="p-5 bg-card border-border space-y-4">
          <h2 className="font-semibold text-lg border-b border-border pb-2">Risk Controls</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Max Open Positions Per User</label>
              <Input type="number" value={risk.maxOpenPos} onChange={(e) => setRisk({ ...risk, maxOpenPos: Number(e.target.value) })} className="bg-secondary/30" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Max Position Size (USDT Notional)</label>
              <Input type="number" value={risk.maxPosSize} onChange={(e) => setRisk({ ...risk, maxPosSize: e.target.value })} className="bg-secondary/30" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Circuit Breaker Price Drop (%)</label>
              <Input type="number" value={risk.circuitBreaker} onChange={(e) => setRisk({ ...risk, circuitBreaker: e.target.value })} className="bg-secondary/30" />
            </div>
          </div>
        </Card>
      </div>

      {/* Per-Market Funding Configuration */}
      <Card className="border-border">
        <div className="p-5 border-b border-border">
          <h2 className="font-semibold text-lg">Per-Market Funding Configuration</h2>
          <p className="text-sm text-muted-foreground">Manage funding rates, intervals, and directions for each futures pair.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Market</th>
                <th className="px-5 py-3 font-medium">Funding Rate (%)</th>
                <th className="px-5 py-3 font-medium">Interval</th>
                <th className="px-5 py-3 font-medium">Direction</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {fundingConfigs.map(config => (
                <tr key={config.marketId} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-5 py-3 font-bold">{config.pair}</td>
                  <td className="px-5 py-3 font-mono">{clampDecimalPlaces(multiplyDecimalByInteger(config.fundingRate, 100), 4)}%</td>
                  <td className="px-5 py-3">{config.fundingIntervalHours} hours</td>
                  <td className="px-5 py-3 capitalize">{config.fundingDirection === "long_pays_short" ? "Long → Short" : "Short → Long"}</td>
                  <td className="px-5 py-3 text-right">
                    <Button onClick={() => openFundingEdit(config)} variant="secondary" size="sm" className="h-8 gap-1 border-border">
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit Funding Modal */}
      {editingFunding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-sm p-6 bg-card border-border space-y-4">
            <h2 className="font-bold text-lg border-b border-border pb-2">Edit Funding: {editingFunding.pair}</h2>
            
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Funding Rate (%)</label>
              <Input type="number" step="0.0001" value={editRate} onChange={e => setEditRate(e.target.value)} className="bg-secondary/30" />
              {/* The client's answer fixes funding at 2% of margin; showing it here keeps
                  an operator from typing a rate that silently changes that rule. */}
              <p className="mt-1 text-xs text-muted-foreground">
                Confirmed by the client (v14 Q10): {multiplyDecimalByInteger(FUNDING_RATE, 100)}% of margin.
              </p>
              {!isPositiveDecimal(editRate) && (
                <p className="mt-1 text-xs text-danger">Enter a positive rate, e.g. 2.</p>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Interval (Hours)</label>
              <div className="flex gap-2">
                {[1, 4, 8].map(h => (
                  <button key={h} onClick={() => setEditInterval(h)}
                    className={`flex-1 py-1.5 rounded text-sm font-medium border ${editInterval === h ? "bg-primary border-primary text-primary-foreground" : "bg-secondary border-border"}`}>
                    {h}h
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Funding Direction</label>
              <select 
                value={editDirection} 
                onChange={e => setEditDirection(e.target.value as "long_pays_short" | "short_pays_long")}
                className="w-full h-10 px-3 rounded-md bg-secondary/30 border border-border text-sm"
              >
                <option value="long_pays_short">Long Pays Short</option>
                <option value="short_pays_long">Short Pays Long</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={() => setEditingFunding(null)} variant="secondary" className="flex-1">Cancel</Button>
              <Button onClick={saveFundingEdit} disabled={!isPositiveDecimal(editRate)} className="flex-1 bg-primary text-primary-foreground font-bold">Save Changes</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
