// @ts-ignore ts-rest v3 + Zod v4 type inference broken
import { initClient } from "@ts-rest/core";
import { usersContract, notesContract, filesContract } from "@repo/shared";

export function createApiClient(baseUrl: string): any {
  return {
    users: initClient(usersContract, { baseUrl }),
    notes: initClient(notesContract, { baseUrl }),
    files: initClient(filesContract, { baseUrl }),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
