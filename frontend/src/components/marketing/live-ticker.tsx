const trades = [
  { symbol: "BTC/USDT", change: "1.8%", points: "0,18 8,12 16,15 24,7 32,10 40,2" },
  { symbol: "XAU/USD", change: "1.8%", points: "0,16 8,17 16,10 24,12 32,4 40,6" },
  { symbol: "ETH/USDT", change: "0.2%", points: "0,14 8,10 16,16 24,8 32,11 40,5" },
  { symbol: "EUR/USD", change: "0.4%", points: "0,17 8,13 16,14 24,9 32,12 40,3" },
  { symbol: "US OIL", change: "2.1%", points: "0,19 8,14 16,9 24,11 32,3 40,1" },
];

export function LiveTicker() {
  return (
    <section className="border-t border-white/10 bg-[#0b0817] py-8 text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-baseline justify-center gap-x-3 gap-y-1 px-4">
        <h2 className="text-xl font-bold">Markets</h2>
        <p className="text-xs text-white/50">Sample data — not live market prices.</p>
      </div>

      <div className="mx-auto mt-6 max-w-6xl overflow-x-auto px-4">
        <div className="flex min-w-max items-center justify-center divide-x divide-white/10">
          {trades.map((trade) => (
            <div key={trade.symbol} className="flex items-center gap-4 px-6 first:pl-0 last:pr-0">
              <div>
                <p className="text-xs font-medium text-white/50">{trade.symbol}</p>
                <p className="mt-1 text-lg font-bold text-white">{trade.change}</p>
              </div>
              <svg width="40" height="20" viewBox="0 0 40 20" fill="none" aria-hidden="true">
                <polyline
                  points={trade.points}
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
