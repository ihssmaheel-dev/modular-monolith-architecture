import { Injectable } from "@nestjs/common";
import { Resend } from "resend";
import nodemailer from "nodemailer";
import { Result } from "neverthrow";
import { env } from "../../config/env";
import { PinoLoggerService } from "../logger/logger.service";

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

@Injectable()
export class EmailService {
  private resendClient: Resend | null = null;
  private smtpTransporter: nodemailer.Transporter | null = null;
  private logger: PinoLoggerService;

  constructor(logger: PinoLoggerService) {
    this.logger = logger.child({ module: "EmailService" });
    this.init();
  }

  private init(): void {
    if (env.EMAIL_DRIVER === "resend" && env.RESEND_API_KEY) {
      this.resendClient = new Resend(env.RESEND_API_KEY);
      this.logger.info({}, "Email: Resend driver initialized");
    } else {
      this.smtpTransporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        auth: env.SMTP_USER
          ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
          : undefined,
      });
      this.logger.info({ host: env.SMTP_HOST, port: env.SMTP_PORT }, "Email: SMTP driver initialized");
    }
  }

  async send(params: SendEmailParams): Promise<Result<SendEmailResult, EmailError>> {
    const recipients = Array.isArray(params.to) ? params.to : [params.to];

    if (recipients.length === 0) {
      return Result.err({ code: "INVALID_ADDRESS", message: "No recipients provided" });
    }

    if (env.EMAIL_DRIVER === "resend" && this.resendClient) {
      return this.sendViaResend(recipients, params);
    }

    if (this.smtpTransporter) {
      return this.sendViaSmtp(recipients, params);
    }

    return Result.err({ code: "CONFIG_ERROR", message: "No email driver configured" });
  }

  private async sendViaResend(
    recipients: string[],
    params: SendEmailParams,
  ): Promise<Result<SendEmailResult, EmailError>> {
    try {
      const response = await this.resendClient!.emails.send({
        from: env.EMAIL_FROM,
        to: recipients,
        subject: params.subject,
        html: params.html,
        text: params.text,
      });

      if (response.error) {
        this.logger.error({ error: response.error }, "Resend send failed");
        return Result.err({
          code: "SEND_FAILED",
          message: response.error.message ?? "Resend send failed",
        });
      }

      this.logger.info({ id: response.data?.id, to: recipients }, "Email sent via Resend");
      return Result.ok({
        id: response.data?.id ?? "",
        provider: "resend",
      });
    } catch (error) {
      this.logger.error({ error }, "Resend send failed");
      return Result.err({
        code: "SEND_FAILED",
        message: error instanceof Error ? error.message : "Resend send failed",
      });
    }
  }

  private async sendViaSmtp(
    recipients: string[],
    params: SendEmailParams,
  ): Promise<Result<SendEmailResult, EmailError>> {
    try {
      const info = await this.smtpTransporter!.sendMail({
        from: env.EMAIL_FROM,
        to: recipients.join(", "),
        subject: params.subject,
        html: params.html,
        text: params.text,
      });

      this.logger.info({ messageId: info.messageId, to: recipients }, "Email sent via SMTP");
      return Result.ok({
        id: info.messageId,
        provider: "smtp",
      });
    } catch (error) {
      this.logger.error({ error }, "SMTP send failed");
      return Result.err({
        code: "SEND_FAILED",
        message: error instanceof Error ? error.message : "SMTP send failed",
      });
    }
  }
}
