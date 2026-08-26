import { Injectable } from "@nestjs/common";
import { locales, DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale } from "@repo/i18n";

type NestedMessages = Record<string, unknown>;

const INTERPOLATION_PATTERN = /\{\{\s*(\w+)\s*\}\}/g;

@Injectable()
export class I18nService {
  getLocale(acceptLanguage?: string): Locale {
    if (!acceptLanguage) return DEFAULT_LOCALE;

    const preferred = acceptLanguage
      .split(",")
      .map((lang) => lang.split(";")[0]?.trim().substring(0, 2).toLowerCase() ?? "")
      .find((lang) => SUPPORTED_LOCALES.includes(lang as Locale));

    return (preferred as Locale) ?? DEFAULT_LOCALE;
  }

  translate(key: string, locale: Locale = DEFAULT_LOCALE): string {
    const messages = locales[locale] ?? locales[DEFAULT_LOCALE];
    return (
      this.resolveNestedKey(messages, key) ??
      this.resolveNestedKey(locales[DEFAULT_LOCALE], key) ??
      key
    );
  }

  t(key: string, acceptLanguage?: string, params?: Record<string, string | number>): string {
    const locale = this.getLocale(acceptLanguage);
    let message = this.translate(key, locale);

    if (params) {
      message = this.interpolate(message, params);
    }

    return message;
  }

  getSupportedLocales(): readonly string[] {
    return SUPPORTED_LOCALES;
  }

  private interpolate(template: string, params: Record<string, string | number>): string {
    return template.replace(INTERPOLATION_PATTERN, (_, key) => {
      const value = params[key];
      return value !== undefined ? String(value) : `{{${key}}}`;
    });
  }

  private resolveNestedKey(obj: NestedMessages, key: string): string | undefined {
    const keys = key.split(".");
    let current: Record<string, unknown> | unknown = obj;

    for (const k of keys) {
      if (typeof current !== "object" || current === null) {
        return undefined;
      }
      current = (current as Record<string, unknown>)[k];
      if (current === undefined) return undefined;
    }

    return typeof current === "string" ? current : undefined;
  }
}
