"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Menu, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useLocaleStore } from "@/store/locale-store";

export function PublicNavbar() {
  const [open, setOpen] = useState(false);
  const { t } = useLocaleStore();

  const navLinks = [
    { href: "#markets", labelKey: "nav.markets_link" },
    { href: "#features", labelKey: "nav.features" },
    { href: "#how-it-works", labelKey: "nav.how_it_works" },
    { href: "/faq", labelKey: "nav.faq" },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {t(link.labelKey)}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <LanguageSwitcher />
          <ThemeToggle />
          <Link href="/login">
            <Button variant="gradient" className="rounded-full px-6">
              {t("nav.login")}
            </Button>
          </Link>
          <button
            type="button"
            aria-label="Notifications"
            className="relative text-muted-foreground transition-colors hover:text-foreground"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
              1
            </span>
          </button>
          <Link href="/register" aria-label="Account" className="text-muted-foreground transition-colors hover:text-foreground">
            <User className="h-5 w-5" />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
          className="text-foreground md:hidden"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3 border-t border-border pt-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                {t(link.labelKey)}
              </a>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2">
            <Link href="/login" onClick={() => setOpen(false)}>
              <Button variant="gradient" className="w-full rounded-full">
                {t("nav.login")}
              </Button>
            </Link>
            <Link href="/register" onClick={() => setOpen(false)}>
              <Button variant="secondary" className="w-full">
                {t("nav.register")}
              </Button>
            </Link>
            <div className="flex justify-center gap-2 mt-2">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
