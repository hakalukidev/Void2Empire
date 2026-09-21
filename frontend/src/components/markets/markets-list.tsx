import Link from "next/link";
import { List } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const rows = [
  { symbol: "BTC/USDT", pair: "BTCUSDT", letter: "B", color: "bg-orange-500", price: "104,312.73", change: "-557.34", changePct: "-0.53%", up: false },
  { symbol: "ETH/USDT", pair: "ETHUSDT", letter: "E", color: "bg-indigo-500", price: "2,509.44", change: "-15.23", changePct: "-0.60%", up: false },
  { symbol: "GBP/USD", pair: "GBPUSD", letter: "G", color: "bg-emerald-500", price: "1.34654", change: "0.00444", changePct: "0.33%", up: true },
  { symbol: "CAD/USD", pair: "CADUSD", letter: "C", color: "bg-rose-500", price: "0.72966", change: "-557.34", changePct: "-0.53%", up: false },
  { symbol: "EUR/USD", pair: "EURUSD", letter: "E", color: "bg-sky-500", price: "1.14934", change: "0.00124", changePct: "0.11%", up: true },
];

export function MarketsList() {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#050b06] p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Markets</h2>
        <List className="h-4 w-4 text-white/40" />
      </div>

      <ul className="mt-4 divide-y divide-white/5">
        {rows.map((row) => (
          <li key={row.symbol}>
            <Link
              href={`/trade/futures/${row.pair}`}
              className="flex items-center justify-between gap-3 py-3 hover:opacity-80"
            >
              <span className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white",
                    row.color
                  )}
                >
                  {row.letter}
                </span>
                <span className="text-sm font-medium text-white">{row.symbol}</span>
              </span>
              <span className="text-right">
                <span className="block text-sm font-semibold text-white">{row.price}</span>
                <span
                  className={cn(
                    "block text-xs font-medium",
                    row.up ? "text-emerald-400" : "text-rose-400"
                  )}
                >
                  {row.change} {row.changePct}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
