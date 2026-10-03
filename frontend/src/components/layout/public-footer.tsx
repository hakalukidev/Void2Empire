"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { useLocaleStore } from "@/store/locale-store";

const columns = [
  {
    titleKey: "footer.product",
    links: [
      { href: "/trade/spot/BTCUSDT", labelKey: "footer.spot" },
      { href: "/trade/futures/BTCUSDT", labelKey: "footer.futures" },
      { href: "/trade/binary/BTCUSDT", labelKey: "footer.binary" },
      { href: "/trade/demo", labelKey: "footer.demo" },
      { href: "/markets", labelKey: "footer.markets" },
    ],
  },
  {
    titleKey: "footer.support",
    links: [
      { href: "/faq", labelKey: "footer.faq" },
      { href: "/announcements", labelKey: "footer.announcements" },
      { href: "/support", labelKey: "footer.contact_support" },
    ],
  },
  {
    titleKey: "footer.legal",
    links: [
      { href: "/terms", labelKey: "footer.terms" },
      { href: "/privacy", labelKey: "footer.privacy" },
      { href: "/risk-disclosure", labelKey: "footer.risk_disclosure" },
    ],
  },
];

export function PublicFooter() {
  const { t } = useLocaleStore();

  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Logo tagline="Trade · Grow · Rule" />
            <p className="mt-2 text-sm text-muted-foreground">{t("footer.blurb")}</p>
          </div>
          {columns.map((col) => (
            <div key={col.titleKey}>
              <h3 className="text-sm font-semibold">{t(col.titleKey)}</h3>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      {t(link.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Void2Empire. {t("footer.risk_note")}
          </p>
        </div>
      </div>
    </footer>
  );
}
