import type { Mailer } from "@mail/Mailer";
import type { MailMessage, MailResult } from "@mail/MailMessage";

export class FakeMailer implements Mailer {
  private messages: MailMessage[] = [];

  async send(message: MailMessage): Promise<MailResult> {
    this.messages.push(message);

    return {
      messageId: `fake-${this.messages.length}`,
    };
  }

  all(): MailMessage[] {
    return [...this.messages];
  }

  clear(): void {
    this.messages = [];
  }
}
