import { createApiClient, type ApiClient } from "@repo/api-client";
import { useAuthStore } from "@/stores/auth.store";

const API_BASE_URL = (import.meta as any).env.VITE_API_URL ?? "http://localhost:3000";

export const api: ApiClient = createApiClient(
  API_BASE_URL,
  () => useAuthStore.getState().getAccessToken(),
);

export { API_BASE_URL };
