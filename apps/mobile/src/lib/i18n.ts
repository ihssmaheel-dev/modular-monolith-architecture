import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { locales } from '@repo/i18n'
import { useLocaleStore } from '@/stores/locale.store'

export const resources = {
  en: { translation: locales.en },
  es: { translation: locales.es },
  fr: { translation: locales.fr },
} as const

export async function initI18n() {
  const locale = useLocaleStore.getState().locale
  if (i18n.isInitialized) return i18n
  await i18n.use(initReactI18next).init({
    resources,
    lng: locale,
    fallbackLng: 'en',
    supportedLngs: ['en', 'es', 'fr'],
    interpolation: { escapeValue: false },
  })
  return i18n
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  return children as React.ReactElement
}

export { i18n }
export default i18n
