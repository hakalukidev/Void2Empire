"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocaleStore } from "@/store/locale-store";
import { isPositiveDecimal } from "@/lib/utils/decimal";
import { fetchWalletBalances } from "@/services/wallet.service";
import { createDeposit, getDeposit, Deposit, DepositStatus } from "@/services/payments.service";
import toast from "react-hot-toast";
import { ArrowDownToLine, Info } from "lucide-react";

const ASSETS = ["USDT", "BTC", "ETH"];

const STATUS_STYLES: Record<DepositStatus, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  completed: "bg-success/10 text-success border-success/20",
  failed: "bg-danger/10 text-danger border-danger/20",
};

export default function WalletDepositPage() {
  const { t } = useLocaleStore();
  const [asset, setAsset] = useState("USDT");
  const [amount, setAmount] = useState("");
  const [available, setAvailable] = useState("0.00");
  const [submitting, setSubmitting] = useState(false);
  const [deposit, setDeposit] = useState<Deposit | null>(null);
  const [paymentUrl, setPaymentUrl] = useState("");

  useEffect(() => {
    fetchWalletBalances().then((b) => setAvailable(b.available));
  }, []);

  const amountValid = isPositiveDecimal(amount);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountValid || submitting) return;
    setSubmitting(true);
    try {
      const intent = await createDeposit({ asset, amount });
      setPaymentUrl(intent.paymentUrl);
      setDeposit(await getDeposit(intent.depositId));
      toast.success(t("deposit.created"));
    } finally {
      setSubmitting(false);
    }
  };

  const refreshStatus = async () => {
    if (!deposit) return;
    setDeposit(await getDeposit(deposit.id));
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <ArrowDownToLine className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("deposit.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("deposit.subtitle")}</p>
        </div>
      </div>

      <Card className="bg-card border-border p-5 space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t("deposit.current_available")}</span>
          <span className="font-mono font-semibold">{available} USDT</span>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">{t("deposit.asset")}</label>
            <select
              value={asset}
              onChange={(e) => setAsset(e.target.value)}
              className="w-full mt-1 h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              {ASSETS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">{t("deposit.amount")}</label>
            <Input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="decimal"
              placeholder="0.00"
              className="mt-1 font-mono"
            />
          </div>

          <Button type="submit" className="w-full" disabled={!amountValid || submitting}>
            {t("deposit.submit")}
          </Button>
        </form>
      </Card>

      {deposit && (
        <Card className="bg-card border-border p-5 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("deposit.deposit_id")}</span>
            <span className="font-mono">{deposit.id}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("deposit.status")}</span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${STATUS_STYLES[deposit.status]}`}>
              {deposit.status}
            </span>
          </div>
          {paymentUrl ? (
            <a href={paymentUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" className="w-full">{t("deposit.submit")}</Button>
            </a>
          ) : (
            <p className="text-xs text-muted-foreground">{t("deposit.provider_note")}</p>
          )}
          <Button variant="outline" size="sm" className="w-full" onClick={refreshStatus}>
            {t("deposit.check_status")}
          </Button>
        </Card>
      )}

      <div className="flex items-start gap-2 rounded-lg border border-border bg-secondary/30 p-3 text-xs text-muted-foreground">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <span>{t("deposit.webhook_note")}</span>
      </div>
    </div>
  );
}
