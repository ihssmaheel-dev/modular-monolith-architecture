import { initClient } from "@ts-rest/core";
import { usersContract } from "@repo/shared";

export function createApiClient(baseUrl: string) {
  return {
    users: initClient(usersContract, {
      baseUrl,
      baseHeaders: {},
    }),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
