"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useLocaleStore } from "@/store/locale-store";

export function AdminSidebar() {
  const { t } = useLocaleStore();

  const navItems = [
    { href: "/admin", label: "Overview" },
    { href: "/admin/users", labelKey: "admin.users" },
    { href: "/admin/assets", label: "Assets" },
    { href: "/admin/trading", label: "Trading Settings" },
    { href: "/admin/wallet/deposits", label: "Deposits" },
    { href: "/admin/wallet/withdrawals", label: "Withdrawals" },
    { href: "/admin/p2p", label: "P2P" },
    { href: "/admin/announcements", label: "Announcements" },
    { href: "/admin/settings", labelKey: "admin.settings" },
    { href: "/admin/activity-log", label: "Activity Log" },
  ];

  return (
    <aside className="hidden w-56 shrink-0 border-r border-border bg-card md:flex flex-col">
      <nav className="flex flex-col gap-1 p-4 flex-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            {item.labelKey ? t(item.labelKey) : item.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-1 border-t border-border p-4">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </aside>
  );
}
