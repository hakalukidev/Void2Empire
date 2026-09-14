import Link from "next/link";

const navItems = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/assets", label: "Assets" },
  { href: "/admin/trading", label: "Trading Settings" },
  { href: "/admin/wallet/deposits", label: "Deposits" },
  { href: "/admin/wallet/withdrawals", label: "Withdrawals" },
  { href: "/admin/p2p", label: "P2P" },
  { href: "/admin/announcements", label: "Announcements" },
  { href: "/admin/settings", label: "Platform Settings" },
  { href: "/admin/activity-log", label: "Activity Log" },
];

export function AdminSidebar() {
  return (
    <aside className="hidden w-56 shrink-0 border-r border-border bg-card md:block">
      <nav className="flex flex-col gap-1 p-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
