"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import Link from "next/link";
import toast from "react-hot-toast";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validators/auth";
import { requestPasswordReset } from "@/lib/api/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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

  return (
    <Card>
      <h1 className="text-xl font-semibold">Reset password</h1>
      {sent ? (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            If an account exists for that email, we&apos;ve sent a password reset link. Check your
            inbox.
          </p>
          <Link href="/login" className="block">
            <Button variant="secondary" className="w-full">
              Back to login
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your email and we&apos;ll send you a link to reset your password.
          </p>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <Input type="email" {...register("email")} />
              {errors.email && (
                <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              Send reset link
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Remembered it?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Log in
            </Link>
          </p>
        </>
      )}
    </Card>
  );
}
