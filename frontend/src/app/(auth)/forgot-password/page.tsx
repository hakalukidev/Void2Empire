"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import Link from "next/link";
import { ArrowLeft, Mail, MailCheck } from "lucide-react";
import toast from "react-hot-toast";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validators/auth";
import { requestPasswordReset } from "@/lib/api/auth";
import { AuthHeader, Field, IconInput, SubmitButton } from "@/components/auth/fields";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (data: ForgotPasswordInput) => {
    try {
      await requestPasswordReset(data.email);
    } catch (error) {
      // Enumeration-safe: never reveal whether the account exists.
      if (!isAxiosError(error)) {
        toast.error("Could not send reset email");
      }
    } finally {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <div>
        <span className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-success/30 bg-success/10 text-success">
          <MailCheck className="h-5 w-5" />
        </span>
        <AuthHeader
          title="Check your inbox"
          subtitle="If an account exists for that email, we've sent a link to reset your password."
        />
        <Link
          href="/login"
          className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-border text-sm font-medium transition-colors hover:bg-accent"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <AuthHeader
        title="Forgot your password?"
        subtitle="Enter your email and we'll send you a link to reset it."
      />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Field label="Email" htmlFor="forgot-email" error={errors.email?.message}>
          <IconInput
            id="forgot-email"
            type="email"
            icon={Mail}
            autoComplete="email"
            placeholder="you@example.com"
            invalid={!!errors.email}
            {...register("email")}
          />
        </Field>
        <div className="pt-2">
          <SubmitButton pending={isSubmitting}>
            {isSubmitting ? "Sending…" : "Send reset link"}
          </SubmitButton>
        </div>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
