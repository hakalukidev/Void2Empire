"use client";

import { Suspense } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, TriangleAlert } from "lucide-react";
import toast from "react-hot-toast";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validators/auth";
import { resetPassword } from "@/lib/api/auth";
import { useLocaleStore } from "@/store/locale-store";
import { AuthHeader, Field, PasswordInput, SubmitButton } from "@/components/auth/fields";
import { PasswordStrength } from "@/components/auth/password-strength";

function ResetPasswordForm() {
  const router = useRouter();
  const { t } = useLocaleStore();
  const token = useSearchParams().get("token") ?? "";

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token },
  });
  const password = useWatch({ control, name: "password" });

  const onSubmit = async (data: ResetPasswordInput) => {
    try {
      await resetPassword({ token, password: data.password });
      toast.success(t("auth.reset_success"));
      router.push("/login");
    } catch (error) {
      const message = isAxiosError(error) ? error.response?.data?.error : undefined;
      toast.error(message ?? t("auth.reset_failed"));
    }
  };

  if (!token) {
    return (
      <div>
        <span className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-destructive/30 bg-destructive/10 text-destructive">
          <TriangleAlert className="h-5 w-5" />
        </span>
        <AuthHeader
          title={t("auth.link_invalid_title")}
          subtitle={t("auth.link_invalid_subtitle")}
        />
        <Link
          href="/forgot-password"
          className="flex h-11 w-full items-center justify-center rounded-lg border border-border text-sm font-medium transition-colors hover:bg-accent"
        >
          {t("auth.request_new_link")}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <AuthHeader title={t("auth.reset_title")} subtitle={t("auth.reset_subtitle")} />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <input type="hidden" {...register("token")} />
        <Field
          label={t("auth.new_password")}
          htmlFor="reset-password"
          error={errors.password?.message}
        >
          <PasswordInput
            id="reset-password"
            icon={Lock}
            autoComplete="new-password"
            placeholder={t("auth.password_ph_new")}
            invalid={!!errors.password}
            {...register("password")}
          />
          <PasswordStrength password={password ?? ""} />
        </Field>
        <Field
          label={t("auth.confirm_new_password")}
          htmlFor="reset-confirm"
          error={errors.confirmPassword?.message}
        >
          <PasswordInput
            id="reset-confirm"
            icon={Lock}
            autoComplete="new-password"
            placeholder={t("auth.confirm_password_ph")}
            invalid={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
        </Field>
        <div className="pt-2">
          <SubmitButton pending={isSubmitting}>
            {isSubmitting ? t("auth.reset_pending") : t("auth.reset_btn")}
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}

// The Suspense fallback renders before the form, so it takes the locale itself.
function ResetPasswordFallback() {
  const { t } = useLocaleStore();
  return <p className="text-sm text-muted-foreground">{t("auth.reset_loading")}</p>;
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
