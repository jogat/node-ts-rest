import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import type { MailConfig } from "@config/mail";
import type { Mailer } from "@mail/Mailer";
import type { MailMessage, MailResult } from "@mail/MailMessage";

type Transporter = {
  sendMail(message: Record<string, unknown>): Promise<SMTPTransport.SentMessageInfo>;
};

export class NodemailerMailer implements Mailer {
  constructor(
    private readonly transporter: Transporter,
    private readonly defaultFrom: string
  ) {}

  static fromConfig(config: MailConfig): NodemailerMailer {
    const transporter = config.host
      ? nodemailer.createTransport({
          host: config.host,
          port: config.port,
          secure: config.secure,
          auth: config.username && config.password
            ? {
                user: config.username,
                pass: config.password,
              }
            : undefined,
        })
      : nodemailer.createTransport({
          jsonTransport: true,
        });

    return new NodemailerMailer(transporter, config.from);
  }

  async send(message: MailMessage): Promise<MailResult> {
    const result = await this.transporter.sendMail({
      from: message.from ?? this.defaultFrom,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });

    return {
      messageId: result.messageId,
      previewUrl: nodemailer.getTestMessageUrl(result),
    };
  }
}
