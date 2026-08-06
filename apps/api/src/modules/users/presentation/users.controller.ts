import { Controller, Req, HttpStatus } from "@nestjs/common";
import { FastifyRequest } from "fastify";
import { RequirePermissions } from "../../../common";
import { CreateUserInput, UpdateUserInput, usersContract } from "@repo/shared";
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
  async list(
    @Req() req?: FastifyRequest,
  ) {
    // @ts-ignore: ts-rest inference is broken with Zod 4
    return tsRestHandler(usersContract.list, async ({ query }: any) => {
      const { page, limit } = query;
      const lang = req?.headers["accept-language"];
      const result = await this.getUsersQuery.execute(
        page ? Number(page) : undefined,
        limit ? Number(limit) : undefined,
      );
      const val = handleResult(result, {}, this.i18n, lang);
      const { users, total, page: p, limit: l } = val;
      return { 
        status: 200, 
        body: { users: users.map(toUserResponse), total, page: p, limit: l } 
      };
    });
  }

  @TsRestHandler(usersContract.getById)
  @RequirePermissions("users:read")
  async getById(@Req() req?: FastifyRequest) {
    // @ts-ignore: ts-rest inference is broken with Zod 4
    return tsRestHandler(usersContract.getById, async ({ params: { id } }: any) => {
      const lang = req?.headers["accept-language"];
      const result = await this.getUserByIdQuery.execute(id);
      const user = handleResult(result, {
        USER_NOT_FOUND: { status: HttpStatus.NOT_FOUND, i18nKey: "api.user.notFound" },
      }, this.i18n, lang);
      return {
        status: 200,
        body: toUserResponse(user)
      };
    });
  }

  @TsRestHandler(usersContract.create)
  @RequirePermissions("users:write")
  async create(@Req() req?: FastifyRequest) {
    // @ts-ignore: ts-rest inference is broken with Zod 4
    return tsRestHandler(usersContract.create, async ({ body }: any) => {
      const lang = req?.headers["accept-language"];
      const result = await this.createUserCommand.execute(body as CreateUserInput);
      const user = handleResult(result, {
        EMAIL_TAKEN: { status: HttpStatus.CONFLICT, i18nKey: "api.user.emailTaken" },
      }, this.i18n, lang);
      return {
        status: 201,
        body: toUserResponse(user)
      };
    });
  }

  @TsRestHandler(usersContract.update)
  @RequirePermissions("users:write")
  async update(@Req() req?: FastifyRequest) {
    // @ts-ignore: ts-rest inference is broken with Zod 4
    return tsRestHandler(usersContract.update, async ({ params: { id }, body }: any) => {
      const lang = req?.headers["accept-language"];
      const result = await this.updateUserCommand.execute(id, body as UpdateUserInput);
      const user = handleResult(result, {
        USER_NOT_FOUND: { status: HttpStatus.NOT_FOUND, i18nKey: "api.user.notFound" },
        EMAIL_TAKEN: { status: HttpStatus.CONFLICT, i18nKey: "api.user.emailTaken" },
      }, this.i18n, lang);
      return {
        status: 200,
        body: toUserResponse(user)
      };
    });
  }

  @TsRestHandler(usersContract.delete)
  @RequirePermissions("users:write")
  async delete(@Req() req?: FastifyRequest) {
    // @ts-ignore: ts-rest inference is broken with Zod 4
    return tsRestHandler(usersContract.delete, async ({ params: { id } }: any) => {
      const lang = req?.headers["accept-language"];
      const result = await this.deleteUserCommand.execute(id);
      handleResult(result, {
        USER_NOT_FOUND: { status: HttpStatus.NOT_FOUND, i18nKey: "api.user.notFound" },
      }, this.i18n, lang);
      return {
        status: 204,
        body: undefined as any
      };
    });
  }
}
