"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocaleStore } from "@/store/locale-store";
import { useAuthStore } from "@/store/auth-store";
import { changePassword } from "@/services/account.service";
import {
  KYC_LEVEL_RULES,
  fetchMyKyc,
  kycRuleForLevel,
  type MyKyc,
} from "@/services/kyc.service";
import { formatDecimalString } from "@/lib/utils/decimal";
import type { KycLevel } from "@/types";
import { ShieldCheck, User, ShieldAlert, BadgeCheck, FileText } from "lucide-react";
import toast from "react-hot-toast";

const LEVEL_BADGE: Record<KycLevel, string> = {
  none: "bg-warning/10 text-warning border-warning/20",
  level_1: "bg-primary/10 text-primary border-primary/20",
  level_2: "bg-success/10 text-success border-success/20",
};

const LEVEL_LABEL: Record<KycLevel, string> = {
  none: "profile.kyc_unverified",
  level_1: "kyc.level_1",
  level_2: "kyc.level_2",
};

export default function ProfilePage() {
  const { t } = useLocaleStore();
  const user = useAuthStore((s) => s.user);
  const [kyc, setKyc] = useState<MyKyc | null>(null);

  useEffect(() => {
    fetchMyKyc().then(setKyc);
  }, []);

  const level: KycLevel = kyc?.level ?? "none";
  const rule = kycRuleForLevel(level);

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">{t("profile.title")}</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Identity is read-only: which profile fields a user may edit is still open (DR-032),
              so there is no profile-update endpoint to stub. */}
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-2 mb-6">
              <User className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">{t("profile.personal_info")}</h2>
            </div>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="profile-name" className="text-sm font-medium text-muted-foreground">{t("profile.name")}</label>
                  <Input id="profile-name" value={user?.fullName ?? ""} readOnly className="bg-secondary/30 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="profile-email" className="text-sm font-medium text-muted-foreground">{t("profile.email")}</label>
                  <Input id="profile-email" value={user?.email ?? ""} readOnly className="bg-secondary/30 text-muted-foreground" />
                </div>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">{t("profile.identity_note")}</p>
            </div>
          </Card>

          <PasswordCard />
        </div>

        <div className="space-y-6">
          <Card
            className={`flex flex-col items-center border border-l-4 bg-card p-6 text-center ${
              level === "none" ? "border-l-warning border-border" : "border-l-success border-border"
            }`}
          >
            <div
              className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
                level === "none" ? "bg-warning/10 text-warning" : "bg-success/10 text-success"
              }`}
            >
              {level === "none" ? <ShieldAlert className="h-8 w-8" /> : <BadgeCheck className="h-8 w-8" />}
            </div>
            <h2 className="mb-2 text-lg font-semibold">{t("profile.kyc")}</h2>
            <span
              className={`mb-4 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${LEVEL_BADGE[level]}`}
            >
              {t(LEVEL_LABEL[level])}
            </span>
            <p className="mb-2 text-sm text-muted-foreground">{t("profile.kyc_desc")}</p>
            <p className="text-xs text-muted-foreground">
              {t("profile.kyc_current_cap")}{" "}
              {/* An unverified account has no confirmed ceiling (v20 Q37 numbered
                  only the two levels), so no figure is invented for it. */}
              <span className="font-mono font-semibold text-foreground">
                {rule === null
                  ? t("kyc.not_confirmed")
                  : `$${formatDecimalString(rule.cap, 2)}${
                      rule.capPeriod === "day" ? ` / ${t("kyc.per_day")}` : ""
                    }`}
              </span>
            </p>
          </Card>
        </div>
      </div>

      {/* The two levels the client confirmed in v20 Q37, with the documents each
          one asks for and the withdrawal ceiling it carries. */}
      <Card className="bg-card border-border p-6">
        <div className="mb-2 flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">{t("kyc.levels_title")}</h2>
        </div>
        <p className="mb-6 text-sm text-muted-foreground">{t("kyc.mandatory")}</p>

        <div className="space-y-4">
          {KYC_LEVEL_RULES.map((rule) => (
            <div key={rule.level} className="rounded-xl border border-border bg-secondary/20 p-4">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h3 className="font-semibold">{t(rule.titleKey)}</h3>
                <span className="ml-auto font-mono text-sm font-bold text-success">
                  ${formatDecimalString(rule.cap, 2)}
                  {rule.capPeriod === "day" ? ` / ${t("kyc.per_day")}` : ""}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{t(rule.docsKey)}</p>
              {rule.capPeriod === "unstated" && (
                <p className="mt-1 text-xs text-muted-foreground">{t("kyc.cap_unstated")}</p>
              )}
            </div>
          ))}
        </div>

        <p className="mt-6 text-xs leading-relaxed text-muted-foreground">{t("kyc.provider_note")}</p>
      </Card>
    </div>
  );
}

// No password policy is enforced in the form: it is one of the items still open under DR-032.
function PasswordCard() {
  const { t } = useLocaleStore();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!currentPassword) {
      toast.error(t("profile.current_password_required"));
      return;
    }
    if (!newPassword) {
      toast.error(t("profile.new_password_required"));
      return;
    }
    setSubmitting(true);
    try {
      await changePassword({ currentPassword, newPassword });
      toast.success(t("profile.change_submitted"));
      setCurrentPassword("");
      setNewPassword("");
    } catch {
      toast.error(t("profile.change_failed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center gap-2 mb-6">
        <ShieldCheck className="w-5 h-5 text-success" />
        <h2 className="text-lg font-semibold">{t("profile.security")}</h2>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="current-password" className="text-sm font-medium text-muted-foreground">
            {t("profile.current_password")}
          </label>
          <Input
            id="current-password"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="new-password" className="text-sm font-medium text-muted-foreground">
            {t("profile.new_password")}
          </label>
          <Input
            id="new-password"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <Button type="submit" variant="secondary" disabled={submitting}>
          {submitting ? t("profile.change_submitting") : t("profile.change_password")}
        </Button>
        <p className="text-xs leading-relaxed text-muted-foreground">{t("profile.reauth_note")}</p>
        <p className="text-xs leading-relaxed text-muted-foreground">{t("profile.change_stub_note")}</p>
      </form>
    </Card>
  );
}
