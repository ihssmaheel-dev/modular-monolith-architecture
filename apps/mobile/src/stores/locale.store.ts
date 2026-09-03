import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { DEFAULT_LOCALE, type Locale } from "@repo/i18n";
import { secureStorage } from "@/lib/secure-storage";

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: DEFAULT_LOCALE as Locale,
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: "locale-storage",
      storage: createJSONStorage(() => secureStorage),
    },
  ),
);
