"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
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
    <header className="night sticky top-0 z-30 border-b border-white/10 bg-[var(--brand-night)] text-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-white/55 transition-colors hover:text-white"
            >
              {t(link.labelKey)}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher />
          <ThemeToggle />
          <Link href="/login">
            <Button
              variant="outline"
              className="h-9 rounded-full border-white/25 text-white hover:bg-white/10"
            >
              {t("nav.login")}
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="gradient" className="h-9 rounded-full px-5">
              {t("nav.register")}
            </Button>
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
          className="text-white md:hidden"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3 border-t border-white/10 pt-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-white/55 hover:text-white"
              >
                {t(link.labelKey)}
              </a>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2">
            <Link href="/login" onClick={() => setOpen(false)}>
              <Button
                variant="outline"
                className="w-full rounded-full border-white/25 text-white hover:bg-white/10"
              >
                {t("nav.login")}
              </Button>
            </Link>
            <Link href="/register" onClick={() => setOpen(false)}>
              <Button variant="gradient" className="w-full rounded-full">
                {t("nav.register")}
              </Button>
            </Link>
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
