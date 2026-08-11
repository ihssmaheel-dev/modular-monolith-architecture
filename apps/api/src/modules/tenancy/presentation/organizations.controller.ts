import { Controller, Req } from "@nestjs/common";
import { TsRestHandler, tsRestHandler } from "@ts-rest/nest";
import type { FastifyRequest } from "fastify";
import { tenancyContract } from "@repo/shared";
import { Idempotent, TenantAgnostic, requireAuthenticatedUser } from "../../../common";
import { handleResult } from "../../../common/utils/presentation.utils";
import { I18nService } from "../../../infrastructure/i18n/i18n.service";
import { CreateOrganizationCommand } from "../application/commands/create-organization.command";
import { ListOrganizationsQuery } from "../application/queries/list-organizations.query";
import { ORGANIZATION_ERRORS } from "./tenancy.error-maps";
import { toOrganizationResponse } from "./tenancy.mapper";

@Controller("tenancy")
@TenantAgnostic()
export class OrganizationsController {
  constructor(
    private readonly createOrganization: CreateOrganizationCommand,
    private readonly listOrganizations: ListOrganizationsQuery,
    private readonly i18n: I18nService,
  ) {}

  @TsRestHandler(tenancyContract.createOrganization)
  @Idempotent()
  create(@Req() request: FastifyRequest) {
    return tsRestHandler(tenancyContract.createOrganization, async ({ body }) => {
      const actor = requireAuthenticatedUser(request);
      const result = await this.createOrganization.execute(body, actor);
      const value = handleResult(
        result,
        ORGANIZATION_ERRORS,
        this.i18n,
        request.headers["accept-language"],
      );
      return {
        status: 201 as const,
        body: toOrganizationResponse(value.organization, value.membership.data.role),
      };
    });
  }

  @TsRestHandler(tenancyContract.listOrganizations)
  list(@Req() request: FastifyRequest) {
    return tsRestHandler(tenancyContract.listOrganizations, async ({ query }) => {
      const actor = requireAuthenticatedUser(request);
      const result = await this.listOrganizations.execute(actor, query.page, query.limit);
      const value = handleResult(result, {}, this.i18n, request.headers["accept-language"]);
      return {
        status: 200 as const,
        body: {
          ...value,
          items: value.items.map(({ organization, role }) =>
            toOrganizationResponse(organization, role),
          ),
        },
      };
    });
  }
}
