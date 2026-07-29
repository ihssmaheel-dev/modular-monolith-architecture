import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { locales, DEFAULT_LOCALE, type Locale } from "@repo/shared";

const STORAGE_KEY = "app-locale";

async function getStoredLocale(): Promise<Locale> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored && stored in locales) return stored as Locale;
  } catch {}
  return DEFAULT_LOCALE;
}

export async function initI18n(): Promise<void> {
  const storedLocale = await getStoredLocale();

  i18n.use(initReactI18next).init({
    resources: {
      en: { translation: locales.en },
      es: { translation: locales.es },
      fr: { translation: locales.fr },
    },
    lng: storedLocale,
    fallbackLng: DEFAULT_LOCALE,
    interpolation: {
      escapeValue: false,
    },
  });
}

export async function setLocale(locale: Locale): Promise<void> {
  await i18n.changeLanguage(locale);
  await AsyncStorage.setItem(STORAGE_KEY, locale);
}

export function getLocale(): Locale {
  return (i18n.language as Locale) ?? DEFAULT_LOCALE;
}

export default i18n;
