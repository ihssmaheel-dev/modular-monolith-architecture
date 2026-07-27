import { initContract } from "@ts-rest/core";
import {
  CreateUserSchema,
  UpdateUserSchema,
  UserIdParamSchema,
  UserResponseSchema,
  UserListResponseSchema,
} from "../schemas/user.schema";

const c = initContract();

export const usersContract = c.router({
  list: {
    method: "GET",
    path: "/users",
    query: c.query<{ page?: number; limit?: number }>(),
    responses: {
      200: UserListResponseSchema,
    },
  },
  getById: {
    method: "GET",
    path: "/users/:id",
    params: UserIdParamSchema,
    responses: {
      200: UserResponseSchema,
      404: c.type<{ message: string }>(),
    },
  },
  create: {
    method: "POST",
    path: "/users",
    body: CreateUserSchema,
    responses: {
      201: UserResponseSchema,
      409: c.type<{ message: string }>(),
    },
  },
  update: {
    method: "PATCH",
    path: "/users/:id",
    params: UserIdParamSchema,
    body: UpdateUserSchema,
    responses: {
      200: UserResponseSchema,
      404: c.type<{ message: string }>(),
    },
  },
  delete: {
    method: "DELETE",
    path: "/users/:id",
    params: UserIdParamSchema,
    responses: {
      204: c.type<void>(),
      404: c.type<{ message: string }>(),
    },
  },
});
