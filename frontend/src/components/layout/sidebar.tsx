import Link from "next/link";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/trade/futures/BTCUSDT", label: "Futures" },
  { href: "/trade/binary/BTCUSDT", label: "Binary" },
  { href: "/trade/demo", label: "Demo Trade" },
  { href: "/markets", label: "Markets" },
  { href: "/orders", label: "Orders" },
  { href: "/positions", label: "Positions" },
  { href: "/history", label: "History" },
  { href: "/wallet", label: "Wallet" },
  { href: "/referral", label: "Referral" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/p2p", label: "P2P" },
  { href: "/profile", label: "Profile" },
];

export function Sidebar() {
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
