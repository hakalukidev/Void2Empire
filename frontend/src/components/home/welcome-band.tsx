"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpDown, LayoutDashboard, Timer, TrendingUp } from "lucide-react";
import { LogoMark } from "@/components/ui/logo";
import { useLocaleStore } from "@/store/locale-store";

const cards = [
  { href: "/trade/spot/BTCUSDT", icon: ArrowUpDown, titleKey: "home.card_spot", descKey: "home.card_spot_desc" },
  { href: "/trade/futures/BTCUSDT", icon: TrendingUp, titleKey: "home.card_futures", descKey: "home.card_futures_desc" },
  { href: "/trade/binary/BTCUSDT", icon: Timer, titleKey: "home.card_binary", descKey: "home.card_binary_desc" },
  { href: "/trade/demo", icon: LayoutDashboard, titleKey: "home.card_demo", descKey: "home.card_demo_desc" },
];

export function WelcomeBand() {
  const { t } = useLocaleStore();

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card">
      {/* `night` pins the palette to the dark ramp: the backdrop is always black,
          so a theme-reactive blue would go too dark to read on it in light mode. */}
      <div className="night relative bg-[linear-gradient(120deg,var(--brand-night),#0d1b3a_55%,var(--brand-night))] p-6 text-white">
        {/* The mark is decorative here; the wordmark below carries the name. */}
        <LogoMark
          size={220}
          aria-hidden
          className="pointer-events-none absolute -right-6 top-1/2 hidden -translate-y-1/2 opacity-70 drop-shadow-[0_0_45px_rgba(76,141,255,0.55)] lg:block"
        />

        {/* The mark is decorative here; the wordmark carries the name. It shares
            the heading row as a flex item instead of an overlay, so it can never
            land on top of the text or the cards. */}
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="min-w-0 max-w-xl">
            <p className="text-2xl font-semibold text-white/70">{t("home.welcome")}</p>
            <h1 className="mt-1 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Void<span className="text-brand-blue-400">2Empire</span>
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-white/70">{t("home.welcome_lead")}</p>
          </div>

          <LogoMark
            size={160}
            aria-hidden
            className="hidden shrink-0 drop-shadow-[0_0_28px_rgba(76,141,255,0.45)] lg:block"
          />
        </div>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <li key={card.href}>
                <Link
                  href={card.href}
                  className="flex h-full w-full flex-col gap-3 rounded-xl border border-white/15 bg-white/5 p-4 transition-colors hover:border-white/30 hover:bg-white/10"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-semibold">{t(card.titleKey)}</span>
                  <span className="text-xs leading-snug text-white/60">{t(card.descKey)}</span>
                  <ArrowRight className="mt-auto h-4 w-4 text-brand-blue-400" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
