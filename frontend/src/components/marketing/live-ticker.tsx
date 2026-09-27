import { Banknote, Bitcoin, Diamond, Gem, Landmark, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// No market-data feed is wired up yet (DR-023), so these figures are illustrative only.
const rows: {
  symbol: string;
  name: string;
  icon: LucideIcon;
  price: string;
  change: number;
}[] = [
  { symbol: "BTC/USDT", name: "Bitcoin", icon: Bitcoin, price: "63,204.50", change: 1.8 },
  { symbol: "ETH/USDT", name: "Ethereum", icon: Diamond, price: "3,142.60", change: 0.6 },
  { symbol: "EUR/USD", name: "Euro / US Dollar", icon: Banknote, price: "1.0824", change: -0.18 },
  {
    symbol: "GBP/USD",
    name: "British Pound / US Dollar",
    icon: Landmark,
    price: "1.2691",
    change: 0.12,
  },
  { symbol: "XAU/USD", name: "Gold", icon: Gem, price: "2,662.48", change: 0.32 },
  { symbol: "AAPL", name: "Apple Inc.", icon: TrendingUp, price: "228.40", change: -0.27 },
];

export function LiveTicker() {
  return (
    <section className="night border-y border-white/10 bg-[var(--brand-night)] py-8 text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-2 px-4">
        <h2 className="text-xl font-bold">Markets</h2>
        <span className="rounded-full border border-brand-gold-500/40 bg-brand-gold-500/10 px-3 py-1 text-xs font-medium text-brand-gold-400">
          Illustrative — not live prices
        </span>
      </div>

      <div className="mx-auto mt-6 max-w-6xl overflow-x-auto px-4">
        <div className="flex min-w-max items-stretch justify-center divide-x divide-white/10">
          {rows.map((row) => {
            const Icon = row.icon;
            const up = row.change >= 0;
            return (
              <div key={row.symbol} className="flex items-center gap-3 px-6 first:pl-0 last:pr-0">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-brand-gold-400">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs font-medium text-white/50">{row.name}</p>
                  <p className="mt-0.5 font-mono text-base font-bold tabular-nums text-white">
                    ${row.price}
                  </p>
                  {/* Fixed bright values: this band stays night-black in both themes,
                      so the theme-reactive PnL tokens would be too dark to read here. */}
                  <p
                    className={`mt-0.5 text-xs font-semibold tabular-nums ${
                      up ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {up ? "▲" : "▼"} {Math.abs(row.change).toFixed(2)}%
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
