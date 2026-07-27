import { createApiClient } from "@repo/api-client";
import Constants from "expo-constants";

const API_BASE_URL =
  Constants.expoConfig?.extra?.API_BASE_URL ?? "http://localhost:3000";

export const api = createApiClient(API_BASE_URL);
