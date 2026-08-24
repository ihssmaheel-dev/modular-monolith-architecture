import type {
  AuthResponse,
  ForgotPasswordInput,
  LoginInput,
  MessageResponse,
  RefreshTokenInput,
  RegisterInput,
  ResetPasswordInput,
} from "@repo/shared";
import type { FetchFn } from "../types";

export function createAuthClient(fetchFn: FetchFn) {
  return {
    register: (req: { body: RegisterInput }) =>
      fetchFn<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(req.body) }),
    login: (req: { body: LoginInput }) =>
      fetchFn<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(req.body) }),
    logout: () => fetchFn<MessageResponse>("/auth/logout", { method: "POST" }),
    refresh: (req: { body: RefreshTokenInput }) =>
      fetchFn<AuthResponse>("/auth/refresh", { method: "POST", body: JSON.stringify(req.body) }),
    forgotPassword: (req: { body: ForgotPasswordInput }) =>
      fetchFn<MessageResponse>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify(req.body),
      }),
    resetPassword: (req: { body: ResetPasswordInput }) =>
      fetchFn<MessageResponse>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify(req.body),
      }),
  };
}
