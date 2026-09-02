import type {
  AuthResponse,
  CurrentUserResponse,
  ForgotPasswordInput,
  LoginInput,
  MessageResponse,
  RefreshTokenInput,
  RegisterInput,
  ResetPasswordInput,
} from "@repo/contracts";
import type { FetchFn } from "../types";
import { orpcResponse, type OrpcClient } from "../orpc";

export function createAuthClient(fetchFn: FetchFn, orpc?: OrpcClient) {
  return {
    register: (req: { body: RegisterInput }) =>
      orpc
        ? orpcResponse(() => orpc.auth.register(req.body), 201)
        : fetchFn<AuthResponse>("/auth/register", {
            method: "POST",
            body: JSON.stringify(req.body),
          }),
    login: (req: { body: LoginInput }) =>
      orpc
        ? orpcResponse(() => orpc.auth.login(req.body), 200)
        : fetchFn<AuthResponse>("/auth/login", {
            method: "POST",
            body: JSON.stringify(req.body),
          }),
    logout: () =>
      orpc
        ? orpcResponse(() => orpc.auth.logout(), 200)
        : fetchFn<MessageResponse>("/auth/logout", { method: "POST" }),
    me: () =>
      orpc
        ? orpcResponse(() => orpc.auth.me(), 200)
        : fetchFn<CurrentUserResponse>("/auth/me", { method: "GET" }),
    refresh: (req: { body: RefreshTokenInput }) =>
      orpc
        ? orpcResponse(() => orpc.auth.refresh(req.body), 200)
        : fetchFn<AuthResponse>("/auth/refresh", {
            method: "POST",
            body: JSON.stringify(req.body),
          }),
    forgotPassword: (req: { body: ForgotPasswordInput }) =>
      orpc
        ? orpcResponse(() => orpc.auth.forgotPassword(req.body), 200)
        : fetchFn<MessageResponse>("/auth/forgot-password", {
            method: "POST",
            body: JSON.stringify(req.body),
          }),
    resetPassword: (req: { body: ResetPasswordInput }) =>
      orpc
        ? orpcResponse(() => orpc.auth.resetPassword(req.body), 200)
        : fetchFn<MessageResponse>("/auth/reset-password", {
            method: "POST",
            body: JSON.stringify(req.body),
          }),
  };
}
