import { Controller, Get } from "@nestjs/common";
import { HealthCheck } from "@nestjs/terminus";
import { AppHealthService } from "./health.service";
import { Public } from "../../common";

@Controller("health")
@Public()
export class HealthController {
  constructor(private readonly healthService: AppHealthService) {}

  @Get()
  @HealthCheck()
  health() {
    return this.healthService.check();
  }

  @Get("ready")
  @HealthCheck()
  readiness() {
    return this.healthService.checkReadiness();
  }

  @Get("live")
  liveness() {
    return { status: "ok" };
  }
}
