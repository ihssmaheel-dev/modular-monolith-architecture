import { initContract, type AppRouter } from "@ts-rest/core";
import {
  CreateUserSchema,
  UpdateUserSchema,
  UserResponseSchema,
  UserListResponseSchema,
  UserIdParamSchema,
} from "../schemas/user.schema";
import { MessageResponseSchema } from "../schemas/auth.schema";
import { PaginationQuerySchema } from "../schemas/pagination.schema";
import { contractSchema } from "./contract-schema";

const c = initContract();

export const usersContract = {
  list: {
    method: "GET" as const,
    path: "/users",
    query: contractSchema(PaginationQuerySchema),
    responses: {
      200: contractSchema(UserListResponseSchema),
    },
  },
  getById: {
    method: "GET" as const,
    path: "/users/:id",
    pathParams: contractSchema(UserIdParamSchema),
    responses: {
      200: contractSchema(UserResponseSchema),
      404: contractSchema(MessageResponseSchema),
    },
  },
  create: {
    method: "POST" as const,
    path: "/users",
    body: contractSchema(CreateUserSchema),
    responses: {
      201: contractSchema(UserResponseSchema),
      409: contractSchema(MessageResponseSchema),
    },
  },
  update: {
    method: "PATCH" as const,
    path: "/users/:id",
    pathParams: contractSchema(UserIdParamSchema),
    body: contractSchema(UpdateUserSchema),
    responses: {
      200: contractSchema(UserResponseSchema),
      404: contractSchema(MessageResponseSchema),
    },
  },
  delete: {
    method: "DELETE" as const,
    path: "/users/:id",
    pathParams: contractSchema(UserIdParamSchema),
    responses: {
      204: c.noBody(),
      404: contractSchema(MessageResponseSchema),
    },
  },
} as const satisfies AppRouter;
