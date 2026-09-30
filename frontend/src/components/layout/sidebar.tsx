"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftRight,
  BarChart3,
  FlaskConical,
  Gift,
  History,
  Landmark,
  Layers,
  LayoutDashboard,
  ListOrdered,
  Megaphone,
  Timer,
  TrendingUp,
  Trophy,
  User,
  Users,
  Wallet,
  FilePlus2,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useLocaleStore } from "@/store/locale-store";

type NavItem = { href: string; labelKey: string; icon: typeof LayoutDashboard };

const SECTIONS: { labelKey: string; items: NavItem[] }[] = [
  {
    labelKey: "nav.section_overview",
    items: [{ href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard }],
  },
  {
    labelKey: "nav.section_trade",
    items: [
      { href: "/trade/spot/BTCUSDT", labelKey: "nav.spot", icon: ArrowLeftRight },
      { href: "/trade/futures/BTCUSDT", labelKey: "nav.futures", icon: TrendingUp },
      { href: "/trade/binary/BTCUSDT", labelKey: "nav.binary", icon: Timer },
      { href: "/trade/demo", labelKey: "nav.demo", icon: FlaskConical },
    ],
  },
  {
    labelKey: "nav.section_markets",
    items: [
      { href: "/markets", labelKey: "nav.markets", icon: BarChart3 },
      { href: "/p2p", labelKey: "nav.p2p", icon: Users },
      { href: "/funding", labelKey: "nav.funding", icon: Landmark },
      { href: "/leaderboard", labelKey: "nav.leaderboard", icon: Trophy },
      { href: "/listing-application", labelKey: "listing.title", icon: FilePlus2 },
    ],
  },
  {
    labelKey: "nav.section_account",
    items: [
      { href: "/orders", labelKey: "nav.orders", icon: ListOrdered },
      { href: "/positions", labelKey: "nav.positions", icon: Layers },
      { href: "/history", labelKey: "nav.history", icon: History },
      { href: "/wallet", labelKey: "nav.wallet", icon: Wallet },
      { href: "/referral", labelKey: "nav.referral", icon: Gift },
      { href: "/announcements", labelKey: "nav.announcements", icon: Megaphone },
      { href: "/profile", labelKey: "nav.profile", icon: User },
    ],
  },
];

// The trade pages are dynamic per pair, so the section is what identifies them.
function isActive(pathname: string, href: string) {
  if (pathname === href) return true;
  return href.startsWith("/trade/") && pathname.startsWith(`${href.split("/").slice(0, 3).join("/")}/`);
}

export function Sidebar() {
  const { t } = useLocaleStore();
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 overflow-y-auto border-r border-border bg-card md:block">
      <nav className="flex flex-col gap-6 p-3">
        {SECTIONS.map((section) => (
          <div key={section.labelKey}>
            <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {t(section.labelKey)}
            </p>
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const active = isActive(pathname, item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {t(item.labelKey)}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
