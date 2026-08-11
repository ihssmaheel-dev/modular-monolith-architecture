import { createApiClient, type ApiClient } from "@repo/api-client";
import { useAuthStore } from "@/stores/auth.store";
import { getLocale } from "./i18n";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "/api";

export const api: ApiClient = createApiClient(API_BASE_URL, {
  getLocale,
  onAuthRefreshed: ({ user }) => useAuthStore.getState().login({ user }),
  onAuthFailure: () => useAuthStore.getState().logout(),
});

export { API_BASE_URL };
