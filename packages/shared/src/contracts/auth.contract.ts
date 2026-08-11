import { initContract, type AppRouter } from "@ts-rest/core";
import {
  RegisterSchema,
  LoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  RefreshTokenSchema,
  AuthResponseSchema,
  MessageResponseSchema,
} from "../schemas/auth.schema";
import { contractSchema } from "./contract-schema";

const c = initContract();

export const authContract = {
  register: {
    method: "POST" as const,
    path: "/auth/register",
    body: contractSchema(RegisterSchema),
    responses: {
      201: contractSchema(AuthResponseSchema),
      409: contractSchema(MessageResponseSchema),
    },
  },
  login: {
    method: "POST" as const,
    path: "/auth/login",
    body: contractSchema(LoginSchema),
    responses: {
      200: contractSchema(AuthResponseSchema),
      401: contractSchema(MessageResponseSchema),
    },
  },
  logout: {
    method: "POST" as const,
    path: "/auth/logout",
    body: c.noBody(),
    responses: {
      200: contractSchema(MessageResponseSchema),
      401: contractSchema(MessageResponseSchema),
    },
  },
  refresh: {
    method: "POST" as const,
    path: "/auth/refresh",
    body: contractSchema(RefreshTokenSchema),
    responses: {
      200: contractSchema(AuthResponseSchema),
      401: contractSchema(MessageResponseSchema),
    },
  },
  forgotPassword: {
    method: "POST" as const,
    path: "/auth/forgot-password",
    body: contractSchema(ForgotPasswordSchema),
    responses: {
      200: contractSchema(MessageResponseSchema),
    },
  },
  resetPassword: {
    method: "POST" as const,
    path: "/auth/reset-password",
    body: contractSchema(ResetPasswordSchema),
    responses: {
      200: contractSchema(MessageResponseSchema),
      401: contractSchema(MessageResponseSchema),
    },
  },
} as const satisfies AppRouter;
