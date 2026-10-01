"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail } from "lucide-react";
import toast from "react-hot-toast";
import { loginSchema, type LoginInput } from "@/lib/validators/auth";
import { loginUser } from "@/lib/api/auth";
import { safeNextPath } from "@/lib/auth/routes";
import { useAuthStore } from "@/store/auth-store";
import { useInAuthModal } from "@/components/auth/auth-context";
import { AuthHeader, Field, IconInput, PasswordInput, SubmitButton } from "@/components/auth/fields";

export function LoginForm() {
  const router = useRouter();
  const inModal = useInAuthModal();
  const setUser = useAuthStore((state) => state.setUser);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    try {
      const user = await loginUser(data);
      setUser(user);
      toast.success(`Welcome back, ${user.fullName.split(" ")[0]}`);
      // Honor ?next= set by the auth guard (proxy.ts).
      const next = new URLSearchParams(window.location.search).get("next");
      router.push(safeNextPath(next));
    } catch (error) {
      const message = isAxiosError(error) ? error.response?.data?.error : undefined;
      toast.error(message ?? "Could not log in");
    }
  };

  return (
    <div>
      <AuthHeader title="Welcome back" subtitle="Log in to continue trading on Void2Empire." />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Field label="Email" htmlFor="login-email" error={errors.email?.message}>
          <IconInput
            id="login-email"
            type="email"
            icon={Mail}
            autoComplete="email"
            placeholder="you@example.com"
            invalid={!!errors.email}
            {...register("email")}
          />
        </Field>

        <Field
          label="Password"
          htmlFor="login-password"
          error={errors.password?.message}
          aside={
            <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">
              Forgot password?
            </Link>
          }
        >
          <PasswordInput
            id="login-password"
            icon={Lock}
            autoComplete="current-password"
            placeholder="Enter your password"
            invalid={!!errors.password}
            {...register("password")}
          />
        </Field>

        <div className="pt-2">
          <SubmitButton pending={isSubmitting}>
            {isSubmitting ? "Logging in…" : "Log in"}
          </SubmitButton>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to Void2Empire?{" "}
        <Link href="/register" replace={inModal} className="font-medium text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
