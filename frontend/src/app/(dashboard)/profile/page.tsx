"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocaleStore } from "@/store/locale-store";
import { ShieldCheck, User, ShieldAlert } from "lucide-react";

export default function ProfilePage() {
  const { t } = useLocaleStore();

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">{t("profile.title")}</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-2 mb-6">
              <User className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">{t("profile.personal_info")}</h2>
            </div>
            
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">{t("profile.name")}</label>
                  <Input defaultValue="Demo User" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">{t("profile.email")}</label>
                  <Input defaultValue="demo@void2empire.com" readOnly className="bg-secondary/30 text-muted-foreground" />
                </div>
              </div>
              <Button>{t("profile.update")}</Button>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-2 mb-6">
              <ShieldCheck className="w-5 h-5 text-success" />
              <h2 className="text-lg font-semibold">{t("profile.security")}</h2>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">{t("profile.current_password")}</label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">{t("profile.new_password")}</label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <Button variant="secondary">{t("profile.change_password")}</Button>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 bg-card border-border border-l-4 border-l-warning flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-warning/10 text-warning rounded-full flex items-center justify-center mb-4">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-semibold mb-2">{t("profile.kyc")}</h2>
            <div className="mb-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning/10 text-warning border border-warning/20">
                {t("profile.kyc_unverified")}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              {t("profile.kyc_desc")}
            </p>
            <Button variant="primary" className="w-full">{t("profile.verify_now")}</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
