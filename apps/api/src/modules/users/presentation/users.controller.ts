import { Controller, Req, HttpStatus } from "@nestjs/common";
import { FastifyRequest } from "fastify";
import { RequirePermissions, TenantAgnostic } from "../../../common";
import { usersContract } from "@repo/shared";
import { TsRestHandler, tsRestHandler } from "@ts-rest/nest";
import { GetUsersQuery } from "../application/queries/get-users.query";
import { GetUserByIdQuery } from "../application/queries/get-user-by-id.query";
import { CreateUserCommand } from "../application/commands/create-user.command";
import { UpdateUserCommand } from "../application/commands/update-user.command";
import { DeleteUserCommand } from "../application/commands/delete-user.command";
import { I18nService } from "../../../infrastructure/i18n/i18n.service";
import { handleResult } from "../../../common/utils/presentation.utils";

import { toUserResponse } from "./users.mapper";

@Controller("users")
@TenantAgnostic()
export class UsersController {
  constructor(
    private readonly getUsersQuery: GetUsersQuery,
    private readonly getUserByIdQuery: GetUserByIdQuery,
    private readonly createUserCommand: CreateUserCommand,
    private readonly updateUserCommand: UpdateUserCommand,
    private readonly deleteUserCommand: DeleteUserCommand,
    private readonly i18n: I18nService,
  ) {}

  @TsRestHandler(usersContract.list)
  @RequirePermissions("users:read")
  list(@Req() req: FastifyRequest) {
    return tsRestHandler(usersContract.list, async ({ query }) => {
      const { page, limit } = query;
      const lang = req?.headers["accept-language"];
      const result = await this.getUsersQuery.execute(page, limit);
      const val = handleResult(result, {}, this.i18n, lang);
      const { users, total, page: p, limit: l } = val;
      return {
        status: 200 as const,
        body: { users: users.map(toUserResponse), total, page: p, limit: l },
      };
    });
  }

  @TsRestHandler(usersContract.getById)
  @RequirePermissions("users:read")
  getById(@Req() req: FastifyRequest) {
    return tsRestHandler(usersContract.getById, async ({ params: { id } }) => {
      const lang = req?.headers["accept-language"];
      const result = await this.getUserByIdQuery.execute(id);
      const user = handleResult(
        result,
        {
          USER_NOT_FOUND: { status: HttpStatus.NOT_FOUND, i18nKey: "api.user.notFound" },
        },
        this.i18n,
        lang,
      );
      return {
        status: 200 as const,
        body: toUserResponse(user),
      };
    });
  }

  @TsRestHandler(usersContract.create)
  @RequirePermissions("users:write")
  create(@Req() req: FastifyRequest) {
    return tsRestHandler(usersContract.create, async ({ body }) => {
      const lang = req?.headers["accept-language"];
      const locale = this.i18n.getLocale(req.headers["accept-language"]);
      const result = await this.createUserCommand.execute(body, locale);
      const user = handleResult(
        result,
        {
          EMAIL_TAKEN: { status: HttpStatus.CONFLICT, i18nKey: "api.user.emailTaken" },
        },
        this.i18n,
        lang,
      );
      return {
        status: 201 as const,
        body: toUserResponse(user),
      };
    });
  }

  @TsRestHandler(usersContract.update)
  @RequirePermissions("users:write")
  update(@Req() req: FastifyRequest) {
    return tsRestHandler(usersContract.update, async ({ params: { id }, body }) => {
      const lang = req?.headers["accept-language"];
      const result = await this.updateUserCommand.execute(id, body);
      const user = handleResult(
        result,
        {
          USER_NOT_FOUND: { status: HttpStatus.NOT_FOUND, i18nKey: "api.user.notFound" },
          EMAIL_TAKEN: { status: HttpStatus.CONFLICT, i18nKey: "api.user.emailTaken" },
        },
        this.i18n,
        lang,
      );
      return {
        status: 200 as const,
        body: toUserResponse(user),
      };
    });
  }

  @TsRestHandler(usersContract.delete)
  @RequirePermissions("users:write")
  delete(@Req() req: FastifyRequest) {
    return tsRestHandler(usersContract.delete, async ({ params: { id } }) => {
      const lang = req?.headers["accept-language"];
      const result = await this.deleteUserCommand.execute(id);
      handleResult(
        result,
        {
          USER_NOT_FOUND: { status: HttpStatus.NOT_FOUND, i18nKey: "api.user.notFound" },
          USER_OWNS_ORGANIZATION: {
            status: HttpStatus.CONFLICT,
            i18nKey: "api.user.ownsOrganization",
          },
        },
        this.i18n,
        lang,
      );
      return {
        status: 204 as const,
        body: undefined,
      };
    });
  }
}
