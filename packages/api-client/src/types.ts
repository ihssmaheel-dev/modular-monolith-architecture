import type { ApiErrorEnvelope, AuthResponse } from "@repo/contracts";

export interface ApiClientOptions {
  getAccessToken?: () => string | null;
  getRefreshToken?: () => string | null;
  getLocale?: () => string | null;
  getTenantId?: () => string | null;
  onAuthRefreshed?: (response: AuthResponse) => void;
  onAuthFailure?: () => void;
}

export interface ApiResponse<T> {
  status: number;
  body: T;
  error?: ApiErrorEnvelope;
}

export type FetchFn = <T>(path: string, init?: RequestInit) => Promise<ApiResponse<T>>;
