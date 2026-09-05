import { Global, Module } from "@nestjs/common";
import { ErrorReporterService } from "./error-reporter.service";

@Global()
@Module({
  providers: [ErrorReporterService],
  exports: [ErrorReporterService],
})
export class ErrorReportingModule {}
