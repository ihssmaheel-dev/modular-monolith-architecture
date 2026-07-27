import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UsersController } from "./presentation/users.controller";
import { UsersService } from "./application/users.service";
import { UsersRepository } from "./infrastructure/users.repository";
import { UserMongooseSchema, UserSchema } from "./infrastructure/schemas/user.mongoose.schema";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { WelcomeEmailListener } from "./application/welcome-email.listener";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserMongooseSchema.name, schema: UserSchema }]),
    EventEmitterModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, WelcomeEmailListener],
  exports: [UsersService],
})
export class UsersModule {}
