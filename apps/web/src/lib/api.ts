import { createApiClient } from "@repo/api-client";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

export const api = createApiClient(API_BASE_URL);
