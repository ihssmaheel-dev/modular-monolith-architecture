import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { ConsoleSpanExporter, BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { env } from "./config/env";

const traceExporter = env.NODE_ENV === "production"
  ? new OTLPTraceExporter({
      url: env.OTEL_EXPORTER_OTLP_ENDPOINT,
    })
  : new ConsoleSpanExporter();

export const otelSDK = new NodeSDK({
  spanProcessor: new BatchSpanProcessor(traceExporter),
  instrumentations: [
    getNodeAutoInstrumentations({
      "@opentelemetry/instrumentation-fs": { enabled: false },
      "@opentelemetry/instrumentation-net": { enabled: false },
    }),
  ],
});

otelSDK.start();

process.on("SIGTERM", () => {
  otelSDK
    .shutdown()
    .then(() => console.log("Tracing terminated"))
    .catch((error) => console.log("Error terminating tracing", error));
});
