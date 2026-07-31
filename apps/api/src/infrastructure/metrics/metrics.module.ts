import { Module, Global } from "@nestjs/common";
import { PrometheusModule } from "@willsoto/nestjs-prometheus";
import { MetricsService } from "./metrics.service";

@Global()
@Module({
  imports: [
    PrometheusModule.register({
      path: "/metrics",
      defaultMetrics: {
        enabled: true,
      },
    }),
  ],
  providers: [MetricsService],
  exports: [MetricsService, PrometheusModule],
})
export class MetricsModule {}
