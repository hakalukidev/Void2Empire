"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import Link from "next/link";
import toast from "react-hot-toast";
import { ShieldCheck, User, ShieldAlert, BadgeCheck, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/ui/user-avatar";
import { PasswordStrength } from "@/components/auth/password-strength";
import { changePassword, updateProfile } from "@/lib/api/auth";
import {
  changePasswordSchema,
  profileSchema,
  type ChangePasswordInput,
  type ProfileInput,
} from "@/lib/validators/auth";
import {
  KYC_LEVEL_RULES,
  fetchMyKyc,
  kycRuleForLevel,
  type KycLevelRule,
  type MyKyc,
} from "@/services/kyc.service";
import { formatDecimalString } from "@/lib/utils/decimal";
import { useAuthStore } from "@/store/auth-store";
import { useLocaleStore } from "@/store/locale-store";
import type { KycLevel, User as AuthUser } from "@/types";

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

function apiError(error: unknown, fallback: string) {
  return (isAxiosError(error) ? error.response?.data?.error : undefined) ?? fallback;
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-xs text-destructive">{message}</p> : null;
}

const labelClass = "text-sm font-medium text-muted-foreground";

function PersonalInfoForm({ user }: { user: AuthUser }) {
  const { t } = useLocaleStore();
  const setUser = useAuthStore((state) => state.setUser);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: user.fullName },
  });

  const onSubmit = async (data: ProfileInput) => {
    try {
      const updated = await updateProfile({ fullName: data.fullName.trim() });
      setUser(updated);
      reset({ fullName: updated.fullName });
      toast.success(t("profile.updated"));
    } catch (error) {
      toast.error(apiError(error, t("profile.update_failed")));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="profile-name" className={labelClass}>{t("profile.name")}</label>
          <Input id="profile-name" autoComplete="name" {...register("fullName")} />
          <FieldError message={errors.fullName?.message} />
        </div>
        <div className="space-y-2">
          <label htmlFor="profile-email" className={labelClass}>{t("profile.email")}</label>
          <Input id="profile-email" value={user.email} readOnly className="bg-secondary/30 text-muted-foreground" />
        </div>
      </div>
      <Button type="submit" disabled={isSubmitting || !isDirty}>
        {isSubmitting ? t("profile.saving") : t("profile.update")}
      </Button>
    </form>
  );
}

function ChangePasswordForm() {
  const { t } = useLocaleStore();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({ resolver: zodResolver(changePasswordSchema) });
  const newPassword = useWatch({ control, name: "newPassword" });

  const onSubmit = async (data: ChangePasswordInput) => {
    try {
      await changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      reset({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success(t("profile.password_changed"));
    } catch (error) {
      toast.error(apiError(error, t("profile.password_failed")));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-2">
        <label htmlFor="current-password" className={labelClass}>{t("profile.current_password")}</label>
        <Input id="current-password" type="password" autoComplete="current-password" placeholder="••••••••" {...register("currentPassword")} />
        <FieldError message={errors.currentPassword?.message} />
      </div>
      <div className="space-y-2">
        <label htmlFor="new-password" className={labelClass}>{t("profile.new_password")}</label>
        <Input id="new-password" type="password" autoComplete="new-password" placeholder="••••••••" {...register("newPassword")} />
        <PasswordStrength password={newPassword ?? ""} />
        <FieldError message={errors.newPassword?.message} />
      </div>
      <div className="space-y-2">
        <label htmlFor="confirm-password" className={labelClass}>{t("profile.confirm_password")}</label>
        <Input id="confirm-password" type="password" autoComplete="new-password" placeholder="••••••••" {...register("confirmPassword")} />
        <FieldError message={errors.confirmPassword?.message} />
      </div>
      <Button type="submit" variant="secondary" disabled={isSubmitting}>
        {isSubmitting ? t("profile.saving") : t("profile.change_password")}
      </Button>
    </form>
  );
}

export default function ProfilePage() {
  const { t } = useLocaleStore();
  const user = useAuthStore((state) => state.user);
  const [kyc, setKyc] = useState<MyKyc | null>(null);

  useEffect(() => {
    fetchMyKyc().then(setKyc);
  }, []);

  const level: KycLevel = kyc?.level ?? "none";
  const rule = kycRuleForLevel(level);
  // Level 2's answer did not restate a period, so only Level 1 shows "/ day".
  const capLine = (levelRule: KycLevelRule) =>
    `$${formatDecimalString(levelRule.cap, 2)}${
      levelRule.capPeriod === "day" ? ` / ${t("kyc.per_day")}` : ""
    }`;

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
              {user && (
                <div className="flex items-center gap-4">
                  <UserAvatar user={user} className="h-16 w-16 text-xl" />
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{user.fullName}</p>
                    <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              )}
              {user && <PersonalInfoForm key={user.id} user={user} />}
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-2 mb-6">
              <ShieldCheck className="w-5 h-5 text-success" />
              <h2 className="text-lg font-semibold">{t("profile.security")}</h2>
            </div>
            
            {user?.hasPassword === false ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">{t("profile.no_password")}</p>
                <Link href="/forgot-password">
                  <Button type="button" variant="secondary">{t("profile.set_password")}</Button>
                </Link>
              </div>
            ) : (
              <ChangePasswordForm />
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card
            className={
              "flex flex-col items-center border-border bg-card p-6 text-center " +
              (level === "none" ? "border-l-4 border-l-warning" : "")
            }
          >
            <div
              className={
                "mb-4 flex h-16 w-16 items-center justify-center rounded-full " +
                (level === "none" ? "bg-warning/10 text-warning" : "bg-success/10 text-success")
              }
            >
              {level === "none" ? (
                <ShieldAlert className="h-8 w-8" />
              ) : (
                <BadgeCheck className="h-8 w-8" />
              )}
            </div>
            <h2 className="text-lg font-semibold mb-2">{t("profile.kyc")}</h2>
            <div className="mb-4">
              <span
                className={
                  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium " +
                  LEVEL_BADGE[level]
                }
              >
                {t(LEVEL_LABEL[level])}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {t("profile.kyc_desc")}
            </p>
            {rule === null ? (
              <p className="text-sm text-muted-foreground">{t("kyc.not_confirmed")}</p>
            ) : (
              <p className="font-mono text-sm font-semibold">{capLine(rule)}</p>
            )}
          </Card>

          <Card className="border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">{t("kyc.levels_title")}</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-4">{t("kyc.mandatory")}</p>
            <ul className="space-y-4">
              {KYC_LEVEL_RULES.map((levelRule) => (
                <li key={levelRule.level} className="space-y-1">
                  <p className="text-sm font-semibold">{t(levelRule.titleKey)}</p>
                  <p className="text-xs text-muted-foreground">{t(levelRule.docsKey)}</p>
                  <p className="font-mono text-xs text-muted-foreground">{capLine(levelRule)}</p>
                  {levelRule.capPeriod === "unstated" && (
                    <p className="text-xs text-muted-foreground">{t("kyc.cap_unstated")}</p>
                  )}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">{t("kyc.provider_note")}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
