"use client";

import { useLocaleStore } from "@/store/locale-store";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLocaleStore();

  return (
    <button
      type="button"
      onClick={() => setLocale(locale === "en" ? "bn" : "en")}
      className="flex h-8 items-center gap-1 rounded-md px-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      aria-label={t("common.switch_language")}
    >
      <span className={locale === "en" ? "text-foreground" : ""}>EN</span>
      <span className="opacity-30">|</span>
      <span className={locale === "bn" ? "text-foreground" : ""}>বাংলা</span>
    </button>
  );
}
