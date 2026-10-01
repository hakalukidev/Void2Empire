"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocaleStore } from "@/store/locale-store";
import { isPositiveDecimal, compareDecimalStrings } from "@/lib/utils/decimal";
import { fetchWalletBalances, WalletBalances } from "@/services/wallet.service";
import {
  requestWithdrawal,
  cancelWithdrawal,
  Withdrawal,
  WithdrawalSource,
  WithdrawalStatus,
} from "@/services/payments.service";
import toast from "react-hot-toast";
import { ArrowUpFromLine, Lock, Info } from "lucide-react";

const NETWORKS = ["TRC20", "BEP20", "ERC20"];

const STATUS_STYLES: Record<WithdrawalStatus, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  completed: "bg-success/10 text-success border-success/20",
  rejected: "bg-danger/10 text-danger border-danger/20",
  failed: "bg-danger/10 text-danger border-danger/20",
};

const EMPTY: WalletBalances = { currency: "USDT", available: "0.00", funding: "0.00", profit: "0.00" };

export default function WalletWithdrawPage() {
  const { t } = useLocaleStore();
  const [balances, setBalances] = useState<WalletBalances>(EMPTY);
  const [source, setSource] = useState<WithdrawalSource>("available");
  const [amount, setAmount] = useState("");
  const [network, setNetwork] = useState(NETWORKS[0]);
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [withdrawal, setWithdrawal] = useState<Withdrawal | null>(null);

  useEffect(() => {
    fetchWalletBalances().then(setBalances);
  }, []);

  const sourceBalance = source === "available" ? balances.available : balances.profit;

  const amountValid =
    isPositiveDecimal(amount) && compareDecimalStrings(amount, sourceBalance) <= 0;
  const formValid = amountValid && address.trim().length > 0 && password.length > 0;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValid || submitting) return;
    if (!amountValid) {
      toast.error(t("withdraw.invalid_amount"));
      return;
    }
    if (!address.trim()) {
      toast.error(t("withdraw.address_required"));
      return;
    }
    if (!password) {
      toast.error(t("withdraw.password_required"));
      return;
    }
    setSubmitting(true);
    try {
      const result = await requestWithdrawal({
        asset: balances.currency,
        amount,
        source,
        destination: { network, address: address.trim() },
        password,
      });
      setWithdrawal(result);
      setAmount("");
      setAddress("");
      setPassword("");
      toast.success(t("withdraw.requested"));
    } finally {
      setSubmitting(false);
    }
  };

  const onCancel = async () => {
    if (!withdrawal) return;
    await cancelWithdrawal(withdrawal.id);
    setWithdrawal({ ...withdrawal, status: "rejected" });
    toast.success(t("withdraw.cancelled"));
  };

  return (
    <div className="p-4 sm:p-6 max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <ArrowUpFromLine className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("withdraw.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("withdraw.subtitle")}</p>
        </div>
      </div>

      {/* Source selector — funding is structurally excluded (INV-25) */}
      <div className="grid grid-cols-2 gap-3">
        {(["available", "profit"] as WithdrawalSource[]).map((s) => {
          const bal = s === "available" ? balances.available : balances.profit;
          const active = source === s;
          return (
            <button
              key={s}
              type="button"
              onClick={() => setSource(s)}
              className={`rounded-lg border p-4 text-left transition-colors ${
                active ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-accent"
              }`}
            >
              <p className="text-xs text-muted-foreground">
                {s === "available" ? t("withdraw.available") : t("withdraw.profit")}
              </p>
              <p className="mt-1 font-mono text-lg font-bold">{bal} {balances.currency}</p>
            </button>
          );
        })}
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-border bg-secondary/30 p-3 text-xs text-muted-foreground">
        <Lock className="h-4 w-4 shrink-0 mt-0.5" />
        <span>
          {t("withdraw.funding_locked")}{" "}
          <span className="font-mono">{balances.funding} {balances.currency}</span>
        </span>
      </div>

      <Card className="bg-card border-border p-5">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">{t("withdraw.amount")}</label>
              <span className="text-xs text-muted-foreground">
                {t("withdraw.balance")}: <span className="font-mono">{sourceBalance} {balances.currency}</span>
              </span>
            </div>
            <div className="mt-1 flex gap-2">
              <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="decimal"
                placeholder="0.00"
                className="font-mono"
              />
              <Button type="button" variant="secondary" onClick={() => setAmount(sourceBalance)}>
                {t("withdraw.max")}
              </Button>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">{t("withdraw.network")}</label>
            <select
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              className="w-full mt-1 h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              {NETWORKS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">{t("withdraw.address")}</label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="0x… / T…"
              className="mt-1 font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">{t("withdraw.confirm_password")}</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="mt-1"
            />
            <p className="mt-1 text-xs text-muted-foreground">{t("withdraw.step_up_note")}</p>
          </div>

          <Button type="submit" className="w-full" disabled={!formValid || submitting}>
            {t("withdraw.submit")}
          </Button>
        </form>
      </Card>

      {withdrawal && (
        <Card className="bg-card border-border p-5 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("withdraw.withdrawal_id")}</span>
            <span className="font-mono">{withdrawal.id}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("withdraw.amount")}</span>
            <span className="font-mono font-semibold">{withdrawal.amount} {withdrawal.asset}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("withdraw.status")}</span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${STATUS_STYLES[withdrawal.status]}`}>
              {withdrawal.status}
            </span>
          </div>
          {withdrawal.status === "pending" && (
            <Button variant="outline" size="sm" className="w-full border-danger/30 text-danger hover:bg-danger/10" onClick={onCancel}>
              {t("withdraw.cancel")}
            </Button>
          )}
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{t("withdraw.manual_note")}</span>
          </div>
        </Card>
      )}
    </div>
  );
}
