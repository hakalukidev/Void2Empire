"use client";

import { useState } from "react";
import Link from "next/link";
import { BarChart3, Calendar, LayoutGrid, Settings, Wallet } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Logo } from "@/components/ui/logo";

const navItems = [
  { href: "/markets", label: "Discover", icon: LayoutGrid },
  { href: "/positions", label: "Assets", icon: BarChart3 },
  { href: "/wallet", label: "Funds", icon: Wallet },
  { href: "#economic-events", label: "Economic Calendar", icon: Calendar },
  { href: "/profile", label: "Settings", icon: Settings },
];

export function MarketsSidebar() {
  const [tab, setTab] = useState<"market" | "trades">("market");

  return (
    <aside className="hidden w-60 shrink-0 flex-col gap-8 border-r border-white/5 bg-[#050b06] p-5 lg:flex">
      <Link href="/" className="flex items-center gap-2">
        <Logo className="text-white" />
      </Link>

      <div className="grid grid-cols-2 gap-1 rounded-lg bg-white/5 p-1 text-sm font-medium">
        <button
          type="button"
          onClick={() => setTab("market")}
          className={cn(
            "rounded-md py-2 transition-colors",
            tab === "market" ? "bg-lime-400 text-black" : "text-white/50 hover:text-white"
          )}
        >
          Market
        </button>
        <button
          type="button"
          onClick={() => setTab("trades")}
          className={cn(
            "rounded-md py-2 transition-colors",
            tab === "trades" ? "bg-lime-400 text-black" : "text-white/50 hover:text-white"
          )}
        >
          Trades
        </button>
      </div>

      <nav className="flex flex-col gap-1">
        {navItems.map((item, index) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              index === 0
                ? "bg-white/10 text-white"
                : "text-white/50 hover:bg-white/5 hover:text-white"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
