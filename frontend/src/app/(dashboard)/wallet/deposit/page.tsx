"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocaleStore } from "@/store/locale-store";
import { ArrowLeft, Copy, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const ASSETS = [
  { id: "usdt", name: "USDT", network: "TRC20" },
  { id: "btc", name: "Bitcoin", network: "BTC" },
  { id: "eth", name: "Ethereum", network: "ERC20" },
];

export default function DepositPage() {
  const { t } = useLocaleStore();
  const [copied, setCopied] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(ASSETS[0]);
  
  // Mock wallet address for demonstration
  const mockAddress = "TYDzsYUEpvnYmQk4zEAjzX81V1vYy1nZ";

  const handleCopy = () => {
    navigator.clipboard.writeText(mockAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/wallet" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">{t("wallet.deposit_title")}</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">{t("wallet.select_asset")}</label>
            <div className="grid grid-cols-3 gap-2">
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
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">{t("wallet.network")}</label>
            <div className="p-3 bg-secondary/30 border border-border rounded-lg">
              <span className="font-semibold text-foreground">{selectedAsset.network}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">{t("wallet.address")}</label>
            <div className="flex gap-2">
              <Input value={mockAddress} readOnly className="font-mono text-sm bg-secondary/30" />
              <Button variant="secondary" onClick={handleCopy} className="w-12 px-0 shrink-0">
                {copied ? <CheckCircle2 className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            {copied && <p className="text-xs text-success mt-1">{t("wallet.copied")}</p>}
          </div>
        </div>

        <Card className="p-8 flex flex-col items-center justify-center text-center bg-card border-border h-full min-h-[300px]">
          <div className="w-48 h-48 bg-white p-2 rounded-xl mb-6 shadow-sm border border-border/50">
            {/* Mock QR Code representation - in a real app use a library like qrcode.react */}
            <div className="w-full h-full bg-[url('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TYDzsYUEpvnYmQk4zEAjzX81V1vYy1nZ')] bg-contain bg-no-repeat bg-center opacity-90 mix-blend-multiply"></div>
          </div>
          <p className="text-sm text-muted-foreground max-w-[250px]">
            Send only <span className="font-bold text-foreground">{selectedAsset.name}</span> to this deposit address.
          </p>
        </Card>
      </div>
    </div>
  );
}
