import { ok, err, Result } from "neverthrow";
import nodemailer from "nodemailer";
import { EmailDriver, EmailError, SendEmailParams, SendEmailResult } from "../email.service";
import { env } from "../../../config/env";
import { PinoLoggerService } from "../../logger/logger.service";

export class SmtpDriver implements EmailDriver {
  private transporter: nodemailer.Transporter;
  private logger: PinoLoggerService;

  constructor(logger: PinoLoggerService) {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      auth: env.SMTP_USER
        ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
        : undefined,
    });
    this.logger = logger.child({ module: "SmtpDriver" });
  }

  async send(recipients: string[], params: SendEmailParams): Promise<Result<SendEmailResult, EmailError>> {
    try {
      const info = await this.transporter.sendMail({
        from: env.EMAIL_FROM,
        to: recipients.join(", "),
        subject: params.subject,
        html: params.html,
        text: params.text,
      });

      this.logger.info({ messageId: info.messageId, to: recipients }, "Email sent via SMTP");
      return ok({
        id: info.messageId,
        provider: "smtp",
      });
    } catch (error) {
      this.logger.error({ error }, "SMTP send failed");
      return err({
        code: "SEND_FAILED",
        message: error instanceof Error ? error.message : "SMTP send failed",
      });
    }
  }
}
