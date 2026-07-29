import { Controller } from "@nestjs/common";
import { tsRestHandler, TsRestHandler } from "@ts-rest/nest";
import { usersContract, UserResponse } from "@repo/shared";
import { UsersService } from "../application/users.service";
import { I18nService } from "../../../infrastructure/i18n/i18n.service";
import { User } from "../domain/entities/user.entity";

const HTTP_STATUS = {
  OK: 200 as const,
  CREATED: 201 as const,
  NO_CONTENT: 204 as const,
  NOT_FOUND: 404 as const,
  CONFLICT: 409 as const,
  INTERNAL_ERROR: 500 as const,
} as const;

function toUserResponse(user: User): UserResponse {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

@Controller()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly i18n: I18nService,
  ) {}

  @TsRestHandler(usersContract.list)
  async list() {
    return tsRestHandler(usersContract.list, async ({ query, req }) => {
      const lang = req.headers["accept-language"];
      const result = await this.usersService.list(query.page, query.limit);
      if (result.isErr()) {
        return { status: HTTP_STATUS.INTERNAL_ERROR, body: { message: this.i18n.t("api.error.internal", lang) } };
      }
      const { users, total, page, limit } = result.value;
      return {
        status: HTTP_STATUS.OK,
        body: { users: users.map(toUserResponse), total, page, limit },
      };
    });
  }

  @TsRestHandler(usersContract.getById)
  async getById() {
    return tsRestHandler(usersContract.getById, async ({ params, req }) => {
      const lang = req.headers["accept-language"];
      const result = await this.usersService.getById(params.id);
      if (result.isErr()) {
        return { status: HTTP_STATUS.NOT_FOUND, body: { message: this.i18n.t("api.user.notFound", lang) } };
      }
      return { status: HTTP_STATUS.OK, body: toUserResponse(result.value) };
    });
  }

  @TsRestHandler(usersContract.create)
  async create() {
    return tsRestHandler(usersContract.create, async ({ body, req }) => {
      const lang = req.headers["accept-language"];
      const result = await this.usersService.create(body);
      if (result.isErr()) {
        return { status: HTTP_STATUS.CONFLICT, body: { message: this.i18n.t("api.user.emailTaken", lang) } };
      }
      return { status: HTTP_STATUS.CREATED, body: toUserResponse(result.value) };
    });
  }

  @TsRestHandler(usersContract.update)
  async update() {
    return tsRestHandler(usersContract.update, async ({ params, body, req }) => {
      const lang = req.headers["accept-language"];
      const result = await this.usersService.update(params.id, body);
      if (result.isErr()) {
        const status = result.error.type === "USER_NOT_FOUND" ? HTTP_STATUS.NOT_FOUND : HTTP_STATUS.CONFLICT;
        const key = result.error.type === "USER_NOT_FOUND" ? "api.user.notFound" : "api.user.emailTaken";
        return { status, body: { message: this.i18n.t(key, lang) } };
      }
      return { status: HTTP_STATUS.OK, body: toUserResponse(result.value) };
    });
  }

  @TsRestHandler(usersContract.delete)
  async delete() {
    return tsRestHandler(usersContract.delete, async ({ params, req }) => {
      const lang = req.headers["accept-language"];
      const result = await this.usersService.delete(params.id);
      if (result.isErr()) {
        return { status: HTTP_STATUS.NOT_FOUND, body: { message: this.i18n.t("api.user.notFound", lang) } };
      }
      return { status: HTTP_STATUS.NO_CONTENT, body: undefined as unknown as never };
    });
  }
}
