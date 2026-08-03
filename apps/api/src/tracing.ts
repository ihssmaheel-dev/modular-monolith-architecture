import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { ConsoleSpanExporter, BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";

// Load basic env vars manually if needed here since it's loaded before anything else
const isProd = process.env.NODE_ENV === "production";

// For local dev, print to console. For prod, send to OTLP collector.
const traceExporter = isProd
  ? new OTLPTraceExporter({
      url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "http://localhost:4318/v1/traces",
    })
  : new ConsoleSpanExporter();

export const otelSDK = new NodeSDK({
  spanProcessor: new BatchSpanProcessor(traceExporter),
  instrumentations: [
    getNodeAutoInstrumentations({
      // Disable fs auto-instrumentation as it can be very noisy
      "@opentelemetry/instrumentation-fs": { enabled: false },
      "@opentelemetry/instrumentation-net": { enabled: false },
    }),
  ],
});

// Initialize the SDK and register with the global tracer
otelSDK.start();

// Handle graceful shutdown for the SDK
process.on("SIGTERM", () => {
  otelSDK
    .shutdown()
    .then(() => console.log("Tracing terminated"))
    .catch((error) => console.log("Error terminating tracing", error));
});
