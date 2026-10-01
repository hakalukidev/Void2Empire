"use client";

import Link from "next/link";
import {
  ArrowLeftRight,
  ChevronRight,
  CircleDollarSign,
  Home,
  Landmark,
  LayoutDashboard,
  LifeBuoy,
  Timer,
  TrendingUp,
  Trophy,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { useLocaleStore } from "@/store/locale-store";

interface Row {
  href: string;
  icon: LucideIcon;
  titleKey: string;
  subKey: string;
}

interface Group {
  labelKey: string;
  rows: Row[];
}

// Earn, Copy Trading, Launchpad, Web3 Wallet and Daily Rewards are absent on
// purpose: none of them is in scope, so a nav entry would advertise a product
// the platform does not have.
const groups: Group[] = [
  {
    labelKey: "home.group_discover",
    rows: [
      { href: "/trade/spot/BTCUSDT", icon: ArrowLeftRight, titleKey: "home.spot", subKey: "home.spot_sub" },
      { href: "/trade/futures/BTCUSDT", icon: TrendingUp, titleKey: "home.futures", subKey: "home.futures_sub" },
      { href: "/trade/binary/BTCUSDT", icon: Timer, titleKey: "home.binary", subKey: "home.binary_sub" },
      { href: "/trade/demo", icon: LayoutDashboard, titleKey: "home.demo", subKey: "home.demo_sub" },
      { href: "/markets", icon: CircleDollarSign, titleKey: "home.markets", subKey: "home.markets_sub" },
    ],
  },
  {
    labelKey: "home.group_funding",
    rows: [
      { href: "/funding", icon: Landmark, titleKey: "home.funding", subKey: "home.funding_sub" },
      { href: "/p2p", icon: Users, titleKey: "home.p2p", subKey: "home.p2p_sub" },
      { href: "/leaderboard", icon: Trophy, titleKey: "home.leaderboard", subKey: "home.leaderboard_sub" },
    ],
  },
  {
    labelKey: "home.group_quick_access",
    rows: [
      { href: "/wallet/deposit", icon: Wallet, titleKey: "home.deposit", subKey: "home.deposit_sub" },
      { href: "/wallet/withdraw", icon: ArrowLeftRight, titleKey: "home.withdraw", subKey: "home.withdraw_sub" },
      { href: "/support", icon: LifeBuoy, titleKey: "home.support", subKey: "home.support_sub" },
    ],
  },
];

function SidebarRow({ row }: { row: Row }) {
  const { t } = useLocaleStore();
  const Icon = row.icon;
  return (
    <li>
      <Link
        href={row.href}
        className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-accent"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{t(row.titleKey)}</span>
          <span className="block truncate text-xs text-muted-foreground">{t(row.subKey)}</span>
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
      </Link>
    </li>
  );
}

export function HomeSidebar() {
  const { t } = useLocaleStore();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:block">
      <nav className="sticky top-16 space-y-6 p-4" aria-label={t("home.sidebar_label")}>
        <Link
          href="/"
          aria-current="page"
          className="flex items-center gap-3 rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          <Home className="h-4 w-4" />
          {t("home.nav_home")}
        </Link>

        {groups.map((group) => (
          <div key={group.labelKey}>
            <h2 className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t(group.labelKey)}
            </h2>
            <ul className="mt-2 space-y-1">
              {group.rows.map((row) => (
                <SidebarRow key={row.href} row={row} />
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
