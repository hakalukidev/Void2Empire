"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useLocaleStore } from "@/store/locale-store";
import { History, TrendingUp, TrendingDown } from "lucide-react";
import { SampleBadge } from "@/components/home/sample-badge";
import {
  absDecimalString,
  clampDecimalPlaces,
  compareDecimalStrings,
  formatDecimalString,
  multiplyDecimalByInteger,
} from "@/lib/utils/decimal";

type HistoryTab = "positions" | "orders" | "transactions" | "funding";

import { getMyFundingHistory, FundingHistoryEntry } from "@/services/futures-fees.service";
import { useEffect } from "react";

// No trading history backend exists yet, so these rows are layout samples and
// must carry SampleBadge. Money and quantity are decimal STRINGS (Sec46 rule #40)
// exactly as the backend will return them; nothing here is computed client-side
// except sign and presentation precision.
const HISTORY_POSITIONS = [
  { id: "POS-091", pair: "BTC-USDT", side: "Long",  leverage: 10, entryPrice: "60000", closePrice: "63000", size: "0.1", pnl: "300.00",  pnlPct: "5.00",  closedAt: "2024-09-20 15:22" },
  { id: "POS-090", pair: "ETH-USDT", side: "Short", leverage: 5,  entryPrice: "3600",  closePrice: "3500",  size: "0.5", pnl: "50.00",   pnlPct: "2.78",  closedAt: "2024-09-20 11:05" },
  { id: "POS-089", pair: "RIVER-USDT", side: "Long",  leverage: 20, entryPrice: "20.00", closePrice: "18.50", size: "10", pnl: "-15.00", pnlPct: "-7.50", closedAt: "2024-09-19 22:40" },
  { id: "POS-088", pair: "INF-USDT", side: "Long",  leverage: 5,  entryPrice: "0.55",  closePrice: "0.61",  size: "100", pnl: "6.00",    pnlPct: "10.91", closedAt: "2024-09-19 09:10" },
];

const HISTORY_ORDERS = [
  { id: "ORD-091", pair: "BTC-USDT", type: "Limit",  side: "Long",  price: "63000", amount: "0.1", status: "filled",    time: "2024-09-20 15:20" },
  { id: "ORD-090", pair: "ETH-USDT", type: "Market", side: "Short", price: "3600",  amount: "0.5", status: "filled",    time: "2024-09-20 10:55" },
  { id: "ORD-089", pair: "RIVER-USDT", type: "Limit",  side: "Long",  price: "18.90",   amount: "10",  status: "cancelled", time: "2024-09-19 20:00" },
];

const HISTORY_TX = [
  { id: "TX-012", type: "Deposit",    asset: "USDT", amount: "500",  status: "completed", date: "2024-09-18 10:00" },
  { id: "TX-011", type: "Withdrawal", asset: "BTC",  amount: "0.01", status: "completed", date: "2024-09-17 14:30" },
  { id: "TX-010", type: "Deposit",    asset: "USDT", amount: "1000", status: "completed", date: "2024-09-15 09:00" },
];

const TABS: { key: HistoryTab; labelKey: string }[] = [
  { key: "positions", labelKey: "history.tab_positions" },
  { key: "orders", labelKey: "history.tab_orders" },
  { key: "transactions", labelKey: "history.tab_transactions" },
  { key: "funding", labelKey: "history.tab_funding" },
];

// Sample rows carry Long/Short and Limit/Market as plain enums; the label comes
// from the same trade.* keys the order forms use, so the wording cannot drift.
const sideLabel = (side: string) => (side === "Long" ? "trade.long" : "trade.short");
const typeLabel = (type: string) => (type === "Limit" ? "trade.limit" : "trade.market");

export default function HistoryPage() {
  const { t } = useLocaleStore();
  const [tab, setTab] = useState<HistoryTab>("positions");
  const [fundingHistory, setFundingHistory] = useState<FundingHistoryEntry[]>([]);

  useEffect(() => {
    getMyFundingHistory().then(setFundingHistory);
  }, []);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <History className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">{t("history.title")}</h1>
        {/* Positions, orders and transactions are still local samples — no trading
            or ledger backend serves them yet. */}
        <SampleBadge className="ml-auto" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary/30 p-1 rounded-lg w-fit border border-border">
        {TABS.map(({ key, labelKey }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === key
                ? "bg-card text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t(labelKey)}
          </button>
        ))}
      </div>

      <Card className="overflow-hidden bg-card border-border">
        <div className="overflow-x-auto">

          {/* Closed Positions */}
          {tab === "positions" && (
            <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap text-sm text-left">
              <thead className="bg-secondary/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">{t("history.col_pair")}</th>
                  <th className="px-6 py-4 font-medium">{t("history.col_side")}</th>
                  <th className="px-6 py-4 font-medium">{t("history.col_size")}</th>
                  <th className="px-6 py-4 font-medium">{t("history.col_leverage")}</th>
                  <th className="px-6 py-4 font-medium">{t("history.col_entry")}</th>
                  <th className="px-6 py-4 font-medium">{t("history.col_close")}</th>
                  <th className="px-6 py-4 font-medium">{t("history.col_realized_pnl")}</th>
                  <th className="px-6 py-4 font-medium">{t("history.col_closed_at")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {HISTORY_POSITIONS.map((p) => {
                  const gain = compareDecimalStrings(p.pnl, "0") >= 0;
                  return (
                  <tr key={p.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4 font-bold">{p.pair}</td>
                    <td className={`px-6 py-4 font-semibold ${p.side === "Long" ? "text-success" : "text-danger"}`}>
                      <div className="flex items-center gap-1">
                        {p.side === "Long" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {t(sideLabel(p.side))}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono">{p.size}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-bold border border-primary/20">{p.leverage}x</span>
                    </td>
                    <td className="px-6 py-4 font-mono">${formatDecimalString(p.entryPrice, 2)}</td>
                    <td className="px-6 py-4 font-mono">${formatDecimalString(p.closePrice, 2)}</td>
                    <td className="px-6 py-4">
                      <div className={gain ? "text-success" : "text-danger"}>
                        <span className="font-bold">{gain ? "+" : "-"}${formatDecimalString(absDecimalString(p.pnl), 2)}</span>
                        <span className="text-xs ml-1 opacity-70">({gain ? "+" : "-"}{clampDecimalPlaces(absDecimalString(p.pnlPct), 2)}%)</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground whitespace-nowrap">{p.closedAt}</td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          )}

          {/* Order History */}
          {tab === "orders" && (
            <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap text-sm text-left">
              <thead className="bg-secondary/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">{t("history.col_order_id")}</th>
                  <th className="px-6 py-4 font-medium">{t("history.col_pair")}</th>
                  <th className="px-6 py-4 font-medium">{t("history.col_type")}</th>
                  <th className="px-6 py-4 font-medium">{t("history.col_side")}</th>
                  <th className="px-6 py-4 font-medium">{t("history.col_price")}</th>
                  <th className="px-6 py-4 font-medium">{t("history.col_amount")}</th>
                  <th className="px-6 py-4 font-medium">{t("history.col_status")}</th>
                  <th className="px-6 py-4 font-medium">{t("history.col_time")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {HISTORY_ORDERS.map((o) => (
                  <tr key={o.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{o.id}</td>
                    <td className="px-6 py-4 font-bold">{o.pair}</td>
                    <td className="px-6 py-4 text-muted-foreground">{t(typeLabel(o.type))}</td>
                    <td className={`px-6 py-4 font-semibold ${o.side === "Long" ? "text-success" : "text-danger"}`}>{t(sideLabel(o.side))}</td>
                    <td className="px-6 py-4 font-mono">${formatDecimalString(o.price, 2)}</td>
                    <td className="px-6 py-4 font-mono">{o.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        o.status === "filled" ? "bg-success/10 text-success border-success/20" : "bg-muted/30 text-muted-foreground border-border"
                      }`}>{t(`history.status_${o.status}`)}</span>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground whitespace-nowrap">{o.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}

          {/* Transactions */}
          {tab === "transactions" && (
            <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap text-sm text-left">
              <thead className="bg-secondary/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">{t("history.col_tx_id")}</th>
                  <th className="px-6 py-4 font-medium">{t("history.col_type")}</th>
                  <th className="px-6 py-4 font-medium">{t("history.col_asset")}</th>
                  <th className="px-6 py-4 font-medium">{t("history.col_amount")}</th>
                  <th className="px-6 py-4 font-medium">{t("history.col_status")}</th>
                  <th className="px-6 py-4 font-medium">{t("history.col_date")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {HISTORY_TX.map((tx) => (
                  <tr key={tx.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{tx.id}</td>
                    <td className={`px-6 py-4 font-semibold ${tx.type === "Deposit" ? "text-success" : "text-warning"}`}>
                      {tx.type === "Deposit" ? t("wallet.deposit") : t("wallet.withdraw")}
                    </td>
                    <td className="px-6 py-4 font-bold">{tx.asset}</td>
                    <td className="px-6 py-4 font-mono">{tx.amount}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20">
                        {t(`history.status_${tx.status}`)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground whitespace-nowrap">{tx.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}

          {/* Funding History */}
          {tab === "funding" && (
            <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap text-sm text-left">
              <thead className="bg-secondary/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">{t("history.col_settlement_id")}</th>
                  <th className="px-6 py-4 font-medium">{t("history.col_pair")}</th>
                  <th className="px-6 py-4 font-medium">{t("history.col_side")}</th>
                  <th className="px-6 py-4 font-medium">{t("history.col_margin")}</th>
                  <th className="px-6 py-4 font-medium">{t("history.col_rate")}</th>
                  <th className="px-6 py-4 font-medium">{t("history.col_amount")}</th>
                  <th className="px-6 py-4 font-medium">{t("history.col_date")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {fundingHistory.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">{t("history.no_funding")}</td></tr>
                ) : fundingHistory.map((f) => {
                  const isPaid = compareDecimalStrings(f.fundingAmount, "0") < 0;
                  return (
                    <tr key={f.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{f.id}</td>
                      <td className="px-6 py-4 font-bold">{f.pair}</td>
                      <td className={`px-6 py-4 font-semibold ${f.side === "Long" ? "text-success" : "text-danger"}`}>{t(sideLabel(f.side))}</td>
                      <td className="px-6 py-4 font-mono">{f.margin} USDT</td>
                      <td className="px-6 py-4 font-mono">{clampDecimalPlaces(multiplyDecimalByInteger(f.fundingRate, 100), 4)}%</td>
                      <td className="px-6 py-4">
                        <span className={`font-mono font-bold ${isPaid ? "text-warning" : "text-success"}`}>
                          {isPaid ? "-" : "+"}{formatDecimalString(absDecimalString(f.fundingAmount), 4)} USDT
                        </span>
                        <span className="text-[10px] ml-1.5 opacity-60 uppercase">{isPaid ? t("history.paid") : t("history.received")}</span>
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground whitespace-nowrap">{f.settledAt}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          )}

        </div>
      </Card>
    </div>
  );
}
