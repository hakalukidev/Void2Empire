"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { SampleBadge } from "@/components/home/sample-badge";
import {
  formatPrice,
  sampleMarkets,
  type SampleMarket,
} from "@/config/sample-market-data";
import { useLocaleStore } from "@/store/locale-store";

type Tab = "all" | "gainers" | "losers";

function ChangeCell({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span
      className={`shrink-0 font-mono text-xs font-semibold tabular-nums ${
        up ? "text-success" : "text-danger"
      }`}
    >
      {up ? "+" : ""}
      {value.toFixed(2)}%
    </span>
  );
}

function MarketRow({ market }: { market: SampleMarket }) {
  const Icon = market.icon;
  return (
    <li>
      <Link
        href={`/trade/spot/${market.symbol}`}
        className="flex items-center gap-1.5 rounded-lg px-2 py-2 transition-colors hover:bg-accent"
      >
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Icon className="h-3 w-3" />
        </span>
        <span className="min-w-0 flex-1 truncate text-[13px] font-medium">{market.pair}</span>
        <span className="w-[4.25rem] shrink-0 text-right font-mono text-[13px] tabular-nums">
          {formatPrice(market.price, market.precision)}
        </span>
        <span className="w-14 shrink-0 text-right">
          <ChangeCell value={market.changePercent24h} />
        </span>
      </Link>
    </li>
  );
}

const tabs: { id: Tab; labelKey: string }[] = [
  { id: "all", labelKey: "home.tab_all" },
  { id: "gainers", labelKey: "home.tab_gainers" },
  { id: "losers", labelKey: "home.tab_losers" },
];

export function MarketWatch() {
  const { t } = useLocaleStore();
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");

  const byChange = [...sampleMarkets].sort((a, b) => b.changePercent24h - a.changePercent24h);
  const rows =
    tab === "all"
      ? sampleMarkets
      : tab === "gainers"
        ? byChange.filter((market) => market.changePercent24h >= 0)
        : [...byChange].reverse().filter((market) => market.changePercent24h < 0);

  const needle = query.trim().toLowerCase();
  const filtered = needle
    ? rows.filter(
        (market) =>
          market.pair.toLowerCase().includes(needle) || market.name.toLowerCase().includes(needle)
      )
    : rows;

  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="whitespace-nowrap text-sm font-semibold">{t("home.market_watch")}</h2>
        <SampleBadge className="ml-auto" />
      </div>

      <label className="mt-3 block">
        <span className="sr-only">{t("home.filter_label")}</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("home.filter_placeholder")}
          className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </label>

      <div
        role="group"
        aria-label={t("home.market_watch")}
        className="mt-3 flex items-center gap-1 rounded-lg border border-border bg-secondary p-1"
      >
        {tabs.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => setTab(entry.id)}
            aria-pressed={tab === entry.id}
            className={`flex-1 rounded px-2 py-1 text-xs font-semibold transition-colors ${
              tab === entry.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t(entry.labelKey)}
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-1.5 px-2 text-[10px] font-medium uppercase tracking-normal text-muted-foreground">
        {/* Lines the label up with the pair text, which starts after the icon. */}
        <span className="flex-1 pl-[26px]">{t("home.col_pair")}</span>
        <span className="w-[4.25rem] shrink-0 text-right">{t("home.col_price")}</span>
        <span className="w-14 shrink-0 whitespace-nowrap text-right">{t("home.col_change")}</span>
      </div>

      <ul className="mt-1">
        {filtered.map((market) => (
          <MarketRow key={market.symbol} market={market} />
        ))}
      </ul>
      {filtered.length === 0 && (
        <p className="px-2 py-4 text-xs text-muted-foreground">{t("home.filter_empty")}</p>
      )}

      <Link
        href="/markets"
        className="mt-2 flex items-center gap-1 px-2 text-xs font-semibold text-primary hover:underline"
      >
        {t("home.view_all_markets")}
        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
      </Link>
    </section>
  );
}

export function TopGainers() {
  const { t } = useLocaleStore();
  const gainers = [...sampleMarkets]
    .filter((market) => market.changePercent24h >= 0)
    .sort((a, b) => b.changePercent24h - a.changePercent24h);

  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="whitespace-nowrap text-sm font-semibold">{t("home.top_gainers")}</h2>
        <span className="rounded border border-border px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
          {t("home.window_24h")}
        </span>
        <SampleBadge className="ml-auto" />
      </div>

      <ul className="mt-2">
        {gainers.map((market) => (
          <MarketRow key={market.symbol} market={market} />
        ))}
      </ul>

      <Link
        href="/markets"
        className="mt-2 flex items-center gap-1 px-2 text-xs font-semibold text-primary hover:underline"
      >
        {t("home.view_more")}
        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
      </Link>
    </section>
  );
}
