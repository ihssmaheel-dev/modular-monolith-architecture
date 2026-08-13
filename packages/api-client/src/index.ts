import { initClient, tsRestFetchApi, type ApiFetcher } from "@ts-rest/core";
import {
  AuthResponseSchema,
  authContract,
  filesContract,
  notesContract,
  tenancyContract,
  usersContract,
  type AuthResponse,
} from "@repo/shared";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export interface ApiClientOptions {
  getAccessToken?: () => string | null;
  getRefreshToken?: () => string | null;
  getLocale?: () => string | null;
  getTenantId?: () => string | null;
  onAuthRefreshed?: (response: AuthResponse) => void;
  onAuthFailure?: () => void;
}

function getAuthorizationHeader(options: ApiClientOptions): string {
  const token = options.getAccessToken?.();
  return token ? `Bearer ${token}` : "";
}

function getTransferHeaders(options: ApiClientOptions): Record<string, string> {
  const headers: Record<string, string> = {
    "accept-language": options.getLocale?.() ?? "en",
    "idempotency-key": createIdempotencyKey(),
  };
  const authorization = getAuthorizationHeader(options);
  const tenantId = options.getTenantId?.();
  if (authorization) headers.authorization = authorization;
  if (tenantId) headers["x-tenant-id"] = tenantId;
  return headers;
}

async function requestRefresh(
  baseUrl: string,
  options: ApiClientOptions,
): Promise<AuthResponse | null> {
  const response = await fetch(`${baseUrl}/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: {
      "content-type": "application/json",
      "accept-language": options.getLocale?.() ?? "en",
    },
    body: JSON.stringify({ refreshToken: options.getRefreshToken?.() ?? undefined }),
  });
  if (!response.ok) return null;
  const parsed = AuthResponseSchema.safeParse(await response.json());
  return parsed.success ? parsed.data : null;
}

function createRefreshingFetcher(baseUrl: string, options: ApiClientOptions): ApiFetcher {
  let refreshPromise: Promise<AuthResponse | null> | null = null;
  return async (args) => {
    const requestArgs = addIdempotencyKey(args);
    const response = await tsRestFetchApi(requestArgs);
    if (response.status !== 401 || args.route.path.startsWith("/auth/")) return response;

    refreshPromise ??= requestRefresh(baseUrl, options).finally(() => {
      refreshPromise = null;
    });
    const refreshed = await refreshPromise;
    if (!refreshed) {
      options.onAuthFailure?.();
      return response;
    }

    options.onAuthRefreshed?.(refreshed);
    return tsRestFetchApi({
      ...requestArgs,
      headers: { ...requestArgs.headers, authorization: `Bearer ${refreshed.accessToken}` },
    });
  };
}

function addIdempotencyKey(args: Parameters<ApiFetcher>[0]): Parameters<ApiFetcher>[0] {
  if (!MUTATING_METHODS.has(args.route.method)) return args;
  if (args.headers["idempotency-key"]) return args;
  return {
    ...args,
    headers: { ...args.headers, "idempotency-key": createIdempotencyKey() },
  };
}

function createIdempotencyKey(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") return globalThis.crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function createApiClient(baseUrl: string, options: ApiClientOptions = {}) {
  const clientOptions = {
    baseUrl,
    credentials: "include" as const,
    baseHeaders: {
      authorization: () => getAuthorizationHeader(options),
      "accept-language": () => options.getLocale?.() ?? "en",
      "x-tenant-id": () => options.getTenantId?.() ?? "",
    },
    api: createRefreshingFetcher(baseUrl, options),
    throwOnUnknownStatus: true as const,
  };

  return {
    auth: initClient(authContract, clientOptions),
    files: initClient(filesContract, clientOptions),
    notes: initClient(notesContract, clientOptions),
    tenancy: initClient(tenancyContract, clientOptions),
    users: initClient(usersContract, clientOptions),
    getTransferHeaders: () => getTransferHeaders(options),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
