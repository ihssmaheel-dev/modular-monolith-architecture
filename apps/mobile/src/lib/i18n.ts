import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import { locales, DEFAULT_LOCALE, type Locale } from "@repo/i18n";

export const resources = {
  en: { translation: locales.en },
  es: { translation: locales.es },
  fr: { translation: locales.fr },
} as const;

const SUPPORTED: Locale[] = ["en", "es", "fr"];

export function deviceLocale(): Locale {
  const tag = Localization.getLocales()[0]?.languageCode ?? DEFAULT_LOCALE;
  return (SUPPORTED as string[]).includes(tag) ? (tag as Locale) : DEFAULT_LOCALE;
}

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources,
    lng: deviceLocale(),
    fallbackLng: DEFAULT_LOCALE,
    interpolation: { escapeValue: false },
  });
}

export function applyLocale(locale: Locale) {
  void i18n.changeLanguage(locale);
}

export { i18n };
export default i18n;
