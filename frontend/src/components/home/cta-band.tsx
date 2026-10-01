"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LogoMark } from "@/components/ui/logo";
import { useLocaleStore } from "@/store/locale-store";

export function CtaBand() {
  const { t } = useLocaleStore();

  return (
    <section className="night relative overflow-hidden rounded-xl border border-border bg-[linear-gradient(110deg,var(--brand-night),#0d1b3a_60%,var(--brand-night))] px-6 py-8 text-white">
      <LogoMark
        size={180}
        aria-hidden
        className="pointer-events-none absolute -bottom-10 right-4 opacity-25 drop-shadow-[0_0_35px_rgba(76,141,255,0.5)]"
      />

      <div className="relative flex flex-wrap items-center justify-between gap-6">
        <div className="max-w-lg">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-blue-400">
            <LogoMark size={16} aria-hidden />
            Void2Empire
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            {t("home.cta_title")}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-white/70">{t("home.cta_sub")}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/trade/demo">
            <span className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90">
              {t("home.cta_demo")}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </span>
          </Link>
          <Link href="/register">
            <span className="inline-flex h-11 items-center rounded-full border border-white/25 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10">
              {t("home.cta_register")}
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
