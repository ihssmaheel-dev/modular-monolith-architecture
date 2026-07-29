import { initClient } from "@ts-rest/core";
import { usersContract } from "@repo/shared";

export function createApiClient(baseUrl: string, getToken?: () => string | null) {
  return {
    users: initClient(usersContract, {
      baseUrl,
      baseHeaders: {
        get Authorization() {
          const token = getToken?.();
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
      },
    }),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
