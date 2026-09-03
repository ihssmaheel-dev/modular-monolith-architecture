import { formatDistanceToNow } from "date-fns";
import { enUS, es, fr, type Locale } from "date-fns/locale";
import { useLocaleStore } from "@/stores/locale.store";

const dateFnsLocales: Record<string, Locale> = { en: enUS, es, fr };

export function formatDate(value: string | Date, locale?: string): string {
  const lng = locale ?? useLocaleStore.getState().locale;
  return new Date(value).toLocaleDateString(lng);
}

export function formatDateTime(value: string | Date, locale?: string): string {
  const lng = locale ?? useLocaleStore.getState().locale;
  return new Date(value).toLocaleString(lng);
}

export function formatNumber(value: number, locale?: string): string {
  const lng = locale ?? useLocaleStore.getState().locale;
  return new Intl.NumberFormat(lng).format(value);
}

export function formatRelativeTime(value: string | Date, locale?: string): string {
  const lng = locale ?? useLocaleStore.getState().locale;
  return formatDistanceToNow(new Date(value), {
    addSuffix: true,
    locale: dateFnsLocales[lng] ?? enUS,
  });
}
