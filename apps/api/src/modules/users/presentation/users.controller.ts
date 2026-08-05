import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, HttpCode, HttpStatus } from "@nestjs/common";
import { FastifyRequest } from "fastify";
import { RequirePermissions } from "../../../common";
import { CreateUserSchema, UpdateUserSchema, CreateUserInput, UpdateUserInput } from "@repo/shared";
import { ZodValidationPipe } from "../../../common/pipes/validation.pipe";
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

  @Get()
  @RequirePermissions("users:read")
  async list(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Req() req?: FastifyRequest,
  ) {
    const lang = req?.headers["accept-language"];
    const result = await this.getUsersQuery.execute(
      page ? Number(page) : undefined,
      limit ? Number(limit) : undefined,
    );
    const val = handleResult(result, {}, this.i18n, lang);
    const { users, total, page: p, limit: l } = val;
    return { users: users.map(toUserResponse), total, page: p, limit: l };
  }

  @Get(":id")
  @RequirePermissions("users:read")
  async getById(@Param("id") id: string, @Req() req?: FastifyRequest) {
    const lang = req?.headers["accept-language"];
    const result = await this.getUserByIdQuery.execute(id);
    const user = handleResult(result, {
      USER_NOT_FOUND: { status: HttpStatus.NOT_FOUND, i18nKey: "api.user.notFound" },
    }, this.i18n, lang);
    return toUserResponse(user);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions("users:write")
  async create(@Body(new ZodValidationPipe(CreateUserSchema)) body: CreateUserInput, @Req() req?: FastifyRequest) {
    const lang = req?.headers["accept-language"];
    const result = await this.createUserCommand.execute(body);
    const user = handleResult(result, {
      EMAIL_TAKEN: { status: HttpStatus.CONFLICT, i18nKey: "api.user.emailTaken" },
    }, this.i18n, lang);
    return toUserResponse(user);
  }

  @Patch(":id")
  @RequirePermissions("users:write")
  async update(@Param("id") id: string, @Body(new ZodValidationPipe(UpdateUserSchema)) body: UpdateUserInput, @Req() req?: FastifyRequest) {
    const lang = req?.headers["accept-language"];
    const result = await this.updateUserCommand.execute(id, body);
    const user = handleResult(result, {
      USER_NOT_FOUND: { status: HttpStatus.NOT_FOUND, i18nKey: "api.user.notFound" },
      EMAIL_TAKEN: { status: HttpStatus.CONFLICT, i18nKey: "api.user.emailTaken" },
    }, this.i18n, lang);
    return toUserResponse(user);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions("users:write")
  async delete(@Param("id") id: string, @Req() req?: FastifyRequest) {
    const lang = req?.headers["accept-language"];
    const result = await this.deleteUserCommand.execute(id);
    handleResult(result, {
      USER_NOT_FOUND: { status: HttpStatus.NOT_FOUND, i18nKey: "api.user.notFound" },
    }, this.i18n, lang);
    return;
  }
}
