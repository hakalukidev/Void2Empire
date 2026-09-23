"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { verifySchema, type VerifyInput } from "@/lib/validators/auth";
import { verifyEmail, resendVerificationCode } from "@/lib/api/auth";
import { useAuthStore } from "@/store/auth-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const RESEND_COOLDOWN_SECONDS = 60;

export default function VerifyPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [cooldown, setCooldown] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<VerifyInput>({ resolver: zodResolver(verifySchema) });

  const email = watch("email");

  useEffect(() => {
    const urlEmail = new URLSearchParams(window.location.search).get("email") ?? "";
    setValue("email", urlEmail);
    setCooldown(RESEND_COOLDOWN_SECONDS);
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
      router.push("/dashboard");
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
    <Card>
      <h1 className="text-xl font-semibold">Verify your email</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Enter the 6-digit code we sent to{" "}
        <span className="font-medium text-foreground">{email || "your email"}</span>.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <input type="hidden" {...register("email")} />
        <div>
          <label className="mb-1 block text-sm font-medium">Verification code</label>
          <Input
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="000000"
            className="tracking-[0.5em]"
            {...register("code")}
          />
          {errors.code && (
            <p className="mt-1 text-xs text-destructive">{errors.code.message}</p>
          )}
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          Verify email
        </Button>
      </form>

      <div className="mt-4 flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={onResend}
          disabled={cooldown > 0}
          className="text-primary hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
        </button>
        <Link href="/login" className="text-muted-foreground hover:underline">
          Skip for now
        </Link>
      </div>
    </Card>
  );
}
