export interface ErrorReportContext {
  requestId: string;
  method: string;
  path: string;
  userId?: string;
  tenantId?: string;
  traceId?: string;
}

export interface ErrorReport {
  schemaVersion: 1;
  service: "api";
  environment: string;
  timestamp: string;
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  context: ErrorReportContext;
}

export interface ErrorReporter {
  capture(exception: unknown, context: ErrorReportContext): Promise<void>;
}
