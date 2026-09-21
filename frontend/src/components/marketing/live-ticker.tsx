const trades = [
  { symbol: "BTC/USDT", change: "1.8%", gain: "$12", points: "0,18 8,12 16,15 24,7 32,10 40,2" },
  { symbol: "XAU/USD", change: "1.8%", gain: "$12", points: "0,16 8,17 16,10 24,12 32,4 40,6" },
  { symbol: "ETH/USDT", change: "0.2%", gain: "$31", points: "0,14 8,10 16,16 24,8 32,11 40,5" },
  { symbol: "EUR/USD", change: "0.4%", gain: "$5", points: "0,17 8,13 16,14 24,9 32,12 40,3" },
  { symbol: "US OIL", change: "2.1%", gain: "$49", points: "0,19 8,14 16,9 24,11 32,3 40,1" },
];

export function LiveTicker() {
  return (
    <section className="border-t border-white/10 bg-[#0b0817] py-8 text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-4">
        <h2 className="text-xl font-bold">Live Trades</h2>
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500" />
        </span>
      </div>

      <div className="mx-auto mt-6 max-w-6xl overflow-x-auto px-4">
        <div className="flex min-w-max items-center justify-center divide-x divide-white/10">
          {trades.map((trade) => (
            <div key={trade.symbol} className="flex items-center gap-4 px-6 first:pl-0 last:pr-0">
              <div>
                <p className="text-xs font-medium text-white/50">{trade.symbol}</p>
                <p className="mt-1 text-lg font-bold text-white">+ {trade.gain}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                    <path d="M1 9L9 1M9 1H3M9 1V7" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  {trade.change}
                </span>
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
