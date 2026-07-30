import { initContract } from "@ts-rest/core";
import {
  CreateUserSchema,
  UpdateUserSchema,
  UserResponseSchema,
  UserListResponseSchema,
} from "../schemas/user.schema";

const c = initContract();

// ts-rest v3 uses its own schema inference which is incompatible with Zod v4.
// The contract is typed as `any` to bypass broken inference; runtime validation
// still uses the Zod schemas defined below.
export const usersContract = c.router({
  list: {
    method: "GET" as const,
    path: "/users",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query: { page: undefined, limit: undefined } as any,
    responses: {
      200: UserListResponseSchema as any,
    },
  },
  getById: {
    method: "GET" as const,
    path: "/users/:id",
    responses: {
      200: UserResponseSchema as any,
      404: { message: "" } as any,
    },
  },
  create: {
    method: "POST" as const,
    path: "/users",
    body: CreateUserSchema as any,
    responses: {
      201: UserResponseSchema as any,
      409: { message: "" } as any,
    },
  },
  update: {
    method: "PATCH" as const,
    path: "/users/:id",
    body: UpdateUserSchema as any,
    responses: {
      200: UserResponseSchema as any,
      404: { message: "" } as any,
    },
  },
  delete: {
    method: "DELETE" as const,
    path: "/users/:id",
    responses: {
      204: undefined as any,
      404: { message: "" } as any,
    },
  },
});
