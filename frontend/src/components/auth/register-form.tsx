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
import { useLocaleStore } from "@/store/locale-store";
import { DEMO_STARTING_BALANCE } from "@/store/account-store";
import { formatDecimalString } from "@/lib/utils/decimal";
import { useInAuthModal } from "@/components/auth/auth-context";
import { AuthHeader, Field, IconInput, PasswordInput, SubmitButton } from "@/components/auth/fields";
import { AuthDivider, GoogleButton } from "@/components/auth/google-button";
import { PasswordStrength } from "@/components/auth/password-strength";
import { PhoneInput, findCountry } from "@/components/ui/phone-input";
import { CountryFlag } from "@/components/ui/country-flag";

const DEFAULT_COUNTRY_ISO2 = "BD";

export function RegisterForm() {
  const router = useRouter();
  const inModal = useInAuthModal();
  const { t, locale } = useLocaleStore();
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
      await registerUser({
        fullName: data.fullName,
        email: data.email,
        country: data.country,
        phone: data.phone,
        password: data.password,
      });
      toast.success(t("auth.register_success"));
      // Registration starts no session: verification is mandatory, and the
      // verify page is what signs the new account in.
      router.push(`/verify?email=${encodeURIComponent(data.email)}`);
    } catch (error) {
      const message = isAxiosError(error) ? error.response?.data?.error : undefined;
      toast.error(message ?? t("auth.register_failed"));
    }
  };

  return (
    <div>
      <AuthHeader
        title={t("auth.register_title")}
        subtitle={`${t("auth.register_subtitle_before")} $${formatDecimalString(
          DEMO_STARTING_BALANCE,
          0
        )} ${t("auth.register_subtitle_after")}`}
      />

      <GoogleButton labelKey="auth.google_signup" />
      <AuthDivider />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Field label={t("auth.full_name")} htmlFor="register-name" error={errors.fullName?.message}>
          <IconInput
            id="register-name"
            icon={User}
            autoComplete="name"
            placeholder={t("auth.full_name_ph")}
            invalid={!!errors.fullName}
            {...register("fullName")}
          />
        </Field>

        <Field label={t("auth.email")} htmlFor="register-email" error={errors.email?.message}>
          <IconInput
            id="register-email"
            type="email"
            icon={Mail}
            autoComplete="email"
            placeholder={t("auth.email_ph")}
            invalid={!!errors.email}
            {...register("email")}
          />
        </Field>

        <Field label={t("auth.phone")} htmlFor="register-phone" error={errors.phone?.message}>
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

        <Field label={t("auth.country")} htmlFor="register-country" error={errors.country?.message}>
          <IconInput
            id="register-country"
            autoComplete="country-name"
            placeholder={t("auth.country_ph")}
            leading={
              countryMatch ? <CountryFlag iso2={countryMatch.iso2} /> : <Globe className="h-4 w-4" />
            }
            invalid={!!errors.country}
            {...register("country")}
          />
        </Field>

        <Field
          label={t("auth.password")}
          htmlFor="register-password"
          error={errors.password?.message}
        >
          <PasswordInput
            id="register-password"
            icon={Lock}
            autoComplete="new-password"
            placeholder={t("auth.password_ph_new")}
            invalid={!!errors.password}
            {...register("password")}
          />
          <PasswordStrength password={password ?? ""} />
        </Field>

        <Field
          label={t("auth.confirm_password")}
          htmlFor="register-confirm"
          error={errors.confirmPassword?.message}
          aside={
            passwordsMatch && (
              <span className="flex items-center gap-1 text-xs font-medium text-success">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {t("auth.passwords_match")}
              </span>
            )
          }
        >
          <PasswordInput
            id="register-confirm"
            icon={Lock}
            autoComplete="new-password"
            placeholder={t("auth.confirm_password_ph")}
            invalid={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
        </Field>

        <div className="pt-2">
          <SubmitButton pending={isSubmitting}>
            {isSubmitting ? t("auth.register_pending") : t("auth.register_btn")}
          </SubmitButton>
        </div>

        {/* The three legal titles are separate links, so the sentence is built
            here and the terminator follows the locale (t() has no interpolation). */}
        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          {t("auth.terms_before")}{" "}
          <Link href="/terms" target="_blank" rel="noopener noreferrer" className="text-foreground/80 underline-offset-2 hover:underline">
            {t("auth.terms_terms")}
          </Link>
          ,{" "}
          <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="text-foreground/80 underline-offset-2 hover:underline">
            {t("auth.terms_privacy")}
          </Link>{" "}
          {t("auth.terms_and")}{" "}
          <Link
            href="/risk-disclosure"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground/80 underline-offset-2 hover:underline"
          >
            {t("auth.terms_risk")}
          </Link>
          {locale === "bn" ? "।" : "."}
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t("auth.have_account")}{" "}
        <Link href="/login" replace={inModal} className="font-medium text-primary hover:underline">
          {t("auth.login_btn")}
        </Link>
      </p>
    </div>
  );
}
