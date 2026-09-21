"use client";

import Link from "next/link";
import { useLocaleStore } from "@/store/locale-store";

export function Sidebar() {
  const { t } = useLocaleStore();

  const navItems = [
    { href: "/dashboard", labelKey: "nav.dashboard" },
    { href: "/trade/futures/BTCUSDT", labelKey: "nav.futures" },
    { href: "/trade/binary/BTCUSDT", labelKey: "nav.binary" },
    { href: "/trade/demo", labelKey: "nav.demo" },
    { href: "/markets", labelKey: "nav.markets" },
    { href: "/orders", labelKey: "nav.orders" },
    { href: "/positions", labelKey: "nav.positions" },
    { href: "/history", labelKey: "nav.history" },
    { href: "/wallet", labelKey: "nav.wallet" },
    { href: "/referral", labelKey: "nav.referral" },
    { href: "/leaderboard", labelKey: "nav.leaderboard" },
    { href: "/p2p", labelKey: "nav.p2p" },
    { href: "/profile", labelKey: "nav.profile" },
  ];

  return (
    <aside className="hidden w-56 shrink-0 border-r border-border bg-card md:block">
      <nav className="flex flex-col gap-1 p-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            {t(item.labelKey)}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
