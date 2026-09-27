"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useLocaleStore } from "@/store/locale-store";
import { Trophy, TrendingUp, TrendingDown, Medal } from "lucide-react";

type Period = "daily" | "weekly" | "monthly" | "alltime";
type Category = "pnl" | "volume" | "winrate";

const MOCK_TRADERS = [
  { rank: 1,  name: "CryptoKing",   avatar: "CK", pnl: 48230.50, pnlPct: 182.4, volume: "2.1M",  winRate: 78, trades: 412 },
  { rank: 2,  name: "NightTrader",  avatar: "NT", pnl: 35600.10, pnlPct: 140.2, volume: "1.8M",  winRate: 71, trades: 380 },
  { rank: 3,  name: "BullRunner",   avatar: "BR", pnl: 28900.75, pnlPct: 115.6, volume: "1.3M",  winRate: 69, trades: 295 },
  { rank: 4,  name: "AlphaWolf",    avatar: "AW", pnl: 21400.30, pnlPct: 85.7,  volume: "980K",  winRate: 65, trades: 241 },
  { rank: 5,  name: "SatoshiProX",  avatar: "SP", pnl: 18750.00, pnlPct: 75.0,  volume: "850K",  winRate: 63, trades: 210 },
  { rank: 6,  name: "EthereumElite",avatar: "EE", pnl: 15200.40, pnlPct: 60.8,  volume: "740K",  winRate: 61, trades: 198 },
  { rank: 7,  name: "DeFiHunter",   avatar: "DH", pnl: 12800.90, pnlPct: 51.2,  volume: "620K",  winRate: 58, trades: 176 },
  { rank: 8,  name: "MoonShot99",   avatar: "MS", pnl: 10500.60, pnlPct: 42.0,  volume: "510K",  winRate: 57, trades: 154 },
  { rank: 9,  name: "QuantEdge",    avatar: "QE", pnl: 9200.15,  pnlPct: 36.8,  volume: "430K",  winRate: 55, trades: 132 },
  { rank: 10, name: "DiamondHands", avatar: "DH", pnl: 8100.80,  pnlPct: 32.4,  volume: "390K",  winRate: 54, trades: 118 },
];

const PERIODS: { key: Period; label: string }[] = [
  { key: "daily",   label: "Today" },
  { key: "weekly",  label: "This Week" },
  { key: "monthly", label: "This Month" },
  { key: "alltime", label: "All Time" },
];

const CATEGORIES: { key: Category; label: string }[] = [
  { key: "pnl",     label: "Top PnL" },
  { key: "volume",  label: "Top Volume" },
  { key: "winrate", label: "Win Rate" },
];

const RANK_MEDAL_COLOR: Record<number, string> = {
  1: "text-brand-gold-400",
  2: "text-muted-foreground",
  3: "text-amber-600",
};

const PODIUM_RING: Record<number, string> = {
  1: "ring-brand-gold-400/60 bg-brand-gold-400/10",
  2: "ring-slate-400/60 bg-slate-400/10",
  3: "ring-amber-600/60 bg-amber-600/10",
};

export default function LeaderboardPage() {
  const { t } = useLocaleStore();
  const [period, setPeriod] = useState<Period>("weekly");
  const [category, setCategory] = useState<Category>("pnl");

  const top3 = MOCK_TRADERS.slice(0, 3);
  const rest  = MOCK_TRADERS.slice(3);

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Trophy className="w-7 h-7 text-brand-gold-400" />
        <h1 className="text-2xl font-bold tracking-tight">Leaderboard</h1>
      </div>

      {/* Period + Category filters */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex gap-1 bg-secondary/30 p-1 rounded-lg border border-border w-fit">
          {PERIODS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                period === key
                  ? "bg-card text-foreground border border-border shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex gap-1 bg-secondary/30 p-1 rounded-lg border border-border w-fit">
          {CATEGORIES.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setCategory(key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                category === key
                  ? "bg-primary/10 text-primary border border-primary/30 shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-4 items-end">
        {/* 2nd place */}
        <Card className={`p-6 flex flex-col items-center text-center bg-card border-border ring-2 ${PODIUM_RING[2]} h-48`}>
          <Medal className={`w-6 h-6 mb-2 ${RANK_MEDAL_COLOR[2]}`} />
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center font-bold text-sm mb-2 ring-2 ring-slate-400/40">
            {top3[1].avatar}
          </div>
          <p className="font-semibold text-sm truncate w-full">{top3[1].name}</p>
          <p className="text-xs text-muted-foreground mt-1"># 2</p>
          <p className="text-success font-bold mt-1">+${top3[1].pnl.toLocaleString()}</p>
        </Card>

        {/* 1st place — taller */}
        <Card className={`p-6 flex flex-col items-center text-center bg-card border-border ring-2 ${PODIUM_RING[1]} h-60 relative overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-to-b from-brand-gold-400/5 to-transparent pointer-events-none" />
          <Trophy className="w-7 h-7 text-brand-gold-400 mb-2" />
          <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center font-bold text-base mb-2 ring-2 ring-brand-gold-400/60">
            {top3[0].avatar}
          </div>
          <p className="font-bold truncate w-full">{top3[0].name}</p>
          <p className="text-xs text-muted-foreground mt-1"># 1</p>
          <p className="text-success font-bold text-lg mt-1">+${top3[0].pnl.toLocaleString()}</p>
          <p className="text-xs text-success">+{top3[0].pnlPct}%</p>
        </Card>

        {/* 3rd place */}
        <Card className={`p-6 flex flex-col items-center text-center bg-card border-border ring-2 ${PODIUM_RING[3]} h-44`}>
          <Medal className={`w-6 h-6 mb-2 ${RANK_MEDAL_COLOR[3]}`} />
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center font-bold text-sm mb-2 ring-2 ring-amber-600/40">
            {top3[2].avatar}
          </div>
          <p className="font-semibold text-sm truncate w-full">{top3[2].name}</p>
          <p className="text-xs text-muted-foreground mt-1"># 3</p>
          <p className="text-success font-bold mt-1">+${top3[2].pnl.toLocaleString()}</p>
        </Card>
      </div>

      {/* Full Rankings Table */}
      <Card className="overflow-hidden bg-card border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium w-16">Rank</th>
                <th className="px-6 py-4 font-medium">Trader</th>
                <th className="px-6 py-4 font-medium text-right">Realized PnL</th>
                <th className="px-6 py-4 font-medium text-right hidden md:table-cell">PnL %</th>
                <th className="px-6 py-4 font-medium text-right hidden md:table-cell">Volume</th>
                <th className="px-6 py-4 font-medium text-right hidden lg:table-cell">Win Rate</th>
                <th className="px-6 py-4 font-medium text-right hidden lg:table-cell">Trades</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {MOCK_TRADERS.map((trader) => (
                <tr
                  key={trader.rank}
                  className="hover:bg-secondary/20 transition-colors group"
                >
                  <td className="px-6 py-4">
                    {trader.rank <= 3 ? (
                      <Medal className={`w-5 h-5 ${RANK_MEDAL_COLOR[trader.rank]}`} />
                    ) : (
                      <span className="text-muted-foreground font-mono">#{trader.rank}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-xs font-bold shrink-0 ${trader.rank <= 3 ? `ring-2 ${PODIUM_RING[trader.rank]}` : ""}`}>
                        {trader.avatar}
                      </div>
                      <span className="font-semibold">{trader.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-success">
                    +${trader.pnl.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right hidden md:table-cell">
                    <span className="text-success font-medium">+{trader.pnlPct}%</span>
                  </td>
                  <td className="px-6 py-4 text-right text-muted-foreground hidden md:table-cell">
                    ${trader.volume}
                  </td>
                  <td className="px-6 py-4 text-right hidden lg:table-cell">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-20 bg-secondary rounded-full h-1.5">
                        <div
                          className="bg-primary h-1.5 rounded-full"
                          style={{ width: `${trader.winRate}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-foreground w-8 text-right">{trader.winRate}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-muted-foreground hidden lg:table-cell">
                    {trader.trades}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
