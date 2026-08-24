import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { SwaggerModule } from "@nestjs/swagger";
import { apiContract } from "@repo/shared";
import { env } from "../../config/env";

export async function setupSwagger(app: NestFastifyApplication): Promise<void> {
  const { OpenAPIGenerator } = await import("@orpc/openapi");
  const generator = new OpenAPIGenerator();
  const document = await generator.generate(apiContract, {
    info: {
      title: "Enterprise Modular Monolith API",
      version: "1.0.0",
      description: "Auto-generated OpenAPI 3.1 Documentation via oRPC and Zod 4 schemas.",
    },
    servers: [{ url: `${env.API_URL}/api` }],
  });

  SwaggerModule.setup("api/docs", app, document as Parameters<typeof SwaggerModule.setup>[2]);
}
