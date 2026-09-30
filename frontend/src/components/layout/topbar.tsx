"use client";

import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useLocaleStore } from "@/store/locale-store";

export function Topbar() {
  const { t } = useLocaleStore();

  return (
    <header className="flex h-14 items-center justify-between gap-4 border-b border-border bg-card px-4">
      <Logo size={24} />
      <div className="flex items-center gap-2 text-sm">
        <span className="flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-3 py-1">
          <span className="text-muted-foreground">{t("common.demo_balance")}</span>
          <span className="font-mono font-semibold tabular-nums">$10,000.00</span>
        </span>
        <span className="flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-3 py-1">
          <span className="text-muted-foreground">{t("common.live_balance")}</span>
          <span className="font-mono font-semibold tabular-nums">$0.00</span>
        </span>
      </div>
      <div className="flex items-center gap-1">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </header>
  );
}
