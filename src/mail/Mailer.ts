import type { MailMessage, MailResult } from "@mail/MailMessage";

export interface Mailer {
  send(message: MailMessage): Promise<MailResult>;
}
