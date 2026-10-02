"use client";

import Link from "next/link";
import { ArrowRight, Box, GraduationCap, TrendingUp, Zap } from "lucide-react";
import { HeroScene } from "@/components/home/hero-scene";
import { useLocaleStore } from "@/store/locale-store";

// Each product gets its own accent so the four tiles read as four different
// things. The band is pinned to the night ramp, so these tints stay legible on
// it in both themes: a light glyph on a faint wash of its own hue, ringed in it.
const cards = [
  {
    href: "/trade/spot/BTCUSDT",
    icon: Box,
    tile: "bg-sky-500/15 text-sky-300 ring-sky-400/40",
    titleKey: "home.card_spot",
    descKey: "home.card_spot_desc",
  },
  {
    href: "/trade/futures/BTCUSDT",
    icon: Zap,
    tile: "bg-violet-500/15 text-violet-300 ring-violet-400/40",
    titleKey: "home.card_futures",
    descKey: "home.card_futures_desc",
  },
  {
    href: "/trade/binary/BTCUSDT",
    icon: TrendingUp,
    tile: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/40",
    titleKey: "home.card_binary",
    descKey: "home.card_binary_desc",
  },
  {
    href: "/trade/demo",
    icon: GraduationCap,
    tile: "bg-amber-500/15 text-amber-300 ring-amber-400/40",
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
      <div className="night @container relative bg-[linear-gradient(120deg,var(--brand-night),#0d1b3a_55%,var(--brand-night))] p-6 text-white">
        {/* One row: heading, artwork, then the four cards. The breakpoints are
            container queries on the band itself, not the viewport: the band's
            width depends on the sidebars and on browser zoom, and a viewport
            breakpoint hid the art on a zoomed 1920 screen that had room for it.
            The art gets its own grid track rather than overlaying the heading,
            so it can never land on text; below 46rem it drops out and the cards
            go two by two. */}
        <div className="grid gap-5 @min-[40rem]:grid-cols-[auto_minmax(0,1fr)] @min-[40rem]:items-center @min-[46rem]:grid-cols-[auto_auto_minmax(0,1fr)] @min-[46rem]:gap-3.5 @min-[72rem]:gap-5">
          <div className="min-w-0">
            <p className="text-2xl font-medium text-white @min-[46rem]:text-xl @min-[64rem]:text-2xl @min-[80rem]:text-3xl">
              {t("home.welcome")}
            </p>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight @min-[46rem]:text-[34px] @min-[64rem]:text-4xl @min-[80rem]:text-5xl">
              Void2<span className="text-brand-blue-500">Empire</span>
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-white/90 @min-[46rem]:text-[13px] @min-[64rem]:text-[15px]">
              {t("home.tagline_markets")}
              <br />
              {t("home.tagline_confidence")}
            </p>
          </div>

          {/* Bleeds into the band's padding so the scene runs edge to edge
              vertically, and into the gaps on either side, where it has
              already faded out. */}
          <HeroScene className="-mx-4 -my-6 hidden h-[170px] w-auto @min-[46rem]:block @min-[60rem]:h-[200px]" />

          <ul className="grid min-w-0 grid-cols-2 gap-3 @min-[46rem]:grid-cols-4 @min-[46rem]:gap-2.5 @min-[72rem]:gap-3">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <li key={card.href}>
                  <Link
                    href={card.href}
                    className="flex h-full w-full flex-col gap-2.5 rounded-xl border border-white/10 bg-[#0b1630]/70 p-3 @min-[46rem]:p-2.5 @min-[72rem]:p-3 transition-colors hover:border-brand-blue-400/50 hover:bg-[#0f1d3d]"
                  >
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ring-1 ${card.tile}`}
                    >
                      <Icon className="h-[18px] w-[18px]" />
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
