import { Controller } from "@nestjs/common";
import { tsRestHandler, TsRestHandler } from "@ts-rest/nest";
import { usersContract, UserResponse } from "@repo/shared";
import { UsersService } from "../application/users.service";
import { User } from "../domain/entities/user.entity";

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
  constructor(private readonly usersService: UsersService) {}

  @TsRestHandler(usersContract.list)
  async list() {
    return tsRestHandler(usersContract.list, async ({ query }) => {
      const result = await this.usersService.list(query.page, query.limit);
      if (result.isErr()) {
        return { status: 500 as const, body: { message: "Internal error" } };
      }
      const { users, total, page, limit } = result.value;
      return {
        status: 200 as const,
        body: { users: users.map(toUserResponse), total, page, limit },
      };
    });
  }

  @TsRestHandler(usersContract.getById)
  async getById() {
    return tsRestHandler(usersContract.getById, async ({ params }) => {
      const result = await this.usersService.getById(params.id);
      if (result.isErr()) {
        return { status: 404 as const, body: { message: `User not found: ${params.id}` } };
      }
      return { status: 200 as const, body: toUserResponse(result.value) };
    });
  }

  @TsRestHandler(usersContract.create)
  async create() {
    return tsRestHandler(usersContract.create, async ({ body }) => {
      const result = await this.usersService.create(body);
      if (result.isErr()) {
        return { status: 409 as const, body: { message: "Email already taken" } };
      }
      return { status: 201 as const, body: toUserResponse(result.value) };
    });
  }

  @TsRestHandler(usersContract.update)
  async update() {
    return tsRestHandler(usersContract.update, async ({ params, body }) => {
      const result = await this.usersService.update(params.id, body);
      if (result.isErr()) {
        const status = result.error.type === "USER_NOT_FOUND" ? 404 : 409;
        return { status: status as 404 | 409, body: { message: result.error.type } };
      }
      return { status: 200 as const, body: toUserResponse(result.value) };
    });
  }

  @TsRestHandler(usersContract.delete)
  async delete() {
    return tsRestHandler(usersContract.delete, async ({ params }) => {
      const result = await this.usersService.delete(params.id);
      if (result.isErr()) {
        return { status: 404 as const, body: { message: `User not found: ${params.id}` } };
      }
      return { status: 204 as const, body: undefined as unknown as never };
    });
  }
}
