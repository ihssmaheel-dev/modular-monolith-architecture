import type { FastifyRequest } from "fastify";
import { UnauthorizedException } from "@nestjs/common";
import type { AuthenticatedUser } from "@repo/contracts";

type AuthenticatedRequest = FastifyRequest & {
  user?: AuthenticatedUser;
};

export function getAuthenticatedUser(request?: FastifyRequest): AuthenticatedUser | undefined {
  return (request as AuthenticatedRequest | undefined)?.user;
}

export function requireAuthenticatedUser(request?: FastifyRequest): AuthenticatedUser {
  const user = getAuthenticatedUser(request);
  if (!user) throw new UnauthorizedException();
  return user;
}
