"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  History,
  Wallet as WalletIcon,
  Lock,
  TrendingUp,
} from "lucide-react";
import { useLocaleStore } from "@/store/locale-store";
import { addDecimalStrings } from "@/lib/utils/decimal";
import {
  fetchWalletBalances,
  fetchWalletTotals,
  type WalletBalances,
  type WalletTotals,
} from "@/services/wallet.service";

export default function WalletPage() {
  const { t } = useLocaleStore();
  const [balances, setBalances] = useState<WalletBalances | null>(null);
  const [totals, setTotals] = useState<WalletTotals | null>(null);

  useEffect(() => {
    fetchWalletBalances().then(setBalances);
    fetchWalletTotals().then(setTotals);
  }, []);

  const available = balances?.available ?? "0.00";
  const funding = balances?.funding ?? "0.00";
  const profit = balances?.profit ?? "0.00";
  const total = addDecimalStrings(available, funding, profit);

  const cards = [
    {
      label: t("wallet.available_balance"),
      value: available,
      note: t("wallet.available_spendable"),
      icon: <WalletIcon className="h-5 w-5 text-primary" />,
      accent: "border-primary/30",
    },
    {
      label: t("wallet.funding_balance"),
      value: funding,
      note: t("wallet.funding_restricted"),
      icon: <Lock className="h-5 w-5 text-warning" />,
      accent: "border-warning/40 bg-warning/5",
    },
    {
      label: t("wallet.profit_balance"),
      value: profit,
      note: t("wallet.profit_withdrawable"),
      icon: <TrendingUp className="h-5 w-5 text-success" />,
      accent: "border-success/30",
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{t("wallet.title")}</h1>
        <div className="flex gap-2">
          <Link href="/wallet/deposit">
            <Button variant="primary" className="gap-2">
              <ArrowDownToLine className="h-4 w-4" /> {t("wallet.deposit")}
            </Button>
          </Link>
          <Link href="/wallet/withdraw">
            <Button variant="secondary" className="gap-2">
              <ArrowUpFromLine className="h-4 w-4" /> {t("wallet.withdraw")}
            </Button>
          </Link>
        </div>
      </div>

      {/* Total balance */}
      <Card className="flex flex-col items-center border-border bg-card p-6 text-center">
        <p className="mb-1 text-sm font-medium text-muted-foreground">
          {t("wallet.total_balance")}
        </p>
        <h2 className="text-4xl font-bold tracking-tighter">
          ${total} <span className="text-lg text-muted-foreground">{balances?.currency ?? "USDT"}</span>
        </h2>
      </Card>

      {/* Three-way split: Available / Funding (restricted) / Profit (withdrawable) */}
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.label} className={`border bg-card p-5 ${c.accent}`}>
            <div className="mb-3 flex items-center gap-2">
              {c.icon}
              <p className="text-sm font-semibold text-foreground">{c.label}</p>
            </div>
            <p className="mb-2 text-2xl font-bold tracking-tight">${c.value}</p>
            <p className="text-xs leading-relaxed text-muted-foreground">{c.note}</p>
          </Card>
        ))}
      </div>

      <div className="flex justify-center gap-8 border-t border-border pt-4 text-center">
        <div>
          <p className="mb-1 text-xs text-muted-foreground">{t("wallet.total_deposited")}</p>
          <p className="font-semibold">${totals?.totalDeposited ?? "0.00"}</p>
        </div>
        <div className="w-px bg-border" />
        <div>
          <p className="mb-1 text-xs text-muted-foreground">{t("wallet.total_withdrawn")}</p>
          <p className="font-semibold">${totals?.totalWithdrawn ?? "0.00"}</p>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-4 flex items-center gap-2">
          <History className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">{t("wallet.tx_history")}</h2>
          <Link href="/wallet/transactions" className="ml-auto text-sm text-primary hover:underline">
            {t("wallet.view_all")}
          </Link>
        </div>
        <Card className="overflow-hidden p-0">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-medium">{t("wallet.type")}</th>
                <th className="px-6 py-3 font-medium">{t("wallet.amount")}</th>
                <th className="px-6 py-3 font-medium">{t("wallet.status")}</th>
                <th className="px-6 py-3 font-medium">{t("wallet.date")}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                  {t("wallet.no_tx")}
                </td>
              </tr>
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
