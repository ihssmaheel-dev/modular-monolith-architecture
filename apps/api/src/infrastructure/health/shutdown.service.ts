import { Injectable, BeforeApplicationShutdown } from "@nestjs/common";
import { PinoLoggerService } from "../logger/logger.service";
import { env } from "../../config/env";

@Injectable()
export class ShutdownService implements BeforeApplicationShutdown {
  constructor(private readonly logger: PinoLoggerService) {}

  async beforeApplicationShutdown(signal?: string) {
    this.logger.info({ signal }, "Received shutdown signal. Commencing graceful teardown...");
    
    if (env.NODE_ENV === "production") {
      this.logger.info({}, "Pausing for 5 seconds to allow load balancer to drain HTTP traffic...");
      await new Promise((resolve) => setTimeout(resolve, 5000));
    } else {
      this.logger.info({}, "Skipping HTTP drain pause in non-production environment.");
    }
  }
}
