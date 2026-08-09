import type { FastifyReply } from "fastify";
import { env } from "../../../config/env";

const ACCESS_TOKEN_MAX_AGE = 15 * 60; // 15 minutes
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export function setAccessTokenCookie(reply: FastifyReply, token: string): void {
  reply.setCookie("access_token", token, {
    ...COOKIE_OPTIONS,
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });
}

export function setRefreshTokenCookie(reply: FastifyReply, token: string): void {
  reply.setCookie("refresh_token", token, {
    ...COOKIE_OPTIONS,
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });
}

export function clearAuthCookies(reply: FastifyReply): void {
  reply.clearCookie("access_token", { path: "/" });
  reply.clearCookie("refresh_token", { path: "/" });
}
