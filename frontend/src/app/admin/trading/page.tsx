"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarChart2, Save, Edit } from "lucide-react";
import { 
  getAllFundingConfigs, 
  updateFundingConfig, 
  FundingConfig 
} from "@/services/futures-fees.service";

export default function AdminTradingSettingsPage() {
  const [fees, setFees] = useState({ maker: 0.02, taker: 0.04, withdrawEth: 0.005, withdrawUsdt: 1 });
  const [futures, setFutures] = useState({ defaultLeverage: 10, maxLeverage: 100, minMargin: 10 });
  const [binary, setBinary] = useState({ defaultPayout: 85, time30s: true, time1m: true, time3m: true, time5m: true, time15m: true });
  const [risk, setRisk] = useState({ maxOpenPos: 50, maxPosSize: 50000, circuitBreaker: 15 });

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
    setEditRate((config.fundingRate * 100).toString());
    setEditInterval(config.fundingInterval);
    setEditDirection(config.fundingDirection);
  };

  const saveFundingEdit = async () => {
    if (!editingFunding) return;
    const updates = {
      fundingRate: parseFloat(editRate) / 100,
      fundingInterval: editInterval,
      fundingDirection: editDirection,
    };
    await updateFundingConfig(editingFunding.marketId, updates);
    setFundingConfigs(await getAllFundingConfigs());
    setEditingFunding(null);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1000px] mx-auto">
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
              <Input type="number" value={fees.maker} onChange={(e) => setFees({ ...fees, maker: Number(e.target.value) })} className="bg-secondary/30" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Taker Fee (%)</label>
              <Input type="number" value={fees.taker} onChange={(e) => setFees({ ...fees, taker: Number(e.target.value) })} className="bg-secondary/30" />
            </div>
            <div className="pt-2">
              <label className="text-xs font-medium text-muted-foreground">Default Withdrawal Fee (USDT)</label>
              <Input type="number" value={fees.withdrawUsdt} onChange={(e) => setFees({ ...fees, withdrawUsdt: Number(e.target.value) })} className="bg-secondary/30" />
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
              <Input type="number" value={futures.minMargin} onChange={(e) => setFutures({ ...futures, minMargin: Number(e.target.value) })} className="bg-secondary/30" />
            </div>
          </div>
        </Card>

        {/* Binary Options */}
        <Card className="p-5 bg-card border-border space-y-4">
          <h2 className="font-semibold text-lg border-b border-border pb-2">Binary Options</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Default Payout (%)</label>
              <Input type="number" value={binary.defaultPayout} onChange={(e) => setBinary({ ...binary, defaultPayout: Number(e.target.value) })} className="bg-secondary/30" />
            </div>
            <div className="pt-2">
              <label className="text-xs font-medium text-muted-foreground block mb-2">Allowed Expiration Times</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: "time30s", label: "30s" },
                  { key: "time1m", label: "1m" },
                  { key: "time3m", label: "3m" },
                  { key: "time5m", label: "5m" },
                  { key: "time15m", label: "15m" }
                ].map((time) => (
                  <button
                    key={time.key}
                    onClick={() => setBinary({ ...binary, [time.key]: !binary[time.key as keyof typeof binary] })}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                      binary[time.key as keyof typeof binary] ? "bg-primary/20 text-primary border border-primary/30" : "bg-secondary text-muted-foreground border border-border"
                    }`}
                  >
                    {time.label}
                  </button>
                ))}
              </div>
            </div>
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
              <Input type="number" value={risk.maxPosSize} onChange={(e) => setRisk({ ...risk, maxPosSize: Number(e.target.value) })} className="bg-secondary/30" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Circuit Breaker Price Drop (%)</label>
              <Input type="number" value={risk.circuitBreaker} onChange={(e) => setRisk({ ...risk, circuitBreaker: Number(e.target.value) })} className="bg-secondary/30" />
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
                  <td className="px-5 py-3 font-mono">{(config.fundingRate * 100).toFixed(4)}%</td>
                  <td className="px-5 py-3">{config.fundingInterval} hours</td>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-sm p-6 bg-card border-border space-y-4">
            <h2 className="font-bold text-lg border-b border-border pb-2">Edit Funding: {editingFunding.pair}</h2>
            
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Funding Rate (%)</label>
              <Input type="number" step="0.0001" value={editRate} onChange={e => setEditRate(e.target.value)} className="bg-secondary/30" />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Interval (Hours)</label>
              <div className="flex gap-2">
                {[1, 4, 8].map(h => (
                  <button key={h} onClick={() => setEditInterval(h)}
                    className={`flex-1 py-1.5 rounded text-sm font-medium border ${editInterval === h ? "bg-primary/20 border-primary text-primary" : "bg-secondary border-border"}`}>
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
              <Button onClick={saveFundingEdit} className="flex-1 bg-primary text-primary-foreground font-bold">Save Changes</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
