const path = require("path");
const { writeFileIfMissing } = require("./utils");

function generatePresentation({
  modulePath,
  moduleName,
  ModuleName,
  feature,
  Feature,
  featurePlural,
  FeaturePlural,
}) {
  const mapperContent = `import type { ${Feature}ResponseDto } from "@repo/contracts";
import type { ${Feature} } from "../domain/entities/${feature}.entity";

export function to${Feature}Response(entity: ${Feature}): ${Feature}ResponseDto {
  return {
    id: entity.id,
    name: entity.name,
    description: entity.description,
    createdBy: entity.createdBy,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
    tenantId: entity.tenantId,
  };
}
`;

  const controllerContent = `import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import {
  Idempotent,
  RequirePermissions,
  ZodValidationPipe,
  requireAuthenticatedUser,
} from "../../../common";
import { handleResult } from "../../../common/utils/presentation.utils";
import { I18nService } from "../../../infrastructure/i18n/i18n.service";
import type {
  Create${Feature}Dto,
  ${Feature}ListResponseDto,
  ${Feature}ResponseDto,
  PaginationQuery,
  Update${Feature}Dto,
} from "@repo/contracts";
import {
  Create${Feature}Schema,
  PaginationQuerySchema,
  Update${Feature}Schema,
} from "@repo/contracts";
import { Create${Feature}Command } from "../application/commands/create-${feature}.command";
import { Update${Feature}Command } from "../application/commands/update-${feature}.command";
import { Delete${Feature}Command } from "../application/commands/delete-${feature}.command";
import { Get${Feature}ByIdQuery } from "../application/queries/get-${feature}-by-id.query";
import { Get${FeaturePlural}Query } from "../application/queries/get-${featurePlural}.query";
import { to${Feature}Response } from "./${featurePlural}.mapper";

const NOT_FOUND_CONFIG = {
  ${Feature.toUpperCase()}_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    i18nKey: "common.notFound",
  },
  EVENT_DISPATCH_FAILED: {
    status: HttpStatus.SERVICE_UNAVAILABLE,
    i18nKey: "api.error.eventDispatchFailed",
  },
};

@Controller("${featurePlural}")
export class ${FeaturePlural}Controller {
  constructor(
    private readonly createCmd: Create${Feature}Command,
    private readonly updateCmd: Update${Feature}Command,
    private readonly deleteCmd: Delete${Feature}Command,
    private readonly getByIdQuery: Get${Feature}ByIdQuery,
    private readonly listQuery: Get${FeaturePlural}Query,
    private readonly i18n: I18nService,
  ) {}

  @Get()
  @RequirePermissions("${featurePlural}:read")
  async list(@Query(new ZodValidationPipe(PaginationQuerySchema)) query: PaginationQuery, @Req() req: FastifyRequest): Promise<${Feature}ListResponseDto> {
    const actor = requireAuthenticatedUser(req);
    const lang = req?.headers["accept-language"];
    const result = await this.listQuery.execute(query, actor);
    const val = handleResult(result, {}, this.i18n, lang);
    return {
      items: val.items.map(to${Feature}Response),
      total: val.total,
      page: val.page,
      limit: val.limit,
      totalPages: val.totalPages,
    };
  }

  @Get(":id")
  @RequirePermissions("${featurePlural}:read")
  async getById(@Param("id") id: string, @Req() req: FastifyRequest): Promise<${Feature}ResponseDto> {
    const actor = requireAuthenticatedUser(req);
    const lang = req?.headers["accept-language"];
    const result = await this.getByIdQuery.execute(id, actor);
    const entity = handleResult(result, NOT_FOUND_CONFIG, this.i18n, lang);
    return to${Feature}Response(entity);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Idempotent()
  @RequirePermissions("${featurePlural}:write")
  async create(@Body(new ZodValidationPipe(Create${Feature}Schema)) body: Create${Feature}Dto, @Req() req: FastifyRequest): Promise<${Feature}ResponseDto> {
    const actor = requireAuthenticatedUser(req);
    const lang = req?.headers["accept-language"];
    const result = await this.createCmd.execute(body, actor);
    const entity = handleResult(result, NOT_FOUND_CONFIG, this.i18n, lang);
    return to${Feature}Response(entity);
  }

  @Patch(":id")
  @Idempotent()
  @RequirePermissions("${featurePlural}:write")
  async update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(Update${Feature}Schema)) body: Update${Feature}Dto,
    @Req() req: FastifyRequest,
  ): Promise<${Feature}ResponseDto> {
    const actor = requireAuthenticatedUser(req);
    const lang = req?.headers["accept-language"];
    const result = await this.updateCmd.execute(id, body, actor);
    const entity = handleResult(result, NOT_FOUND_CONFIG, this.i18n, lang);
    return to${Feature}Response(entity);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @Idempotent()
  @RequirePermissions("${featurePlural}:write")
  async delete(@Param("id") id: string, @Req() req: FastifyRequest): Promise<void> {
    const actor = requireAuthenticatedUser(req);
    const lang = req?.headers["accept-language"];
    const result = await this.deleteCmd.execute(id, actor);
    handleResult(result, NOT_FOUND_CONFIG, this.i18n, lang);
  }
}
`;

  const moduleContent = `import { Module } from "@nestjs/common";
import { OutboxModule } from "../../../infrastructure/outbox/outbox.module";
import { ${FeaturePlural}Controller } from "./presentation/${featurePlural}.controller";
import { ${FeaturePlural}Repository } from "./infrastructure/${featurePlural}.repository";
import { Create${Feature}Command } from "./application/commands/create-${feature}.command";
import { Update${Feature}Command } from "./application/commands/update-${feature}.command";
import { Delete${Feature}Command } from "./application/commands/delete-${feature}.command";
import { Get${Feature}ByIdQuery } from "./application/queries/get-${feature}-by-id.query";
import { Get${FeaturePlural}Query } from "./application/queries/get-${featurePlural}.query";
import { ${Feature}RealtimeListener } from "./application/listeners/${feature}-realtime.listener";

@Module({
  imports: [OutboxModule],
  controllers: [${FeaturePlural}Controller],
  providers: [
    ${FeaturePlural}Repository,
    Create${Feature}Command,
    Update${Feature}Command,
    Delete${Feature}Command,
    Get${Feature}ByIdQuery,
    Get${FeaturePlural}Query,
    ${Feature}RealtimeListener,
  ],
  exports: [
    ${FeaturePlural}Repository,
    Create${Feature}Command,
    Update${Feature}Command,
    Delete${Feature}Command,
    Get${Feature}ByIdQuery,
    Get${FeaturePlural}Query,
  ],
})
export class ${ModuleName}Module {}
`;

  writeFileIfMissing(
    path.join(modulePath, "presentation", `${featurePlural}.mapper.ts`),
    mapperContent,
  );
  writeFileIfMissing(
    path.join(modulePath, "presentation", `${featurePlural}.controller.ts`),
    controllerContent,
  );
  writeFileIfMissing(path.join(modulePath, `${moduleName}.module.ts`), moduleContent);
}

module.exports = { generatePresentation };
