import { oc } from "@orpc/contract";
import {
  RegisterSchema,
  LoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  RefreshTokenSchema,
  AuthResponseSchema,
  MessageResponseSchema,
} from "../schemas/auth.schema";

export const authContract = oc.prefix("/auth").router({
  register: oc
    .route({ method: "POST", path: "/register", summary: "Register a new user" })
    .input(RegisterSchema)
    .output(AuthResponseSchema),
  login: oc
    .route({ method: "POST", path: "/login", summary: "Log in an existing user" })
    .input(LoginSchema)
    .output(AuthResponseSchema),
  logout: oc
    .route({ method: "POST", path: "/logout", summary: "Log out user" })
    .output(MessageResponseSchema),
  refresh: oc
    .route({ method: "POST", path: "/refresh", summary: "Refresh access token" })
    .input(RefreshTokenSchema)
    .output(AuthResponseSchema),
  forgotPassword: oc
    .route({ method: "POST", path: "/forgot-password", summary: "Request password reset" })
    .input(ForgotPasswordSchema)
    .output(MessageResponseSchema),
  resetPassword: oc
    .route({ method: "POST", path: "/reset-password", summary: "Reset user password" })
    .input(ResetPasswordSchema)
    .output(MessageResponseSchema),
});
