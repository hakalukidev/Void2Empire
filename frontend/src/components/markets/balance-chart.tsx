const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const AXIS = ["40k", "35k", "30k", "25k", "20k"];

export function BalanceChart() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#050b06] p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(163,230,53,0.12),transparent_65%)]" />

      <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Balance</h2>
          <p className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl font-bold text-white">$4,999.95</span>
            <span className="rounded-full bg-white/10 px-2 py-1 text-xs font-semibold text-lime-400">
              ↑ 20%
            </span>
          </p>
        </div>
        <button
          type="button"
          className="rounded-full border border-white/10 px-4 py-1.5 text-sm text-white/60 hover:text-white"
        >
          6 Month
        </button>
      </div>

      <div className="relative z-10 mt-8 flex gap-3">
        <div className="flex flex-col justify-between py-2 text-xs text-white/30">
          {AXIS.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>

        <div className="relative flex-1">
          <svg viewBox="0 0 600 260" className="h-64 w-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="balance-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a3e635" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#a3e635" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0 190 L50 175 L100 160 L150 130 L200 165 L250 210 L300 195 L350 130 L400 60 L450 90 L500 120 L550 105 L600 115 L600 260 L0 260 Z"
              fill="url(#balance-fill)"
            />
            <path
              d="M0 190 L50 175 L100 160 L150 130 L200 165 L250 210 L300 195 L350 130 L400 60 L450 90 L500 120 L550 105 L600 115"
              fill="none"
              stroke="#a3e635"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line x1="400" y1="0" x2="400" y2="260" stroke="#a3e635" strokeOpacity="0.3" strokeDasharray="4 4" />
            <circle cx="400" cy="60" r="5" fill="#050b06" stroke="#a3e635" strokeWidth="2.5" />
          </svg>

          <div className="pointer-events-none absolute left-[54%] top-6 -translate-x-1/2 rounded-xl border border-white/10 bg-[#0c150d] px-4 py-2 shadow-xl">
            <p className="flex items-center gap-1 text-sm font-semibold text-lime-400">
              ↑ $36,126.00
            </p>
            <p className="text-xs text-white/40">Total</p>
          </div>

          <div className="mt-2 flex justify-between text-xs text-white/30">
            {MONTHS.map((month) => (
              <span key={month}>{month}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
