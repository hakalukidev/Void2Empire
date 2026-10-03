"use client";

import Link from "next/link";
import { ArrowLeft, ArrowUpDown, ShieldCheck, Wallet } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useLocaleStore } from "@/store/locale-store";
import { DEMO_STARTING_BALANCE } from "@/store/account-store";
import { formatDecimalString } from "@/lib/utils/decimal";

// Decorative sparkline for the demo-balance card; not market data.
const SPARK =
  "M0 46 L18 40 L34 43 L52 30 L70 34 L88 22 L106 27 L124 15 L142 19 L160 8 L180 12 L200 4";

function BrandPanel() {
  const { t } = useLocaleStore();
  // Read from the same constant the demo account is funded with, so this card
  // can never advertise a balance the app does not give out.
  const demoAmount = formatDecimalString(DEMO_STARTING_BALANCE, 2);

  const assurances = [
    {
      icon: ShieldCheck,
      title: t("auth.assurance_verified_title"),
      description: t("auth.assurance_verified_desc"),
    },
    {
      icon: ArrowUpDown,
      title: t("auth.assurance_markets_title"),
      description: t("auth.assurance_markets_desc"),
    },
    {
      icon: Wallet,
      // The balance is interpolated here because t() has no interpolation.
      title: `${t("auth.assurance_demo_title_before")} $${formatDecimalString(
        DEMO_STARTING_BALANCE,
        0
      )} ${t("auth.assurance_demo_title_after")}`,
      description: t("auth.assurance_demo_desc"),
    },
  ];

  return (
    <aside className="night relative hidden overflow-hidden bg-[var(--brand-night)] text-white lg:flex lg:flex-col">
      {/* Grid + glows */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_at_30%_40%,black,transparent_75%)]" />
      <div className="pointer-events-none absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-brand-blue-500/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 right-0 h-[24rem] w-[24rem] rounded-full bg-brand-blue-700/25 blur-[120px]" />

      <div className="relative z-10 flex flex-1 flex-col px-12 py-10 xl:px-16">
        <Link href="/" aria-label={t("auth.brand_home_aria")} className="w-fit">
          <Logo />
        </Link>

        <div className="my-auto max-w-md py-12">
          {/* The three-word motto is brand text, kept identical in both locales. */}
          <span className="text-xs font-medium uppercase tracking-[0.3em] text-brand-blue-400/80">
            Trade · Grow · Rule
          </span>
          <h2 className="mt-4 text-4xl font-bold leading-[1.1] tracking-tight xl:text-5xl">
            <span className="bg-linear-to-r from-white to-white/70 bg-clip-text text-transparent">
              {t("auth.headline_before")}
            </span>{" "}
            <span className="bg-linear-to-r from-brand-blue-300 via-brand-blue-400 to-brand-blue-600 bg-clip-text text-transparent">
              {t("auth.headline_accent")}
            </span>
          </h2>
          <p className="mt-4 text-base text-white/55">{t("auth.brand_sub")}</p>

          {/* Glass card */}
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/40 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/45">{t("demo.balance")}</p>
                <p className="mt-1 font-mono text-2xl font-semibold tabular-nums">${demoAmount}</p>
              </div>
              <span className="rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-[11px] font-medium text-success">
                {t("auth.virtual_funds")}
              </span>
            </div>
            <svg
              viewBox="0 0 200 50"
              preserveAspectRatio="none"
              className="mt-4 h-14 w-full"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="auth-spark-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="var(--brand-blue-500)" stopOpacity="0.35" />
                  <stop offset="1" stopColor="var(--brand-blue-500)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={`${SPARK} L200 50 L0 50 Z`} fill="url(#auth-spark-fill)" />
              <path
                d={SPARK}
                fill="none"
                stroke="var(--brand-blue-400)"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>

          <ul className="mt-10 space-y-5">
            {assurances.map((item) => (
              <li key={item.title} className="flex items-start gap-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-brand-blue-500/30 bg-brand-blue-500/10 text-brand-blue-400">
                  <item.icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="mt-0.5 text-sm text-white/45">{item.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-white/35">{t("auth.risk_line")}</p>
      </div>
    </aside>
  );
}

// Full-page frame for /login, /register and the other auth routes when they
// are opened directly (hard navigation). Soft navigations show AuthModal instead.
export function AuthShell({ children }: { children: React.ReactNode }) {
  const { t } = useLocaleStore();

  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <BrandPanel />

      <main className="relative flex flex-col bg-background">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,rgba(76,141,255,0.10),transparent_70%)]" />

        <header className="relative z-10 flex items-center justify-between px-5 py-5 sm:px-8">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("auth.home")}
          </Link>
          <Link href="/" aria-label={t("auth.brand_home_aria")} className="lg:hidden">
            <Logo size={26} />
          </Link>
          <ThemeToggle />
        </header>

        <div className="relative z-10 flex flex-1 items-start justify-center px-5 pb-12 pt-6 sm:items-center sm:px-8 sm:pt-4">
          <div className="w-full max-w-[420px] animate-rise-in">{children}</div>
        </div>
      </main>
    </div>
  );
}
