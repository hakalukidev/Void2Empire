"use client";

import Link from "next/link";
import { SampleBadge } from "@/components/home/sample-badge";
import {
  buildSparkline,
  formatPrice,
  sampleMarkets,
  type SampleMarket,
} from "@/config/sample-market-data";
import { useLocaleStore } from "@/store/locale-store";

function Sparkline({ market }: { market: SampleMarket }) {
  const points = buildSparkline(market);
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const path = points
    .map((value, index) => {
      const x = (index / (points.length - 1)) * 100;
      const y = 28 - ((value - min) / span) * 26 - 1;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
  const up = market.changePercent24h >= 0;

  return (
    <svg
      viewBox="0 0 100 28"
      preserveAspectRatio="none"
      className="h-7 w-full"
      role="img"
      aria-label={market.pair}
    >
      <polyline
        points={path}
        fill="none"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        className={up ? "stroke-success" : "stroke-danger"}
      />
    </svg>
  );
}

export function QuickTrade() {
  const { t } = useLocaleStore();

  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-base font-semibold">{t("home.quick_trade")}</h2>
        <p className="text-xs text-muted-foreground">{t("home.quick_trade_sub")}</p>
        <SampleBadge className="ml-auto" />
      </div>

      <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {sampleMarkets.slice(0, 4).map((market) => {
          const Icon = market.icon;
          const up = market.changePercent24h >= 0;
          return (
            <li
              key={market.symbol}
              className="rounded-lg border border-border bg-secondary/40 p-3"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="truncate text-sm font-semibold">{market.pair}</span>
              </div>

              <div className="mt-2 flex items-end justify-between gap-2">
                <div>
                  <p className="font-mono text-sm font-bold tabular-nums">
                    {formatPrice(market.price, market.precision)}
                  </p>
                  <p
                    className={`mt-0.5 font-mono text-xs font-semibold tabular-nums ${
                      up ? "text-success" : "text-danger"
                    }`}
                  >
                    {up ? "+" : ""}
                    {market.changePercent24h.toFixed(2)}%
                  </p>
                </div>
                <div className="w-16 shrink-0">
                  <Sparkline market={market} />
                </div>
              </div>

              <Link
                href={`/trade/spot/${market.symbol}`}
                className="mt-3 block rounded-md bg-primary px-3 py-1.5 text-center text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                {t("home.trade")}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
