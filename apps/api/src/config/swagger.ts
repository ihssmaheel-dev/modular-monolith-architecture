import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { SwaggerModule } from "@nestjs/swagger";
import { generateOpenApi } from "@ts-rest/open-api";
import { usersContract, notesContract } from "@repo/shared";
import { env } from "./env";

export function setupSwagger(app: NestFastifyApplication) {
  const document = generateOpenApi(
    {
      // Add all new route contracts here as the architecture grows
      users: usersContract,
      notes: notesContract,
    },
    {
      info: {
        title: "Enterprise Modular Monolith API",
        version: "1.0.0",
        description: "Auto-generated API Documentation via ts-rest and Zod schemas.",
      },
      servers: [{ url: `http://localhost:${env.PORT}/api` }],
    },
    { setOperationId: true }
  );

  SwaggerModule.setup("api/docs", app, document);
}
