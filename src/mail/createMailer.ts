import { config } from "@config/index";
import { FakeMailer } from "@mail/FakeMailer";
import type { Mailer } from "@mail/Mailer";
import { NodemailerMailer } from "@mail/NodemailerMailer";

export function createMailer(): Mailer {
  if (config.app.environment === "test") {
    return new FakeMailer();
  }

  return NodemailerMailer.fromConfig(config.mail);
}
