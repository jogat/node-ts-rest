import type { JobHandler } from "@jobs/JobHandler";
import type { Mailer, MailMessage } from "@mail";

export const SEND_MAIL_JOB = "mail.send";

export type SendMailJobPayload = MailMessage;

export class SendMailJob implements JobHandler<SendMailJobPayload> {
  constructor(private readonly mailer: Mailer) {}

  async handle(payload: SendMailJobPayload): Promise<void> {
    await this.mailer.send(payload);
  }
}
