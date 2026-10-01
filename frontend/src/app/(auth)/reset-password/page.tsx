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
import { AuthHeader, Field, PasswordInput, SubmitButton } from "@/components/auth/fields";
import { PasswordStrength } from "@/components/auth/password-strength";

function ResetPasswordForm() {
  const router = useRouter();
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
      toast.success("Password updated. Please log in.");
      router.push("/login");
    } catch (error) {
      const message = isAxiosError(error) ? error.response?.data?.error : undefined;
      toast.error(message ?? "Could not reset password. The link may be expired.");
    }
  };

  if (!token) {
    return (
      <div>
        <span className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-destructive/30 bg-destructive/10 text-destructive">
          <TriangleAlert className="h-5 w-5" />
        </span>
        <AuthHeader
          title="Link not valid"
          subtitle="This password reset link is invalid or missing a token."
        />
        <Link
          href="/forgot-password"
          className="flex h-11 w-full items-center justify-center rounded-lg border border-border text-sm font-medium transition-colors hover:bg-accent"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div>
      <AuthHeader title="Choose a new password" subtitle="Make it different from your old one." />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <input type="hidden" {...register("token")} />
        <Field label="New password" htmlFor="reset-password" error={errors.password?.message}>
          <PasswordInput
            id="reset-password"
            icon={Lock}
            autoComplete="new-password"
            placeholder="Create a strong password"
            invalid={!!errors.password}
            {...register("password")}
          />
          <PasswordStrength password={password ?? ""} />
        </Field>
        <Field
          label="Confirm new password"
          htmlFor="reset-confirm"
          error={errors.confirmPassword?.message}
        >
          <PasswordInput
            id="reset-confirm"
            icon={Lock}
            autoComplete="new-password"
            placeholder="Repeat your password"
            invalid={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
        </Field>
        <div className="pt-2">
          <SubmitButton pending={isSubmitting}>
            {isSubmitting ? "Updating…" : "Reset password"}
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
