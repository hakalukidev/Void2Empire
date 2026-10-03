"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MailOpen } from "lucide-react";
import toast from "react-hot-toast";
import { verifySchema, type VerifyInput } from "@/lib/validators/auth";
import { verifyEmail, resendVerificationCode } from "@/lib/api/auth";
import { useAuthStore } from "@/store/auth-store";
import { safeNextPath } from "@/lib/auth/routes";
import { AuthHeader, Field, SubmitButton, authInputClass } from "@/components/auth/fields";
import { cn } from "@/lib/utils/cn";

const RESEND_COOLDOWN_SECONDS = 60;

export default function VerifyPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  // A code was just sent by registration or login, so resend starts on cooldown.
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<VerifyInput>({ resolver: zodResolver(verifySchema) });

  const email = useWatch({ control, name: "email" });

  useEffect(() => {
    const urlEmail = new URLSearchParams(window.location.search).get("email") ?? "";
    setValue("email", urlEmail);
  }, [setValue]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const onSubmit = async (data: VerifyInput) => {
    try {
      const user = await verifyEmail(data);
      setUser(user);
      toast.success("Email verified");
      router.push(safeNextPath(new URLSearchParams(window.location.search).get("next")));
    } catch (error) {
      const message = isAxiosError(error) ? error.response?.data?.error : undefined;
      toast.error(message ?? "Invalid or expired code");
    }
  };

  const onResend = async () => {
    if (!email || cooldown > 0) return;
    try {
      await resendVerificationCode(email);
      setCooldown(RESEND_COOLDOWN_SECONDS);
      toast.success("Code resent");
    } catch {
      toast.error("Could not resend code");
    }
  };

  return (
    <div>
      <span className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-brand-blue-500/30 bg-brand-blue-500/10 text-primary">
        <MailOpen className="h-5 w-5" />
      </span>
      <AuthHeader
        title="Verify your email"
        subtitle={
          <>
            Enter the 6-digit code we sent to{" "}
            <span className="font-medium text-foreground">{email || "your email"}</span>.
          </>
        }
      />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <input type="hidden" {...register("email")} />
        <Field label="Verification code" htmlFor="verify-code" error={errors.code?.message}>
          <input
            id="verify-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="000000"
            aria-invalid={!!errors.code || undefined}
            className={cn(
              authInputClass,
              "h-14 px-4 text-center font-mono text-2xl tracking-[0.6em] placeholder:tracking-[0.6em]",
              errors.code && "border-destructive"
            )}
            {...register("code")}
          />
        </Field>
        <div className="pt-2">
          <SubmitButton pending={isSubmitting}>
            {isSubmitting ? "Verifying…" : "Verify email"}
          </SubmitButton>
        </div>
      </form>

      <div className="mt-6 flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={onResend}
          disabled={cooldown > 0}
          className="font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:font-normal disabled:text-muted-foreground disabled:no-underline"
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
        </button>
        <Link href="/login" className="text-muted-foreground hover:text-foreground">
          Back to login
        </Link>
      </div>
    </div>
  );
}
