import { Module, Global } from "@nestjs/common";
import { PiscinaService } from "./piscina.service";
import { WorkerHealthService } from "./worker-health.service";

@Global()
@Module({
  providers: [PiscinaService, WorkerHealthService],
  exports: [PiscinaService, WorkerHealthService],
})
export class WorkersModule {}
