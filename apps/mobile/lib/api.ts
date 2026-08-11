import { createApiClient } from "@repo/api-client";
import { useAuthStore } from "../stores/auth.store";
import { useTenantStore } from "../stores/tenant.store";
import { getLocale } from "./i18n";
import { queryClient } from "./query-client";

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000/api";

export const api = createApiClient(API_BASE_URL, {
  getAccessToken: () => useAuthStore.getState().getToken(),
  getRefreshToken: () => useAuthStore.getState().refreshToken,
  getLocale,
  getTenantId: () => useTenantStore.getState().activeTenantId,
  onAuthRefreshed: (response) => useAuthStore.getState().login(response),
  onAuthFailure: () => {
    useTenantStore.getState().clearTenant();
    queryClient.clear();
    useAuthStore.getState().logout();
  },
});
