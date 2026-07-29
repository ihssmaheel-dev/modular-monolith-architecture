import { createApiClient } from "@repo/api-client";
import { useAuthStore } from "@/stores/auth.store";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export const api = createApiClient(
  API_BASE_URL,
  () => useAuthStore.getState().getToken(),
);

export { API_BASE_URL };
