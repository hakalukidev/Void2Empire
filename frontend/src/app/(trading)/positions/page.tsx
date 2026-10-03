"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart2, TrendingUp, TrendingDown } from "lucide-react";
import { useLocaleStore } from "@/store/locale-store";
import { addDecimalStrings, compareDecimalStrings, formatDecimalString } from "@/lib/utils/decimal";
import {
  fetchOpenPositions,
  fetchPositionsSummary,
  FuturesPosition,
} from "@/services/futures-positions.service";

const sign = (value: string) => (compareDecimalStrings(value, "0") >= 0 ? "+" : "");
const isNeg = (value: string) => compareDecimalStrings(value, "0") < 0;

export default function PositionsPage() {
  const { t } = useLocaleStore();
  const [positions, setPositions] = useState<FuturesPosition[]>([]);
  const [accountEquity, setAccountEquity] = useState("0.00");

  useEffect(() => {
    fetchOpenPositions().then(setPositions);
    fetchPositionsSummary().then((s) => setAccountEquity(s.accountEquity));
  }, []);

  // Sums stay in decimal-string arithmetic (Sec46 rule #40); grouping happens
  // only at render time.
  const totalPnl = addDecimalStrings(...positions.map((p) => p.pnl));
  const totalMargin = addDecimalStrings(...positions.map((p) => p.margin));

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <BarChart2 className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">{t("positions.title")}</h1>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-card border-border">
          <p className="text-xs text-muted-foreground mb-1">{t("positions.open_count")}</p>
          <p className="text-2xl font-bold">{positions.length}</p>
        </Card>
        <Card className="p-4 bg-card border-border">
          <p className="text-xs text-muted-foreground mb-1">{t("positions.total_margin")}</p>
          <p className="text-2xl font-bold">${formatDecimalString(totalMargin, 2)}</p>
        </Card>
        <Card className="p-4 bg-card border-border border-l-4 border-l-success">
          <p className="text-xs text-muted-foreground mb-1">{t("demo.unrealized_pnl")}</p>
          <p className={`text-2xl font-bold ${isNeg(totalPnl) ? "text-danger" : "text-success"}`}>
            {sign(totalPnl)}${formatDecimalString(totalPnl, 2)}
          </p>
        </Card>
        <Card className="p-4 bg-card border-border">
          <p className="text-xs text-muted-foreground mb-1">{t("positions.account_equity")}</p>
          <p className="text-2xl font-bold">${formatDecimalString(accountEquity, 2)}</p>
        </Card>
      </div>

      <Card className="overflow-hidden bg-card border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">{t("history.col_pair")}</th>
                <th className="px-6 py-4 font-medium">{t("history.col_side")}</th>
                <th className="px-6 py-4 font-medium">{t("history.col_size")}</th>
                <th className="px-6 py-4 font-medium">{t("trade.leverage")}</th>
                <th className="px-6 py-4 font-medium">{t("positions.col_entry_price")}</th>
                <th className="px-6 py-4 font-medium">{t("futures.mark_price")}</th>
                <th className="px-6 py-4 font-medium">{t("positions.col_liq_price")}</th>
                <th className="px-6 py-4 font-medium">{t("futures.margin")}</th>
                <th className="px-6 py-4 font-medium">{t("positions.col_pnl")}</th>
                <th className="px-6 py-4 font-medium text-right">{t("markets.action")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {positions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-muted-foreground">
                    {t("positions.empty")}
                  </td>
                </tr>
              ) : positions.map((pos) => (
                <tr key={pos.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-6 py-4 font-bold">{pos.pair}</td>
                  <td className={`px-6 py-4 font-semibold flex items-center gap-1 ${pos.side === "Long" ? "text-success" : "text-danger"}`}>
                    {pos.side === "Long" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {t(pos.side === "Long" ? "trade.long" : "trade.short")}
                  </td>
                  <td className="px-6 py-4 font-mono">{pos.size}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                      {pos.leverage}x
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono">${formatDecimalString(pos.entryPrice, 2)}</td>
                  <td className="px-6 py-4 font-mono">${formatDecimalString(pos.markPrice, 2)}</td>
                  <td className="px-6 py-4 font-mono text-danger">${formatDecimalString(pos.liqPrice, 2)}</td>
                  <td className="px-6 py-4 font-mono">${formatDecimalString(pos.margin, 2)}</td>
                  <td className="px-6 py-4">
                    <div className={isNeg(pos.pnl) ? "text-danger" : "text-success"}>
                      <div className="font-bold">{sign(pos.pnl)}${formatDecimalString(pos.pnl, 2)}</div>
                      <div className="text-xs opacity-70">{sign(pos.pnlPct)}{pos.pnlPct}%</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button size="sm" variant="secondary" className="h-8 text-xs border-danger/30 text-danger hover:bg-danger/10">
                      {t("wallet.close")}
                    </Button>
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
