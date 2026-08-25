import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { apiContract } from "@repo/contracts";
import { env } from "../../config/env";

export async function setupApiDocs(app: NestFastifyApplication): Promise<void> {
  try {
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
        spec: {
          // Use content directly (also available via /api/docs/json)
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
  } catch (error) {
    // Docs are dev-only; never crash boot if generation fails — log and continue
    const maybeLogger = (app as unknown as { get?: (t: unknown) => { warn?: (o: unknown, m: string) => void } })?.get?.(undefined as unknown as never) as { warn?: (o: unknown, m: string) => void } | undefined;
    if (maybeLogger?.warn) {
      maybeLogger.warn({ error: String(error) }, "API docs setup failed");
    } else {
      console.warn("API docs setup failed:", error);
    }
  }
}
