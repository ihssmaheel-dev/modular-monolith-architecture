import { createApiClient } from "@repo/api-client";
import { useAuthStore } from "../stores/auth.store";

export const API_BASE_URL = "http://localhost:3000";

export const api = createApiClient(
  API_BASE_URL,
  () => useAuthStore.getState().getToken(),
);
