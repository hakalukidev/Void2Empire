"use client";

import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useLocaleStore } from "@/store/locale-store";

export function Topbar() {
  const { t } = useLocaleStore();

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
      <Logo size={24} />
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>{t("common.demo_balance")}: $10,000.00</span>
        <span>{t("common.live_balance")}: $0.00</span>
      </div>
      <div className="flex items-center gap-1">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </header>
  );
}
