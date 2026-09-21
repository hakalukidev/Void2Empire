"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocaleStore } from "@/store/locale-store";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const ASSETS = [
  { id: "usdt", name: "USDT", network: "TRC20", balance: 10000.00, fee: 1.0 },
  { id: "btc", name: "Bitcoin", network: "BTC", balance: 0.5, fee: 0.0001 },
];

export default function WithdrawPage() {
  const { t } = useLocaleStore();
  const [selectedAsset, setSelectedAsset] = useState(ASSETS[0]);
  const [amount, setAmount] = useState("");
  
  const numAmount = parseFloat(amount) || 0;
  const receiveAmount = Math.max(0, numAmount - selectedAsset.fee);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/wallet" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">{t("wallet.withdraw_title")}</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">{t("wallet.select_asset")}</label>
            <div className="grid grid-cols-2 gap-2">
              {ASSETS.map(asset => (
                <button
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors flex flex-col items-center gap-1 ${
                    selectedAsset.id === asset.id 
                    ? "border-primary bg-primary/10 text-foreground" 
                    : "border-border bg-card text-muted-foreground hover:bg-secondary/50"
                  }`}
                >
                  <span className="font-bold">{asset.name}</span>
                  <span className="text-xs opacity-70">Bal: {asset.balance}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">{t("wallet.destination")}</label>
            <Input placeholder={`Enter ${selectedAsset.name} address`} />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-muted-foreground">{t("wallet.withdraw_amount")}</label>
              <span className="text-xs text-muted-foreground">
                Max: {selectedAsset.balance} {selectedAsset.name}
              </span>
            </div>
            <div className="relative">
              <Input 
                type="number" 
                placeholder="0.00" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <button 
                onClick={() => setAmount(selectedAsset.balance.toString())}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-primary hover:text-primary/80"
              >
                MAX
              </button>
            </div>
          </div>

          <Button size="lg" className="w-full font-bold">
            {t("wallet.submit_withdraw")}
          </Button>
        </div>

        <Card className="p-6 bg-card border-border h-fit space-y-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{t("wallet.network")}</p>
            <p className="font-semibold">{selectedAsset.network}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">{t("wallet.fee")}</p>
            <p className="font-semibold text-warning">{selectedAsset.fee} {selectedAsset.name}</p>
          </div>
          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground mb-1">{t("wallet.receive")}</p>
            <p className="text-xl font-bold text-success">{receiveAmount.toFixed(4)} {selectedAsset.name}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
