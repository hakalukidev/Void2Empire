"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validators/auth";
import { resetPassword } from "@/lib/api/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({ resolver: zodResolver(resetPasswordSchema) });

  useEffect(() => {
    const urlToken = new URLSearchParams(window.location.search).get("token") ?? "";
    setToken(urlToken);
    setValue("token", urlToken);
  }, [setValue]);

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

  return (
    <Card>
      <h1 className="text-xl font-semibold">Choose a new password</h1>
      {!token ? (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-destructive">
            This password reset link is invalid or missing a token.
          </p>
          <Link href="/forgot-password" className="block">
            <Button variant="secondary" className="w-full">
              Request a new link
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <input type="hidden" {...register("token")} />
          <div>
            <label className="mb-1 block text-sm font-medium">New password</label>
            <Input type="password" {...register("password")} />
            {errors.password && (
              <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Confirm new password</label>
            <Input type="password" {...register("confirmPassword")} />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            Reset password
          </Button>
        </form>
      )}
    </Card>
  );
}
