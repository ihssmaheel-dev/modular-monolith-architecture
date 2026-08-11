import { createApiClient } from "@repo/api-client";
import { useAuthStore } from "../stores/auth.store";
import { getLocale } from "./i18n";

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000/api";

export const api = createApiClient(API_BASE_URL, {
  getAccessToken: () => useAuthStore.getState().getToken(),
  getRefreshToken: () => useAuthStore.getState().refreshToken,
  getLocale,
  onAuthRefreshed: (response) => useAuthStore.getState().login(response),
  onAuthFailure: () => useAuthStore.getState().logout(),
});
