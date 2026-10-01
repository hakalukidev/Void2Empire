"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Globe, Lock, Mail, User } from "lucide-react";
import toast from "react-hot-toast";
import { registerSchema, type RegisterInput } from "@/lib/validators/auth";
import { registerUser } from "@/lib/api/auth";
import { countries } from "@/config/countries";
import { useAuthStore } from "@/store/auth-store";
import { useInAuthModal } from "@/components/auth/auth-context";
import { AuthHeader, Field, IconInput, PasswordInput, SubmitButton } from "@/components/auth/fields";
import { PasswordStrength } from "@/components/auth/password-strength";
import { PhoneInput, findCountry } from "@/components/ui/phone-input";
import { CountryFlag } from "@/components/ui/country-flag";

const DEFAULT_COUNTRY_ISO2 = "BD";

export function RegisterForm() {
  const router = useRouter();
  const inModal = useInAuthModal();
  const setUser = useAuthStore((state) => state.setUser);
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    // Country follows the phone's dial code; it starts on the PhoneInput default.
    defaultValues: { phone: "", country: findCountry(DEFAULT_COUNTRY_ISO2).name },
  });

  const [password, confirmPassword, countryName] = useWatch({
    control,
    name: ["password", "confirmPassword", "country"],
  });
  const countryMatch = countries.find(
    (c) => c.name.toLowerCase() === (countryName ?? "").trim().toLowerCase()
  );
  const passwordsMatch = !!confirmPassword && confirmPassword === password;

  const onSubmit = async (data: RegisterInput) => {
    try {
      const user = await registerUser({
        fullName: data.fullName,
        email: data.email,
        country: data.country,
        phone: data.phone,
        password: data.password,
      });
      setUser(user);
      toast.success("Account created");
      // Route to verification (REQ-008). The verify page is skippable, so this
      // does not make verification mandatory — that decision is DR-032 blocked.
      router.push(`/verify?email=${encodeURIComponent(data.email)}`);
    } catch (error) {
      const message = isAxiosError(error) ? error.response?.data?.error : undefined;
      toast.error(message ?? "Could not create account");
    }
  };

  return (
    <div>
      <AuthHeader
        title="Create your account"
        subtitle="Start with a $10,000 demo balance. No card required."
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Field label="Full name" htmlFor="register-name" error={errors.fullName?.message}>
          <IconInput
            id="register-name"
            icon={User}
            autoComplete="name"
            placeholder="Your full name"
            invalid={!!errors.fullName}
            {...register("fullName")}
          />
        </Field>

        <Field label="Email" htmlFor="register-email" error={errors.email?.message}>
          <IconInput
            id="register-email"
            type="email"
            icon={Mail}
            autoComplete="email"
            placeholder="you@example.com"
            invalid={!!errors.email}
            {...register("email")}
          />
        </Field>

        <Field label="Phone" htmlFor="register-phone" error={errors.phone?.message}>
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <PhoneInput
                id="register-phone"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                onCountryChange={(c) =>
                  setValue("country", c.name, { shouldValidate: true, shouldDirty: true })
                }
                defaultCountryIso2={DEFAULT_COUNTRY_ISO2}
                hasError={!!errors.phone}
              />
            )}
          />
        </Field>

        <Field label="Country" htmlFor="register-country" error={errors.country?.message}>
          <IconInput
            id="register-country"
            autoComplete="country-name"
            placeholder="Country of residence"
            leading={
              countryMatch ? <CountryFlag iso2={countryMatch.iso2} /> : <Globe className="h-4 w-4" />
            }
            invalid={!!errors.country}
            {...register("country")}
          />
        </Field>

        <Field label="Password" htmlFor="register-password" error={errors.password?.message}>
          <PasswordInput
            id="register-password"
            icon={Lock}
            autoComplete="new-password"
            placeholder="Create a strong password"
            invalid={!!errors.password}
            {...register("password")}
          />
          <PasswordStrength password={password ?? ""} />
        </Field>

        <Field
          label="Confirm password"
          htmlFor="register-confirm"
          error={errors.confirmPassword?.message}
          aside={
            passwordsMatch && (
              <span className="flex items-center gap-1 text-xs font-medium text-success">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Matches
              </span>
            )
          }
        >
          <PasswordInput
            id="register-confirm"
            icon={Lock}
            autoComplete="new-password"
            placeholder="Repeat your password"
            invalid={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
        </Field>

        <div className="pt-2">
          <SubmitButton pending={isSubmitting}>
            {isSubmitting ? "Creating account…" : "Create account"}
          </SubmitButton>
        </div>

        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          By creating an account you agree to our{" "}
          <Link href="/terms" target="_blank" rel="noopener noreferrer" className="text-foreground/80 underline-offset-2 hover:underline">
            Terms
          </Link>
          ,{" "}
          <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="text-foreground/80 underline-offset-2 hover:underline">
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link
            href="/risk-disclosure"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground/80 underline-offset-2 hover:underline"
          >
            Risk Disclosure
          </Link>
          .
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" replace={inModal} className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
