"use client";

import { useTheme } from "next-themes";
import { useLocaleStore } from "@/store/locale-store";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t } = useLocaleStore();

  return (
    <button
      type="button"
      aria-label={t("common.toggle_theme")}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
      <span className="sr-only">{t("common.toggle_theme")}</span>
    </button>
  );
}
