import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { locales, DEFAULT_LOCALE, type Locale } from "@repo/shared";

const STORAGE_KEY = "app-locale";

function getStoredLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored in locales) return stored as Locale;
  } catch {
    // ignore storage errors
  }
  return DEFAULT_LOCALE;
}

function getBrowserLocale(): Locale {
  const browserLang = navigator?.language?.split("-")[0];
  if (browserLang && browserLang in locales) return browserLang as Locale;
  return DEFAULT_LOCALE;
}

function getInitialLocale(): Locale {
  const stored = getStoredLocale();
  if (stored !== DEFAULT_LOCALE) return stored;
  return getBrowserLocale();
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: locales.en },
    es: { translation: locales.es },
    fr: { translation: locales.fr },
  },
  lng: getInitialLocale(),
  fallbackLng: DEFAULT_LOCALE,
  interpolation: {
    escapeValue: false,
  },
});

export function setLocale(locale: Locale): void {
  i18n.changeLanguage(locale);
  localStorage.setItem(STORAGE_KEY, locale);
}

export function getLocale(): Locale {
  return (i18n.language as Locale) ?? DEFAULT_LOCALE;
}

export default i18n;
