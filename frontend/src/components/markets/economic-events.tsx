"use client";

import { useState } from "react";
import { Bell, BellOff, Calendar } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const events = [
  { id: "cpi", time: "00:00", flag: "🇯🇵", name: "CPI MoM", forecast: "-0.4%", previous: "-0.2%" },
  { id: "ppi", time: "02:01", flag: "🇺🇸", name: "PPI YoY", forecast: "-0.3%", previous: "-0.8%" },
  { id: "retail", time: "02:30", flag: "🇩🇪", name: "Retail Sales MoM", forecast: "-0.2%", previous: "-0.6%" },
  { id: "unemployment", time: "02:50", flag: "🇬🇧", name: "Unemployment Rate", forecast: "4.3%", previous: "4.2%" },
];

export function EconomicEvents() {
  const [subscribed, setSubscribed] = useState<Record<string, boolean>>({});

  return (
    <div id="economic-events" className="rounded-2xl border border-white/5 bg-[#050b06] p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Economic Events</h2>
        <Calendar className="h-4 w-4 text-white/40" />
      </div>

      <p className="mt-4 rounded-lg bg-white/5 px-3 py-2 text-sm text-white/60">Today</p>

      <ul className="mt-3 divide-y divide-white/5">
        {events.map((event) => {
          const isOn = subscribed[event.id];
          return (
            <li key={event.id} className="flex items-center justify-between gap-3 py-3">
              <span className="w-12 shrink-0 text-xs text-white/40">{event.time}</span>
              <span className="text-lg">{event.flag}</span>
              <span className="flex-1 text-sm text-white/80">{event.name}</span>
              <span className="w-24 shrink-0 text-right text-xs text-white/40">
                F: {event.forecast}
                <br />
                P: {event.previous}
              </span>
              <button
                type="button"
                aria-label={isOn ? "Unsubscribe from reminder" : "Subscribe to reminder"}
                onClick={() => setSubscribed((s) => ({ ...s, [event.id]: !s[event.id] }))}
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors",
                  isOn ? "bg-lime-400 text-black" : "bg-white/5 text-white/40 hover:text-white"
                )}
              >
                {isOn ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
