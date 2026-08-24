import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, Req } from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { Idempotent, RequirePermissions, TenantAgnostic } from "../../../common";
import {
  type CreateUserInput,
  type UpdateUserInput,
  type PaginationQuery,
  type UserResponse,
  type UserListResponse,
} from "@repo/shared";
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

  @Get()
  @RequirePermissions("users:read")
  async list(
    @Query() query: PaginationQuery,
    @Req() req: FastifyRequest,
  ): Promise<UserListResponse> {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);
    const lang = req?.headers["accept-language"];
    const result = await this.getUsersQuery.execute(page, limit);
    const val = handleResult(result, {}, this.i18n, lang);
    const { users, total, page: p, limit: l } = val;
    return { users: users.map(toUserResponse), total, page: p, limit: l };
  }

  @Get(":id")
  @RequirePermissions("users:read")
  async getById(
    @Param("id") id: string,
    @Req() req: FastifyRequest,
  ): Promise<UserResponse> {
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
    return toUserResponse(user);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Idempotent()
  @RequirePermissions("users:write")
  async create(
    @Body() body: CreateUserInput,
    @Req() req: FastifyRequest,
  ): Promise<UserResponse> {
    const lang = req?.headers["accept-language"];
    const locale = this.i18n.getLocale(req.headers["accept-language"]);
    const result = await this.createUserCommand.execute(body, locale);
    const user = handleResult(
      result,
      {
        EMAIL_TAKEN: { status: HttpStatus.CONFLICT, i18nKey: "api.user.emailTaken" },
        TRANSACTION_FAILED: {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          i18nKey: "api.error.transactionFailed",
        },
      },
      this.i18n,
      lang,
    );
    return toUserResponse(user);
  }

  @Patch(":id")
  @Idempotent()
  @RequirePermissions("users:write")
  async update(
    @Param("id") id: string,
    @Body() body: UpdateUserInput,
    @Req() req: FastifyRequest,
  ): Promise<UserResponse> {
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
    return toUserResponse(user);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @Idempotent()
  @RequirePermissions("users:write")
  async delete(
    @Param("id") id: string,
    @Req() req: FastifyRequest,
  ): Promise<void> {
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
  }
}
