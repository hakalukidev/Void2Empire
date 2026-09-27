"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import {
  LayoutDashboard, Users, Coins, Settings2, ArrowDownCircle,
  ArrowUpCircle, Wallet, ArrowLeftRight, BarChart2, Megaphone,
  Activity, Settings, FileText, Users2, HandCoins, Ticket, DollarSign
} from "lucide-react";

const NAV_SECTIONS = [
  {
    label: "Operations",
    items: [
      { href: "/admin",                      label: "Overview",          icon: LayoutDashboard, exact: true },
      { href: "/admin/users",                label: "Users",             icon: Users },
      { href: "/admin/support",              label: "Support Tickets",   icon: Ticket },
    ],
  },
  {
    label: "Finance",
    items: [
      { href: "/admin/wallet/deposits",      label: "Deposits",          icon: ArrowDownCircle },
      { href: "/admin/wallet/withdrawals",   label: "Withdrawals",       icon: ArrowUpCircle },
      { href: "/admin/wallet/transactions",  label: "Transactions",      icon: Wallet },
    ],
  },
  {
    label: "Trading",
    items: [
      { href: "/admin/assets",               label: "Assets & Markets",  icon: Coins },
      { href: "/admin/trading",              label: "Trading Settings",  icon: BarChart2 },
      { href: "/admin/funding",              label: "Funding Rates",     icon: DollarSign },
      { href: "/admin/funding-system",       label: "Funding System",    icon: HandCoins },
      { href: "/admin/p2p",                  label: "P2P",               icon: ArrowLeftRight },
    ],
  },
  {
    label: "Growth",
    items: [
      { href: "/admin/listing-applications", label: "Listing Apps",      icon: FileText },
      { href: "/admin/referral",             label: "Referral",          icon: HandCoins },
      { href: "/admin/announcements",        label: "Announcements",     icon: Megaphone },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/activity-log",         label: "Activity Log",      icon: Activity },
      { href: "/admin/settings",             label: "Settings",          icon: Settings },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="hidden w-60 shrink-0 border-r border-border bg-card md:flex flex-col overflow-y-auto">
      <nav className="flex flex-col gap-5 p-3 flex-1">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {section.label}
            </p>
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive(item.href, item.exact)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="flex items-center gap-1 border-t border-border p-3">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </aside>
  );
}
