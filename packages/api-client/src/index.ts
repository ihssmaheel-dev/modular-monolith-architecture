// @ts-ignore ts-rest v3 + Zod v4 type inference broken
import { initClient } from "@ts-rest/core";
import { usersContract, notesContract, filesContract } from "@repo/shared";

export function createApiClient(baseUrl: string, getToken?: () => string | null): any {
  const baseHeaders = {
    get Authorization() {
      const token = getToken?.();
      return token ? `Bearer ${token}` : "";
    },
  };

  return {
    users: initClient(usersContract, { baseUrl, baseHeaders }),
    notes: initClient(notesContract, { baseUrl, baseHeaders }),
    files: initClient(filesContract, { baseUrl, baseHeaders }),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
