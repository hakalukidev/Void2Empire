"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocaleStore } from "@/store/locale-store";
import {
  isPositiveDecimal,
  multiplyDecimalStrings,
  divideDecimalByInteger,
  divideDecimalStrings,
  subtractDecimalStrings,
  absDecimalString,
} from "@/lib/utils/decimal";

interface CalcResult {
  units: string;
  amountAtRisk: string;
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode="decimal"
        className="mt-1.5 font-mono"
      />
    </label>
  );
}

export function PositionCalculator() {
  const { t } = useLocaleStore();
  // Every market the platform lists quotes in USDT, and the calculator's prices
  // are typed in by hand, so it is market-agnostic. The "XAU/USD · USD" label
  // this used to carry named a market the client never listed.
  const currency = "USDT";
  const [openingPrice, setOpeningPrice] = useState("");
  const [stopLossPrice, setStopLossPrice] = useState("");
  const [accountBalance, setAccountBalance] = useState("");
  const [risk, setRisk] = useState("");
  const [result, setResult] = useState<CalcResult | null>(null);

  function calculate() {
    const stopDistance = absDecimalString(subtractDecimalStrings(openingPrice, stopLossPrice));
    const valid =
      isPositiveDecimal(openingPrice) &&
      isPositiveDecimal(stopLossPrice) &&
      isPositiveDecimal(accountBalance) &&
      isPositiveDecimal(risk) &&
      isPositiveDecimal(stopDistance);

    if (!valid) {
      setResult(null);
      return;
    }

    // amountAtRisk = balance * risk% / 100 ; units = amountAtRisk / stopDistance
    const amountAtRisk = divideDecimalByInteger(multiplyDecimalStrings(accountBalance, risk), 100);
    const units = divideDecimalStrings(amountAtRisk, stopDistance);
    setResult({ units, amountAtRisk });
  }

  return (
    <Card className="flex h-full flex-col bg-card border-border p-6">
      <h2 className="text-lg font-semibold">{t("markets.calc_title")}</h2>
      <p className="mt-1 text-xs text-muted-foreground">{t("markets.calc_note_usdt")}</p>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <Field label={t("markets.calc_opening")} value={openingPrice} onChange={setOpeningPrice} />
        <Field label={t("markets.calc_stop_loss")} value={stopLossPrice} onChange={setStopLossPrice} />
        <Field label={t("markets.calc_balance")} value={accountBalance} onChange={setAccountBalance} />
        <Field label={t("markets.calc_risk")} value={risk} onChange={setRisk} />
      </div>

      <Button onClick={calculate} className="mt-6">
        {t("markets.calc_calculate")}
      </Button>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-secondary/40 p-4">
          <p className="text-xs text-muted-foreground">{t("markets.calc_units")}</p>
          <p className="mt-1 font-mono text-xl font-bold">{result ? result.units : "—"}</p>
        </div>
        <div className="rounded-xl bg-secondary/40 p-4">
          <p className="text-xs text-muted-foreground">{t("markets.calc_at_risk")}</p>
          <p className="mt-1 font-mono text-xl font-bold">
            {result ? `${result.amountAtRisk} ${currency}` : "—"}
          </p>
        </div>
      </div>
    </Card>
  );
}
