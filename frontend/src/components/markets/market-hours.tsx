import { ChevronRight, Moon, Sun } from "lucide-react";
import { WORLD_LAND_PATH } from "@/components/marketing/world-land-path";

const sessions = [
  { city: "New York", flag: "🇺🇸", open: true, note: "54m left", x: 153, y: 71 },
  { city: "London", flag: "🇬🇧", open: false, note: "3h 57m to go", x: 260, y: 56 },
  { city: "Tokyo", flag: "🇯🇵", open: false, note: "51m left", x: 462, y: 78 },
];

export function MarketHours() {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#050b06] p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Market hours</h2>
        <ChevronRight className="h-4 w-4 text-white/40" />
      </div>

      <div className="relative mt-4 overflow-hidden rounded-xl bg-white/[0.03]">
        <svg viewBox="0 0 520 260" className="h-32 w-full" preserveAspectRatio="xMidYMid slice">
          <path d={WORLD_LAND_PATH} fill="#ffffff" fillOpacity="0.08" />
          {sessions.map((s) => (
            <g key={s.city}>
              {s.open && <circle cx={s.x} cy={s.y} r="7" fill="#a3e635" fillOpacity="0.25" />}
              <circle cx={s.x} cy={s.y} r="3.5" fill="#a3e635" stroke="#050b06" strokeWidth="1" />
            </g>
          ))}
        </svg>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        {sessions.map((s) => (
          <div key={s.city}>
            {s.open ? (
              <Sun className="mx-auto h-4 w-4 text-lime-400" />
            ) : (
              <Moon className="mx-auto h-4 w-4 text-white/40" />
            )}
            <p className="mt-1 text-xs font-medium text-white">{s.city}</p>
            <p className="text-[11px] text-white/40">{s.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
