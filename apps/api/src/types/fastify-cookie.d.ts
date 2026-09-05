/// <reference types="@fastify/cookie" />

import "fastify";

declare module "fastify" {
  interface FastifyRequest {
    cookies: Record<string, string | undefined>;
  }

  interface FastifyReply {
    setCookie(name: string, value: string, options?: object): this;
    clearCookie(name: string, options?: object): this;
  }
}
