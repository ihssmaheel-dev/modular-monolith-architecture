import { Module, Global } from "@nestjs/common";
import { PiscinaService } from "./piscina.service";

@Global()
@Module({
  providers: [PiscinaService],
  exports: [PiscinaService],
})
export class WorkersModule {}
