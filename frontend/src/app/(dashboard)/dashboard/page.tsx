"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  Wallet as WalletIcon,
  Lock,
  TrendingUp,
  ArrowDownToLine,
  ArrowUpFromLine,
  History,
} from "lucide-react";
import { useLocaleStore } from "@/store/locale-store";
import { addDecimalStrings } from "@/lib/utils/decimal";
import {
  fetchWalletBalances,
  fetchRecentTransactions,
  type WalletBalances,
  type WalletTransaction,
} from "@/services/wallet.service";

export default function DashboardPage() {
  const { t } = useLocaleStore();
  const [balances, setBalances] = useState<WalletBalances | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);

  useEffect(() => {
    fetchWalletBalances().then(setBalances);
    fetchRecentTransactions().then(setTransactions);
  }, []);

  const available = balances?.available ?? "0.00";
  const funding = balances?.funding ?? "0.00";
  const profit = balances?.profit ?? "0.00";
  const currency = balances?.currency ?? "USDT";
  const fundingAsset = balances?.fundingAsset ?? "VUSDT";
  const total = addDecimalStrings(available, funding, profit);

  const breakdown = [
    { label: t("wallet.available_balance"), value: available, asset: currency, icon: WalletIcon, accent: "text-primary" },
    { label: t("wallet.funding_balance"), value: funding, asset: fundingAsset, icon: Lock, accent: "text-warning" },
    { label: t("wallet.profit_balance"), value: profit, asset: currency, icon: TrendingUp, accent: "text-success" },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <h1 className="text-2xl font-bold tracking-tight">{t("dashboard.title")}</h1>

      {/* Total balance + quick actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="flex items-center gap-4 border-l-4 border-l-primary p-6">
          <div className="rounded-full bg-primary/10 p-3 text-primary">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t("dashboard.total_balance")}</p>
            <h2 className="text-2xl font-bold">
              ${total} <span className="text-sm text-muted-foreground">{currency}</span>
            </h2>
          </div>
        </Card>

        <Card className="p-6 md:col-span-2">
          <p className="mb-3 text-sm font-medium text-muted-foreground">{t("dashboard.quick_actions")}</p>
          <div className="flex flex-wrap gap-2">
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
            <Link href="/trade/spot/BTCUSDT">
              <Button variant="outline" className="gap-2">
                {t("nav.spot")}
              </Button>
            </Link>
            <Link href="/funding">
              <Button variant="outline" className="gap-2">
                {t("nav.funding")}
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Three-way balance breakdown */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">{t("dashboard.balances")}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {breakdown.map((b) => (
            <Card key={b.label} className="flex items-center gap-3 border-border bg-card p-5">
              <b.icon className={`h-5 w-5 ${b.accent}`} />
              <div>
                <p className="text-xs text-muted-foreground">{b.label}</p>
                <p className="text-xl font-bold">
                  ${b.value} <span className="text-xs text-muted-foreground">{currency}</span>
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent transactions */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <History className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">{t("dashboard.recent_transactions")}</h2>
        </div>
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap text-left text-sm">
            <thead className="bg-secondary/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-medium">{t("wallet.type")}</th>
                <th className="px-6 py-3 font-medium">{t("wallet.amount")}</th>
                <th className="px-6 py-3 font-medium">{t("wallet.status")}</th>
                <th className="px-6 py-3 font-medium">{t("wallet.date")}</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                    {t("dashboard.no_transactions")}
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="border-t border-border">
                    <td className="px-6 py-3 capitalize">{tx.type.replace("_", " ")}</td>
                    <td className="px-6 py-3 font-mono">${tx.amount}</td>
                    <td className="px-6 py-3 capitalize text-muted-foreground">{tx.status}</td>
                    <td className="px-6 py-3 text-muted-foreground">{tx.createdAt}</td>
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
