"use client";

import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { UserMenu } from "@/components/layout/user-menu";
import { MobileNavButton } from "@/components/layout/mobile-drawer";
import { useLocaleStore } from "@/store/locale-store";

export function Topbar() {
  const { t } = useLocaleStore();

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-2 border-b border-border bg-card px-3 sm:gap-4 sm:px-4">
      <div className="flex min-w-0 items-center gap-1">
        <MobileNavButton />
        <Logo size={24} />
      </div>
      <div className="hidden items-center gap-2 text-sm lg:flex">
        <span className="flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-3 py-1">
          <span className="text-muted-foreground">{t("common.demo_balance")}</span>
          <span className="font-mono font-semibold tabular-nums">$10,000.00</span>
        </span>
        <span className="flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-3 py-1">
          <span className="text-muted-foreground">{t("common.live_balance")}</span>
          <span className="font-mono font-semibold tabular-nums">$0.00</span>
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {/* Below lg the full chips don't fit, so only the demo figure stays. */}
        <span className="mr-1 hidden rounded-full border border-border bg-secondary/60 px-2.5 py-1 font-mono text-xs font-semibold tabular-nums sm:inline-flex lg:hidden">
          $10,000.00
        </span>
        <div className="hidden items-center gap-1 sm:flex">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
        <UserMenu />
      </div>
    </header>
  );
}
