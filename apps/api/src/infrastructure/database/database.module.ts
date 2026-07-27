import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { env } from "../../config/env";

@Module({
  imports: [MongooseModule.forRoot(env.MONGODB_URI)],
})
export class DatabaseModule {}
