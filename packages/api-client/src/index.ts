import { initClient, tsRestFetchApi, type ApiFetcher } from "@ts-rest/core";
import {
  AuthResponseSchema,
  authContract,
  filesContract,
  notesContract,
  usersContract,
  type AuthResponse,
} from "@repo/shared";

export interface ApiClientOptions {
  getAccessToken?: () => string | null;
  getRefreshToken?: () => string | null;
  getLocale?: () => string | null;
  onAuthRefreshed?: (response: AuthResponse) => void;
  onAuthFailure?: () => void;
}

function getAuthorizationHeader(options: ApiClientOptions): string {
  const token = options.getAccessToken?.();
  return token ? `Bearer ${token}` : "";
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
    const response = await tsRestFetchApi(args);
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
      ...args,
      headers: { ...args.headers, authorization: `Bearer ${refreshed.accessToken}` },
    });
  };
}

export function createApiClient(baseUrl: string, options: ApiClientOptions = {}) {
  const clientOptions = {
    baseUrl,
    credentials: "include" as const,
    baseHeaders: {
      authorization: () => getAuthorizationHeader(options),
      "accept-language": () => options.getLocale?.() ?? "en",
    },
    api: createRefreshingFetcher(baseUrl, options),
    throwOnUnknownStatus: true as const,
  };

  return {
    auth: initClient(authContract, clientOptions),
    files: initClient(filesContract, clientOptions),
    notes: initClient(notesContract, clientOptions),
    users: initClient(usersContract, clientOptions),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
