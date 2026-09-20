import { create } from "zustand";
import { persist } from "zustand/middleware";
import en from "@/messages/en.json";
import bn from "@/messages/bn.json";

type Locale = "en" | "bn";

const messages: Record<Locale, Record<string, string>> = { en, bn };

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set, get) => ({
      locale: "en",
      setLocale: (locale) => set({ locale }),
      t: (key: string) => {
        const { locale } = get();
        return messages[locale][key] ?? key;
      },
    }),
    {
      name: "void2empire-locale",
    }
  )
);
