import { createApiClient } from "@repo/api-client";
import { useAuthStore } from "../stores/auth.store";

export const api = createApiClient(
  "http://localhost:3000",
  () => useAuthStore.getState().getToken(),
);
