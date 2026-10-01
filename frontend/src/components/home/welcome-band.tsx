"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpDown, LayoutDashboard, Timer, TrendingUp } from "lucide-react";
import { LogoMark } from "@/components/ui/logo";
import { useLocaleStore } from "@/store/locale-store";

// Each product gets its own accent so the four tiles read as four different
// things. The band is pinned to the night ramp, so these bright pairs stay
// legible on it in both themes; the glyphs sit on solid fills at 4:1 or better.
const cards = [
  {
    href: "/trade/spot/BTCUSDT",
    icon: ArrowUpDown,
    tile: "bg-brand-blue-400 text-[var(--brand-night)]",
    titleKey: "home.card_spot",
    descKey: "home.card_spot_desc",
  },
  {
    href: "/trade/futures/BTCUSDT",
    icon: TrendingUp,
    tile: "bg-violet-500 text-white",
    titleKey: "home.card_futures",
    descKey: "home.card_futures_desc",
  },
  {
    href: "/trade/binary/BTCUSDT",
    icon: Timer,
    tile: "bg-emerald-400 text-[var(--brand-night)]",
    titleKey: "home.card_binary",
    descKey: "home.card_binary_desc",
  },
  {
    href: "/trade/demo",
    icon: LayoutDashboard,
    tile: "bg-amber-400 text-[var(--brand-night)]",
    titleKey: "home.card_demo",
    descKey: "home.card_demo_desc",
  },
];

export function WelcomeBand() {
  const { t } = useLocaleStore();

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card">
      {/* `night` pins the palette to the dark ramp: the backdrop is always black,
          so a theme-reactive blue would go too dark to read on it in light mode. */}
      <div className="night relative bg-[linear-gradient(120deg,var(--brand-night),#0d1b3a_55%,var(--brand-night))] p-6 text-white">
        {/* One row: heading, mark, then the four cards. The mark is a flex
            sibling of the heading rather than an overlay, so it can never land on
            text, and it only appears once the column can spare it 120px — which
            at this layout is 1440 and up. Below that the cards stay two by two. */}
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.55fr)] lg:items-center">
          <div className="flex min-w-0 items-center gap-5">
            <div className="min-w-0 flex-1">
              <p className="text-2xl font-semibold text-white/70">{t("home.welcome")}</p>
              <h1 className="mt-1 text-[28px] font-extrabold leading-tight tracking-tight 2xl:text-4xl">
                Void2<span className="text-brand-blue-400">Empire</span>
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-white/70">{t("home.welcome_lead")}</p>
            </div>

            <LogoMark
              size={100}
              aria-hidden
              className="hidden shrink-0 drop-shadow-[0_0_30px_rgba(76,141,255,0.5)] min-[1440px]:block"
            />
          </div>

          <ul className="grid min-w-0 grid-cols-2 gap-3 min-[1440px]:grid-cols-4">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <li key={card.href}>
                  <Link
                    href={card.href}
                    className="flex h-full w-full flex-col gap-2.5 rounded-xl border border-white/15 bg-white/5 p-3 transition-colors hover:border-white/30 hover:bg-white/10"
                  >
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.tile}`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-xs font-semibold leading-snug">{t(card.titleKey)}</span>
                    <span className="text-[11px] leading-snug text-white/60">{t(card.descKey)}</span>
                    <ArrowRight className="mt-auto h-4 w-4 text-brand-blue-400" aria-hidden />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
