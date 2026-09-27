import Link from "next/link";
import { Logo } from "@/components/ui/logo";

const columns = [
  {
    title: "Product",
    links: [
      { href: "/trade/futures/BTCUSDT", label: "Futures trading" },
      { href: "/trade/binary/BTCUSDT", label: "Binary options" },
      { href: "/trade/demo", label: "Demo account" },
      { href: "/markets", label: "Markets" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/faq", label: "FAQ" },
      { href: "/announcements", label: "Announcements" },
      { href: "/support", label: "Contact support" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/terms", label: "Terms & Conditions" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/risk-disclosure", label: "Risk Disclosure" },
    ],
  },
];

export function PublicFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Logo />
            <p className="mt-2 text-sm text-muted-foreground">
              Futures and binary options trading, with a risk-free demo account.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold">{col.title}</h3>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Void2Empire. Trading futures and binary options
            carries a high level of risk and may not be suitable for all investors. Only trade
            with funds you can afford to lose.
          </p>
        </div>
      </div>
    </footer>
  );
}
