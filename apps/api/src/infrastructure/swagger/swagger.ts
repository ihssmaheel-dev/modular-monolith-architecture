import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { SwaggerModule } from "@nestjs/swagger";
import { generateOpenApi } from "@ts-rest/open-api";
import { usersContract, notesContract, authContract, filesContract } from "@repo/shared";
import { env } from "../../config/env";

export function setupSwagger(app: NestFastifyApplication) {
  const document = generateOpenApi(
    {
      users: usersContract,
      notes: notesContract,
      auth: authContract,
      files: filesContract,
    },
    {
      info: {
        title: "Enterprise Modular Monolith API",
        version: "1.0.0",
        description: "Auto-generated API Documentation via ts-rest and Zod schemas.",
      },
      servers: [{ url: `${env.API_URL}/api` }],
    },
    {},
  );

  SwaggerModule.setup("api/docs", app, document);
}
