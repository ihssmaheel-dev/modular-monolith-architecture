import type { CreateUserInput, PaginationQuery, UpdateUserInput, UserListResponse, UserResponse } from "@repo/contracts";
import type { FetchFn } from "../types";

export function createUsersClient(fetchFn: FetchFn) {
  return {
    list: (req: { query?: PaginationQuery } = {}) => {
      const sp = new URLSearchParams();
      if (req.query?.page) sp.set("page", String(req.query.page));
      if (req.query?.limit) sp.set("limit", String(req.query.limit));
      const qs = sp.toString();
      return fetchFn<UserListResponse>(`/users${qs ? `?${qs}` : ""}`);
    },
    getById: (req: { params: { id: string } }) =>
      fetchFn<UserResponse>(`/users/${encodeURIComponent(req.params.id)}`),
    create: (req: { body: CreateUserInput }) =>
      fetchFn<UserResponse>("/users", { method: "POST", body: JSON.stringify(req.body) }),
    update: (req: { params: { id: string }; body: UpdateUserInput }) =>
      fetchFn<UserResponse>(`/users/${encodeURIComponent(req.params.id)}`, {
        method: "PATCH",
        body: JSON.stringify(req.body),
      }),
    delete: (req: { params: { id: string } }) =>
      fetchFn<void>(`/users/${encodeURIComponent(req.params.id)}`, { method: "DELETE" }),
  };
}
