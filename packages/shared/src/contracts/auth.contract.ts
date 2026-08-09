import { initContract } from "@ts-rest/core";
import { z } from "zod";
import {
  RegisterSchema,
  LoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  RefreshTokenSchema,
  AuthResponseSchema,
  MessageResponseSchema,
} from "../schemas/auth.schema";

const c = initContract();

export const authContract = c.router({
  register: {
    method: "POST" as const,
    path: "/auth/register",
    body: RegisterSchema as any,
    responses: {
      201: AuthResponseSchema as any,
      409: { message: "" } as any,
    },
  },
  login: {
    method: "POST" as const,
    path: "/auth/login",
    body: LoginSchema as any,
    responses: {
      200: AuthResponseSchema as any,
      401: { message: "" } as any,
    },
  },
  logout: {
    method: "POST" as const,
    path: "/auth/logout",
    body: z.object({}) as any,
    responses: {
      200: MessageResponseSchema as any,
    },
  },
  refresh: {
    method: "POST" as const,
    path: "/auth/refresh",
    body: RefreshTokenSchema as any,
    responses: {
      200: AuthResponseSchema as any,
      401: { message: "" } as any,
    },
  },
  forgotPassword: {
    method: "POST" as const,
    path: "/auth/forgot-password",
    body: ForgotPasswordSchema as any,
    responses: {
      200: MessageResponseSchema as any,
    },
  },
  resetPassword: {
    method: "POST" as const,
    path: "/auth/reset-password",
    body: ResetPasswordSchema as any,
    responses: {
      200: MessageResponseSchema as any,
    },
  },
});
