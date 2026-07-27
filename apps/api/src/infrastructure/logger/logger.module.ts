import { Module, Global } from "@nestjs/common";
import { PinoLoggerService } from "./logger.service";

@Global()
@Module({
  providers: [PinoLoggerService],
  exports: [PinoLoggerService],
})
export class LoggerModule {}
