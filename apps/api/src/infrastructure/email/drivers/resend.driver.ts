import { ok, err, Result } from "neverthrow";
import { Resend } from "resend";
import { EmailDriver, EmailError, SendEmailParams, SendEmailResult } from "../email.service";
import { env } from "../../../config/env";
import { PinoLoggerService } from "../../logger/logger.service";

export class ResendDriver implements EmailDriver {
  private client: Resend;
  private logger: PinoLoggerService;

  constructor(logger: PinoLoggerService) {
    this.client = new Resend(env.RESEND_API_KEY);
    this.logger = logger.child({ module: "ResendDriver" });
  }

  async send(recipients: string[], params: SendEmailParams): Promise<Result<SendEmailResult, EmailError>> {
    try {
      const response = await this.client.emails.send({
        from: env.EMAIL_FROM,
        to: recipients,
        subject: params.subject,
        html: params.html,
        text: params.text,
      });

      if (response.error) {
        this.logger.error({ error: response.error }, "Resend send failed");
        return err({
          code: "SEND_FAILED",
          message: response.error.message ?? "Resend send failed",
        });
      }

      this.logger.info({ id: response.data?.id, to: recipients }, "Email sent via Resend");
      return ok({
        id: response.data?.id ?? "",
        provider: "resend",
      });
    } catch (error) {
      this.logger.error({ error }, "Resend send failed");
      return err({
        code: "SEND_FAILED",
        message: error instanceof Error ? error.message : "Resend send failed",
      });
    }
  }
}
