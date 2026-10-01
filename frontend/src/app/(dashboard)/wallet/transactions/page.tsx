"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocaleStore } from "@/store/locale-store";
import {
  fetchTransactions,
  fetchTransaction,
  WalletTransactionRecord,
  TransactionRecordType,
  TransactionRecordStatus,
} from "@/services/wallet.service";
import { History, X } from "lucide-react";

const TYPE_FILTERS: ("all" | TransactionRecordType)[] = [
  "all",
  "deposit",
  "withdrawal",
  "trade",
  "fee",
  "transfer",
  "referral",
];

const STATUS_STYLES: Record<TransactionRecordStatus, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  processing: "bg-primary/10 text-primary border-primary/20",
  completed: "bg-success/10 text-success border-success/20",
  failed: "bg-danger/10 text-danger border-danger/20",
  cancelled: "bg-muted/30 text-muted-foreground border-border",
  reversed: "bg-muted/30 text-muted-foreground border-border",
};

export default function WalletTransactionsPage() {
  const { t } = useLocaleStore();
  const [records, setRecords] = useState<WalletTransactionRecord[]>([]);
  const [filter, setFilter] = useState<"all" | TransactionRecordType>("all");
  const [selected, setSelected] = useState<WalletTransactionRecord | null>(null);

  useEffect(() => {
    fetchTransactions().then(setRecords);
  }, []);

  const filtered = useMemo(
    () => (filter === "all" ? records : records.filter((r) => r.type === filter)),
    [records, filter]
  );

  const openDetails = async (tx: WalletTransactionRecord) => {
    setSelected(tx);
    const full = await fetchTransaction(tx.transactionId);
    if (full) setSelected(full);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <History className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("wallet.transactions_title")}</h1>
          <p className="text-sm text-muted-foreground">{t("wallet.transactions_subtitle")}</p>
        </div>
      </div>

      {/* Type filter */}
      <div className="flex flex-wrap gap-1 bg-secondary/30 p-1 rounded-lg w-fit border border-border">
        {TYPE_FILTERS.map((key) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
              filter === key
                ? "bg-card text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {key === "all" ? t("wallet.filter_all") : key}
          </button>
        ))}
      </div>

      <Card className="overflow-hidden bg-card border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">{t("wallet.tx_id")}</th>
                <th className="px-6 py-4 font-medium">{t("wallet.type")}</th>
                <th className="px-6 py-4 font-medium">{t("wallet.amount")}</th>
                <th className="px-6 py-4 font-medium">{t("wallet.fee")}</th>
                <th className="px-6 py-4 font-medium">{t("wallet.asset")}</th>
                <th className="px-6 py-4 font-medium">{t("wallet.status")}</th>
                <th className="px-6 py-4 font-medium">{t("wallet.date")}</th>
                <th className="px-6 py-4 font-medium text-right">{t("wallet.details")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">
                    {t("wallet.no_tx")}
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => (
                  <tr key={tx.transactionId} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{tx.transactionId}</td>
                    <td className="px-6 py-4 font-semibold capitalize">{tx.type.replace("_", " ")}</td>
                    <td className="px-6 py-4 font-mono">{tx.amount}</td>
                    <td className="px-6 py-4 font-mono text-muted-foreground">{tx.fee}</td>
                    <td className="px-6 py-4 font-bold">{tx.asset}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${STATUS_STYLES[tx.status]}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground whitespace-nowrap">{tx.createdAt}</td>
                    <td className="px-6 py-4 text-right">
                      <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => openDetails(tx)}>
                        {t("wallet.details")}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detail panel */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4" onClick={() => setSelected(null)}>
          <Card
            className="w-full max-w-md bg-card border-border p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-semibold">{t("wallet.details")}</h2>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <dl className="space-y-2 text-sm">
              <Row label={t("wallet.tx_id")} value={<span className="font-mono">{selected.transactionId}</span>} />
              <Row label={t("wallet.type")} value={<span className="capitalize">{selected.type.replace("_", " ")}</span>} />
              <Row label={t("wallet.amount")} value={<span className="font-mono">{selected.amount} {selected.asset}</span>} />
              <Row label={t("wallet.fee")} value={<span className="font-mono">{selected.fee} {selected.asset}</span>} />
              <Row label={t("wallet.status")} value={
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${STATUS_STYLES[selected.status]}`}>
                  {selected.status}
                </span>
              } />
              {selected.refType && selected.refId && (
                <Row label={t("wallet.reference")} value={<span className="font-mono text-xs">{selected.refType}:{selected.refId}</span>} />
              )}
              <Row label={t("wallet.date")} value={<span className="text-muted-foreground">{selected.createdAt}</span>} />
            </dl>
            <Button variant="secondary" className="w-full" onClick={() => setSelected(null)}>
              {t("wallet.close")}
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}
