"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, ChevronDown, Menu, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { UserAvatar } from "@/components/ui/user-avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useLocaleStore } from "@/store/locale-store";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils/cn";

interface NavItem {
  labelKey: string;
  href?: string;
  children?: { href: string; labelKey: string }[];
}

// Every link here points at a route that exists. Groups open on hover and on
// keyboard focus, so tabbing into one walks straight through its links.
const navItems: NavItem[] = [
  { href: "/", labelKey: "nav.home" },
  {
    labelKey: "nav.section_trade",
    children: [
      { href: "/trade/spot/BTCUSDT", labelKey: "nav.spot" },
      { href: "/trade/binary/BTCUSDT", labelKey: "nav.binary" },
      { href: "/trade/demo", labelKey: "nav.demo" },
      { href: "/markets", labelKey: "nav.markets" },
    ],
  },
  { href: "/trade/futures/BTCUSDT", labelKey: "nav.futures" },
  {
    labelKey: "nav.earn",
    children: [
      { href: "/funding", labelKey: "nav.funding" },
      { href: "/referral", labelKey: "nav.referral" },
      { href: "/leaderboard", labelKey: "nav.leaderboard" },
    ],
  },
  {
    labelKey: "nav.web3",
    children: [
      { href: "/wallet", labelKey: "nav.wallet" },
      { href: "/p2p", labelKey: "nav.p2p" },
      { href: "/listing-application", labelKey: "nav.listing" },
    ],
  },
  {
    labelKey: "nav.more",
    children: [
      { href: "/announcements", labelKey: "nav.announcements" },
      { href: "/faq", labelKey: "nav.faq" },
      { href: "/support", labelKey: "nav.support" },
    ],
  },
];

const iconButton =
  "flex h-9 w-9 items-center justify-center rounded-md text-white/80 transition-colors hover:bg-white/10 hover:text-white";

export function PublicNavbar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLocaleStore();
  const isAuthenticated = useAuthStore((state) => state.status === "authenticated");
  const user = useAuthStore((state) => state.user);

  const isActive = (item: NavItem) =>
    item.href === "/"
      ? pathname === "/"
      : [item.href, ...(item.children ?? []).map((c) => c.href)].some(
          (href) => href && pathname.startsWith(href)
        );

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/markets?q=${encodeURIComponent(q)}` : "/markets");
    setOpen(false);
  };

  const searchBox = (
    <form onSubmit={onSearch} role="search" className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("nav.search_placeholder")}
        aria-label={t("nav.search_placeholder")}
        className="h-9 w-full rounded-full border border-white/15 bg-white/5 pl-9 pr-4 text-sm text-white placeholder:text-white/45 focus:border-brand-blue-400 focus:outline-none"
      />
    </form>
  );

  return (
    <header className="night sticky top-0 z-30 border-b border-white/10 bg-[var(--brand-night)] text-white">
      <div className="flex h-16 items-center gap-6 px-4 lg:px-6">
        <Link href="/" className="shrink-0">
          <Logo className="uppercase" size={30} />
        </Link>

        <nav className="hidden h-full items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const active = isActive(item);
            const linkClass = cn(
              "relative flex h-full items-center gap-1 px-3 text-sm font-medium transition-colors hover:text-white",
              active
                ? "text-white after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-brand-blue-400"
                : "text-white/70"
            );

            if (!item.children) {
              return (
                <Link key={item.labelKey} href={item.href!} className={linkClass}>
                  {t(item.labelKey)}
                </Link>
              );
            }

            return (
              <div key={item.labelKey} className="group relative h-full">
                <button type="button" className={linkClass} aria-haspopup="true">
                  {t(item.labelKey)}
                  <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180 group-focus-within:rotate-180" />
                </button>
                <ul className="invisible absolute left-0 top-full min-w-44 rounded-lg border border-white/10 bg-[#0b1322] p-1.5 opacity-0 shadow-xl shadow-black/40 transition-opacity group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  {item.children.map((child) => (
                    <li key={child.href}>
                      <Link
                        href={child.href}
                        className="block rounded-md px-3 py-2 text-sm text-white/75 hover:bg-white/10 hover:text-white"
                      >
                        {t(child.labelKey)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </nav>

        <div className="ml-auto hidden w-full max-w-72 min-[1360px]:block">{searchBox}</div>

        <div className="ml-auto hidden shrink-0 items-center gap-1 lg:flex min-[1360px]:ml-0">
          <LanguageSwitcher />
          <ThemeToggle />
          <Link href="/announcements" aria-label={t("nav.announcements")} className={iconButton}>
            <Bell className="h-5 w-5" />
          </Link>
          {user && (
            <Link href="/profile" aria-label={t("nav.profile")} title={user.fullName} className={iconButton}>
              <UserAvatar user={user} className="h-7 w-7 text-[11px]" />
            </Link>
          )}

          <div className="ml-2 flex items-center gap-2">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button className="h-9 bg-brand-blue-500 px-5 text-white hover:bg-brand-blue-400">
                  {t("nav.dashboard")}
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="h-9 border-brand-blue-400 px-5 text-white hover:bg-white/10"
                  >
                    {t("nav.login")}
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="h-9 bg-brand-blue-500 px-5 text-white hover:bg-brand-blue-400">
                    {t("nav.register")}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
          className="ml-auto text-white lg:hidden"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 px-4 py-4 lg:hidden">
          {searchBox}
          <nav className="mt-4 flex flex-col gap-1">
            {navItems.map((item) =>
              item.children ? (
                <div key={item.labelKey} className="py-1">
                  <p className="px-1 text-xs font-semibold uppercase tracking-wider text-white/40">
                    {t(item.labelKey)}
                  </p>
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setOpen(false)}
                      className="block px-1 py-1.5 text-sm font-medium text-white/70 hover:text-white"
                    >
                      {t(child.labelKey)}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  key={item.labelKey}
                  href={item.href!}
                  onClick={() => setOpen(false)}
                  className="px-1 py-1.5 text-sm font-medium text-white/70 hover:text-white"
                >
                  {t(item.labelKey)}
                </Link>
              )
            )}
          </nav>
          <div className="mt-4 flex flex-col gap-2">
            {isAuthenticated ? (
              <Link href="/dashboard" onClick={() => setOpen(false)}>
                <Button className="w-full bg-brand-blue-500 text-white">{t("nav.dashboard")}</Button>
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)}>
                  <Button variant="outline" className="w-full border-brand-blue-400 text-white hover:bg-white/10">
                    {t("nav.login")}
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setOpen(false)}>
                  <Button className="w-full bg-brand-blue-500 text-white">{t("nav.register")}</Button>
                </Link>
              </>
            )}
            <div className="mt-2 flex justify-center gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
