"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocaleStore } from "@/store/locale-store";
import { Copy, Users, DollarSign, Percent, CheckCircle2 } from "lucide-react";

export default function ReferralPage() {
  const { t } = useLocaleStore();
  const [copied, setCopied] = useState(false);
  
  const mockLink = "https://void2empire.com/register?ref=DEMO123";

  const handleCopy = () => {
    navigator.clipboard.writeText(mockLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">{t("referral.title")}</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="flex items-center p-6 gap-4 border-l-4 border-l-primary bg-card">
          <div className="p-3 bg-primary/10 rounded-full text-primary">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t("referral.total_referrals")}</p>
            <h2 className="text-2xl font-bold">0</h2>
          </div>
        </Card>
        
        <Card className="flex items-center p-6 gap-4 border-l-4 border-l-success bg-card">
          <div className="p-3 bg-success/10 rounded-full text-success">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t("referral.total_earned")}</p>
            <h2 className="text-2xl font-bold text-success">+$0.00</h2>
          </div>
        </Card>
        
        <Card className="flex items-center p-6 gap-4 border-l-4 border-l-warning bg-card">
          <div className="p-3 bg-warning/10 rounded-full text-warning">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t("referral.commission_rate")}</p>
            <h2 className="text-2xl font-bold">20%</h2>
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 bg-card border-border h-fit">
          <h2 className="text-lg font-semibold mb-2">{t("referral.your_link")}</h2>
          <p className="text-sm text-muted-foreground mb-6">
            {t("referral.share")}
          </p>
          
          <div className="flex gap-2">
            <Input value={mockLink} readOnly className="bg-secondary/30 text-foreground font-medium" />
            <Button variant="primary" onClick={handleCopy} className="gap-2 shrink-0 w-24">
              {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        </Card>

        <Card className="p-0 overflow-hidden bg-card border-border">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold">{t("referral.recent")}</h2>
          </div>
          <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-medium">User</th>
                <th className="px-6 py-3 font-medium text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={2} className="px-6 py-12 text-center text-muted-foreground">
                  {t("referral.no_referrals")}
                </td>
              </tr>
            </tbody>
          </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
