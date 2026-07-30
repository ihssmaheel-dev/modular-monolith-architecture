import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, HttpCode, HttpStatus, NotFoundException } from "@nestjs/common";
import { FastifyRequest } from "fastify";
import { CreateUserSchema, UpdateUserSchema } from "@repo/shared";
import { UsersService } from "../application/users.service";
import { I18nService } from "../../../infrastructure/i18n/i18n.service";
import { User } from "../domain/entities/user.entity";

interface UserResponse {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

function toUserResponse(user: User): UserResponse {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

@Controller("users")
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly i18n: I18nService,
  ) {}

  @Get()
  async list(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Req() req?: FastifyRequest,
  ) {
    const lang = req?.headers["accept-language"];
    const result = await this.usersService.list(
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
    const result = await this.usersService.getById(id);
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
      return { statusCode: HttpStatus.BAD_REQUEST, message: "Validation failed", errors: parsed.error.flatten() };
    }
    const result = await this.usersService.create(parsed.data);
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
      return { statusCode: HttpStatus.BAD_REQUEST, message: "Validation failed", errors: parsed.error.flatten() };
    }
    const result = await this.usersService.update(id, parsed.data);
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
    const result = await this.usersService.delete(id);
    if (result.isErr()) {
      throw new NotFoundException(this.i18n.t("api.user.notFound", lang));
    }
  }
}
