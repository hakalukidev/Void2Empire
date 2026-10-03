"use client";

import { useEffect } from "react";
import { useLocaleStore } from "@/store/locale-store";

// The document language has to follow the chosen locale: Bengali text served under
// lang="en" is wrong for screen readers and for text shaping.
export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const locale = useLocaleStore((s) => s.locale);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return <>{children}</>;
}
