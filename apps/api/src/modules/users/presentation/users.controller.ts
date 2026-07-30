import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, HttpCode, HttpStatus } from "@nestjs/common";
import { FastifyRequest } from "fastify";
import { CreateUserSchema, UpdateUserSchema } from "@repo/shared";
import { GetUsersQuery } from "../application/queries/get-users.query";
import { GetUserByIdQuery } from "../application/queries/get-user-by-id.query";
import { CreateUserCommand } from "../application/commands/create-user.command";
import { UpdateUserCommand } from "../application/commands/update-user.command";
import { DeleteUserCommand } from "../application/commands/delete-user.command";
import { I18nService } from "../../../infrastructure/i18n/i18n.service";

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
    if (result.isErr()) {
      return { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: this.i18n.t("api.error.internal", lang) };
    }
    const { users, total, page: p, limit: l } = result.value;
    return { users: users.map(toUserResponse), total, page: p, limit: l };
  }

  @Get(":id")
  async getById(@Param("id") id: string, @Req() req?: FastifyRequest) {
    const lang = req?.headers["accept-language"];
    const result = await this.getUserByIdQuery.execute(id);
    if (result.isErr()) {
      return { statusCode: HttpStatus.NOT_FOUND, message: this.i18n.t("api.user.notFound", lang) };
    }
    return toUserResponse(result.value);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: unknown, @Req() req?: FastifyRequest) {
    const lang = req?.headers["accept-language"];
    const parsed = CreateUserSchema.safeParse(body);
    if (!parsed.success) {
      return { statusCode: HttpStatus.BAD_REQUEST, message: this.i18n.t("api.error.badRequest", lang), errors: parsed.error.flatten() };
    }
    const result = await this.createUserCommand.execute(parsed.data);
    if (result.isErr()) {
      return { statusCode: HttpStatus.CONFLICT, message: this.i18n.t("api.user.emailTaken", lang) };
    }
    return toUserResponse(result.value);
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() body: unknown, @Req() req?: FastifyRequest) {
    const lang = req?.headers["accept-language"];
    const parsed = UpdateUserSchema.safeParse(body);
    if (!parsed.success) {
      return { statusCode: HttpStatus.BAD_REQUEST, message: this.i18n.t("api.error.badRequest", lang), errors: parsed.error.flatten() };
    }
    const result = await this.updateUserCommand.execute(id, parsed.data);
    if (result.isErr()) {
      const status = result.error.type === "USER_NOT_FOUND" ? HttpStatus.NOT_FOUND : HttpStatus.CONFLICT;
      const key = result.error.type === "USER_NOT_FOUND" ? "api.user.notFound" : "api.user.emailTaken";
      return { statusCode: status, message: this.i18n.t(key, lang) };
    }
    return toUserResponse(result.value);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param("id") id: string, @Req() req?: FastifyRequest) {
    const lang = req?.headers["accept-language"];
    const result = await this.deleteUserCommand.execute(id);
    if (result.isErr()) {
      return { statusCode: HttpStatus.NOT_FOUND, message: this.i18n.t("api.user.notFound", lang) };
    }
    return;
  }
}
