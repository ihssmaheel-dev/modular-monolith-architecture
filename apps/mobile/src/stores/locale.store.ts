import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Locale } from '@repo/i18n'
import { DEFAULT_LOCALE } from '@repo/i18n'
import * as SecureStore from 'expo-secure-store'

const secureStorage = {
  getItem: async (name: string) => SecureStore.getItemAsync(name),
  setItem: async (name: string, value: string) => SecureStore.setItemAsync(name, value),
  removeItem: async (name: string) => SecureStore.deleteItemAsync(name),
}

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
      storage: createJSONStorage(() => secureStorage as unknown as Storage),
    },
  ),
)
