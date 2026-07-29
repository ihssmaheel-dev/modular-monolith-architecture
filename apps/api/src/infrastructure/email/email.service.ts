import { Injectable } from "@nestjs/common";
import { Result } from "neverthrow";
import { env } from "../../config/env";
import { PinoLoggerService } from "../logger/logger.service";
import { ResendDriver } from "./drivers/resend.driver";
import { SmtpDriver } from "./drivers/smtp.driver";

export interface EmailError {
  code: "SEND_FAILED" | "INVALID_ADDRESS" | "CONFIG_ERROR";
  message: string;
}

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export interface SendEmailResult {
  id: string;
  provider: "resend" | "smtp";
}

export interface EmailDriver {
  send(recipients: string[], params: SendEmailParams): Promise<Result<SendEmailResult, EmailError>>;
}

@Injectable()
export class EmailService {
  private driver: EmailDriver | null = null;
  private logger: PinoLoggerService;

  constructor(logger: PinoLoggerService) {
    this.logger = logger.child({ module: "EmailService" });
    this.init();
  }

  private init(): void {
    if (env.EMAIL_DRIVER === "resend" && env.RESEND_API_KEY) {
      this.driver = new ResendDriver(this.logger);
      this.logger.info({}, "Email: Resend driver initialized");
    } else {
      this.driver = new SmtpDriver(this.logger);
      this.logger.info({ host: env.SMTP_HOST, port: env.SMTP_PORT }, "Email: SMTP driver initialized");
    }
  }

  async send(params: SendEmailParams): Promise<Result<SendEmailResult, EmailError>> {
    const recipients = Array.isArray(params.to) ? params.to : [params.to];

    if (recipients.length === 0) {
      return Result.err({ code: "INVALID_ADDRESS", message: "No recipients provided" });
    }

    if (this.driver) {
      return this.driver.send(recipients, params);
    }

    return Result.err({ code: "CONFIG_ERROR", message: "No email driver configured" });
  }
}
