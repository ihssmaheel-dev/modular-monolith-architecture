import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { apiContract } from "@repo/contracts";
import { env } from "../../config/env";
import { Zod4SchemaConverter } from "./zod-schema-converter";
import { PinoLoggerService } from "../logger/logger.service";

export async function setupApiDocs(app: NestFastifyApplication): Promise<void> {
  try {
    const { OpenAPIGenerator } = await import("@orpc/openapi");
    const { default: fastifyApiReference } = await import("@scalar/fastify-api-reference");

    const generator = new OpenAPIGenerator({
      schemaConverters: [new Zod4SchemaConverter()],
    });
    const document = await generator.generate(apiContract, {
      info: {
        title: "Enterprise Modular Monolith API",
        version: "1.0.0",
        description: "Auto-generated OpenAPI 3.1 Documentation via oRPC and Zod 4 schemas.",
      },
      servers: [
        { url: "/api", description: "Default API server (relative)" },
        { url: `${env.API_URL}/api`, description: "Direct API server" },
      ],
    });

    const fastify = app.getHttpAdapter().getInstance();

    // Expose raw OpenAPI JSON at /api/docs/json for debugging and for Scalar URL reference
    fastify.get("/api/docs/json", async (_req, reply) => {
      reply.type("application/json").send(document);
    });

    // Scalar is a Fastify plugin — register directly on the Fastify instance
    // BEFORE Nest global prefix/versioning so /api/docs is not versioned.
    // Serve at exactly /api/docs (matching banner) regardless of Nest prefix.
    await fastify.register(fastifyApiReference as unknown as never, {
      routePrefix: "/api/docs",
      configuration: {
        content: document,
        theme: "kepler",
        darkMode: true,
        showSidebar: true,
        pageTitle: "API Reference | Enterprise Modular Monolith",
        metaData: {
          title: "API Reference | Enterprise Modular Monolith",
        },
      },
    });
  } catch (error) {
    // Docs are dev-only; never crash boot if generation fails — log and continue
    app.get(PinoLoggerService).warn({ error: String(error) }, "API docs setup failed");
  }
}
