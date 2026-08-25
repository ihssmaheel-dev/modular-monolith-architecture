import en from "./locales/en.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";

export const locales = { en, es, fr } as const;
export type Locale = keyof typeof locales;
export const DEFAULT_LOCALE: Locale = "en";
export const SUPPORTED_LOCALES: Locale[] = Object.keys(locales) as Locale[];

export type TranslationKeys = typeof en;
