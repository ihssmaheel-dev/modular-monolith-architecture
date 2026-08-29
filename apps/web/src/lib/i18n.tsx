import * as React from 'react'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { locales } from '@repo/i18n'

export const resources = {
  en: { translation: locales.en },
  es: { translation: locales.es },
  fr: { translation: locales.fr },
} as const

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: 'en',
      supportedLngs: ['en', 'es', 'fr'],
      interpolation: { escapeValue: false },
      detection: {
        order: ['localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage'],
      },
    })
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export { i18n }
export default i18n
