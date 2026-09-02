import type {
  CreateUserInput,
  PaginationQuery,
  UpdateUserInput,
  UserListResponse,
  UserResponse,
} from "@repo/contracts";
import type { FetchFn } from "../types";
import { orpcResponse, type OrpcClient } from "../orpc";

export function createUsersClient(fetchFn: FetchFn, orpc?: OrpcClient) {
  return {
    list: (req: { query?: PaginationQuery } = {}) => {
      if (orpc) {
        return orpcResponse(
          () => orpc.users.list({ page: req.query?.page, limit: req.query?.limit }),
          200,
        );
      }
      const sp = new URLSearchParams();
      if (req.query?.page) sp.set("page", String(req.query.page));
      if (req.query?.limit) sp.set("limit", String(req.query.limit));
      const qs = sp.toString();
      return fetchFn<UserListResponse>(`/users${qs ? `?${qs}` : ""}`);
    },
    getById: (req: { params: { id: string } }) =>
      orpc
        ? orpcResponse(() => orpc.users.getById({ id: req.params.id }), 200)
        : fetchFn<UserResponse>(`/users/${encodeURIComponent(req.params.id)}`),
    create: (req: { body: CreateUserInput }) =>
      orpc
        ? orpcResponse(() => orpc.users.create(req.body), 201)
        : fetchFn<UserResponse>("/users", {
            method: "POST",
            body: JSON.stringify(req.body),
          }),
    update: (req: { params: { id: string }; body: UpdateUserInput }) =>
      orpc
        ? orpcResponse(() => orpc.users.update({ id: req.params.id, ...req.body }), 200)
        : fetchFn<UserResponse>(`/users/${encodeURIComponent(req.params.id)}`, {
            method: "PATCH",
            body: JSON.stringify(req.body),
          }),
    delete: (req: { params: { id: string } }) =>
      orpc
        ? orpcResponse(() => orpc.users.delete({ id: req.params.id }), 204)
        : fetchFn<void>(`/users/${encodeURIComponent(req.params.id)}`, { method: "DELETE" }),
  };
}
