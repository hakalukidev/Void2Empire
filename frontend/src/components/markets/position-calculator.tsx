"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

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
      <span className="text-xs font-medium text-white/40">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode="decimal"
        className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-lime-400/60"
      />
    </label>
  );
}

export function PositionCalculator() {
  const [instrument, setInstrument] = useState("XAU/USD");
  const [currency, setCurrency] = useState("Dollar USA");
  const [openingPrice, setOpeningPrice] = useState("36.31400");
  const [stopLossPrice, setStopLossPrice] = useState("35.5877");
  const [accountBalance, setAccountBalance] = useState("100000");
  const [risk, setRisk] = useState("2");
  const [result, setResult] = useState<{ units: number; amountAtRisk: number } | null>(null);

  function calculate() {
    const balance = parseFloat(accountBalance);
    const riskPct = parseFloat(risk);
    const opening = parseFloat(openingPrice);
    const stopLoss = parseFloat(stopLossPrice);
    const stopDistance = Math.abs(opening - stopLoss);

    if (!balance || !riskPct || !stopDistance) {
      setResult(null);
      return;
    }

    const amountAtRisk = balance * (riskPct / 100);
    const units = amountAtRisk / stopDistance;
    setResult({ units, amountAtRisk });
  }

  const format = (n: number) =>
    n.toLocaleString("en-US", { maximumFractionDigits: 0 });

  return (
    <div className="flex h-full flex-col rounded-2xl border border-white/5 bg-[#050b06] p-6">
      <h2 className="text-lg font-semibold text-white">Position size calculator</h2>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <Field label="Funds" value={instrument} onChange={setInstrument} />
        <Field label="Deposit slip" value={currency} onChange={setCurrency} />
        <Field label="Opening price" value={openingPrice} onChange={setOpeningPrice} />
        <Field label="Stop loss price" value={stopLossPrice} onChange={setStopLossPrice} />
        <Field label="Account balance" value={accountBalance} onChange={setAccountBalance} />
        <Field label="Risk (%)" value={risk} onChange={setRisk} />
      </div>

      <Button
        onClick={calculate}
        className="mt-6 h-12 rounded-full bg-lime-400 font-semibold text-black hover:opacity-90"
      >
        Calculate
      </Button>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-white/5 p-4">
          <p className="text-xs text-white/40">Units (deal size)</p>
          <p className="mt-1 text-xl font-bold text-white">
            {result ? format(result.units) : "—"}
          </p>
        </div>
        <div className="rounded-xl bg-white/5 p-4">
          <p className="text-xs text-white/40">Amount at risk</p>
          <p className="mt-1 text-xl font-bold text-white">
            {result ? `$${format(result.amountAtRisk)}` : "—"}
          </p>
        </div>
      </div>
    </div>
  );
}
