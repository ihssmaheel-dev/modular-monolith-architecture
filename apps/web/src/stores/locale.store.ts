import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Locale } from '@repo/i18n'
import { DEFAULT_LOCALE } from '@repo/i18n'

interface LocaleState {
  locale: Locale
  setLocale: (locale: Locale) => void
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: DEFAULT_LOCALE as Locale,
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: 'locale-storage',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : undefined as unknown as Storage)),
    },
  ),
)
