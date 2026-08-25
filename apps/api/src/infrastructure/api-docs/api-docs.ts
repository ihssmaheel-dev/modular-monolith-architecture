import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { apiContract } from "@repo/contracts";
import { env } from "../../config/env";

export async function setupApiDocs(app: NestFastifyApplication): Promise<void> {
  const { OpenAPIGenerator } = await import("@orpc/openapi");
  const { default: fastifyApiReference } = await import("@scalar/fastify-api-reference");

  const generator = new OpenAPIGenerator();
  const document = await generator.generate(apiContract, {
    info: {
      title: "Enterprise Modular Monolith API",
      version: "1.0.0",
      description: "Auto-generated OpenAPI 3.1 Documentation via oRPC and Zod 4 schemas.",
    },
    servers: [{ url: `${env.API_URL}/api` }],
  });

  await app.register(fastifyApiReference as unknown as never, {
    routePrefix: "/api/docs",
    configuration: {
      spec: {
        content: document,
      },
      theme: "kepler",
      darkMode: true,
      showSidebar: true,
      metaData: {
        title: "API Reference | Enterprise Modular Monolith",
      },
    },
  });
}
