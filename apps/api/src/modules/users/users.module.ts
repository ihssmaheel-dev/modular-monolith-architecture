import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UsersController } from "./presentation/users.controller";
import { GetUsersQuery } from "./application/queries/get-users.query";
import { GetUserByIdQuery } from "./application/queries/get-user-by-id.query";
import { GetUserByEmailQuery } from "./application/queries/get-user-by-email.query";
import { VerifyUserCredentialsQuery } from "./application/queries/verify-user-credentials.query";
import { CreateUserCommand } from "./application/commands/create-user.command";
import { UpdateUserCommand } from "./application/commands/update-user.command";
import { DeleteUserCommand } from "./application/commands/delete-user.command";
import { UsersRepository } from "./infrastructure/users.repository";
import { UserMongooseSchema, UserSchema } from "./infrastructure/schemas/user.mongoose.schema";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { WelcomeEmailListener } from "./application/listeners/welcome-email.listener";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserMongooseSchema.name, schema: UserSchema }]),
    EventEmitterModule,
  ],
  controllers: [UsersController],
  providers: [
    GetUsersQuery,
    GetUserByIdQuery,
    GetUserByEmailQuery,
    VerifyUserCredentialsQuery,
    CreateUserCommand,
    UpdateUserCommand,
    DeleteUserCommand,
    UsersRepository,
    WelcomeEmailListener,
  ],
  exports: [
    GetUsersQuery,
    GetUserByIdQuery,
    GetUserByEmailQuery,
    VerifyUserCredentialsQuery,
    CreateUserCommand,
    UpdateUserCommand,
    DeleteUserCommand,
    UsersRepository,
  ],
})
export class UsersModule {}
