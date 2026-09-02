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
import {
  AuthResponseSchema,
  CurrentUserResponseSchema,
  MessageResponseSchema,
} from "@repo/contracts";
import type { FetchFn } from "../types";
import { orpcResponse, type OrpcClient } from "../orpc";

export function createAuthClient(fetchFn: FetchFn, orpc?: OrpcClient) {
  return {
    register: (req: { body: RegisterInput }) =>
      orpc
        ? orpcResponse(() => orpc.auth.register(req.body), 201, AuthResponseSchema)
        : fetchFn<AuthResponse>(
            "/auth/register",
            {
              method: "POST",
              body: JSON.stringify(req.body),
            },
            AuthResponseSchema,
          ),
    login: (req: { body: LoginInput }) =>
      orpc
        ? orpcResponse(() => orpc.auth.login(req.body), 200, AuthResponseSchema)
        : fetchFn<AuthResponse>(
            "/auth/login",
            {
              method: "POST",
              body: JSON.stringify(req.body),
            },
            AuthResponseSchema,
          ),
    logout: () =>
      orpc
        ? orpcResponse(() => orpc.auth.logout(), 200, MessageResponseSchema)
        : fetchFn<MessageResponse>("/auth/logout", { method: "POST" }, MessageResponseSchema),
    me: () =>
      orpc
        ? orpcResponse(() => orpc.auth.me(), 200, CurrentUserResponseSchema)
        : fetchFn<CurrentUserResponse>("/auth/me", { method: "GET" }, CurrentUserResponseSchema),
    refresh: (req: { body: RefreshTokenInput }) =>
      orpc
        ? orpcResponse(() => orpc.auth.refresh(req.body), 200, AuthResponseSchema)
        : fetchFn<AuthResponse>(
            "/auth/refresh",
            {
              method: "POST",
              body: JSON.stringify(req.body),
            },
            AuthResponseSchema,
          ),
    forgotPassword: (req: { body: ForgotPasswordInput }) =>
      orpc
        ? orpcResponse(() => orpc.auth.forgotPassword(req.body), 200, MessageResponseSchema)
        : fetchFn<MessageResponse>(
            "/auth/forgot-password",
            {
              method: "POST",
              body: JSON.stringify(req.body),
            },
            MessageResponseSchema,
          ),
    resetPassword: (req: { body: ResetPasswordInput }) =>
      orpc
        ? orpcResponse(() => orpc.auth.resetPassword(req.body), 200, MessageResponseSchema)
        : fetchFn<MessageResponse>(
            "/auth/reset-password",
            {
              method: "POST",
              body: JSON.stringify(req.body),
            },
            MessageResponseSchema,
          ),
  };
}
