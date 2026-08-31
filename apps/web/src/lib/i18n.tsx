import * as React from "react";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { locales } from "@repo/i18n";

export const resources = {
  en: { translation: locales.en },
  es: { translation: locales.es },
  fr: { translation: locales.fr },
} as const;

function getInitialLanguage(): string {
  if (typeof window === "undefined") return "en";
  try {
    const zustandStored = localStorage.getItem("locale-storage");
    if (zustandStored) {
      const parsed = JSON.parse(zustandStored);
      if (parsed?.state?.locale && ["en", "es", "fr"].includes(parsed.state.locale)) {
        return parsed.state.locale;
      }
    }
    const directStored = localStorage.getItem("i18nextLng");
    if (directStored && ["en", "es", "fr"].includes(directStored)) {
      return directStored;
    }
    const navLang = navigator.language?.split("-")[0];
    if (navLang && ["en", "es", "fr"].includes(navLang)) {
      return navLang;
    }
  } catch {
    // ignore
  }
  return "en";
}

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: "en",
    supportedLngs: ["en", "es", "fr"],
    interpolation: { escapeValue: false },
    react: {
      useSuspense: false,
    },
  });
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    const syncDocLang = (lng: string) => {
      document.documentElement.lang = lng;
      try {
        localStorage.setItem("i18nextLng", lng);
      } catch {
        // ignore
      }
    };
    syncDocLang(i18n.language || "en");
    i18n.on("languageChanged", syncDocLang);
    return () => {
      i18n.off("languageChanged", syncDocLang);
    };
  }, []);

  return <>{children}</>;
}

export { i18n };
export default i18n;
