import { createApiClient, type ApiClient } from "@repo/api-client";
import { useAuthStore } from "@/stores/auth.store";
import { useTenantStore } from "@/stores/tenant.store";
import { getLocale } from "./i18n";
import { queryClient } from "./query-client";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "/api";

export const api: ApiClient = createApiClient(API_BASE_URL, {
  getLocale,
  getTenantId: () => useTenantStore.getState().activeTenantId,
  onAuthRefreshed: ({ user }) => useAuthStore.getState().login({ user }),
  onAuthFailure: () => {
    useTenantStore.getState().clearTenant();
    queryClient.clear();
    useAuthStore.getState().logout();
  },
});

export { API_BASE_URL };
