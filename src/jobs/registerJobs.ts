import { JobRegistry } from "@jobs/JobRegistry";
import { SEND_MAIL_JOB, SendMailJob } from "@jobs/SendMailJob";
import type { Mailer } from "@mail";

export function registerJobs(mailer: Mailer): JobRegistry {
  const registry = new JobRegistry();

  registry.register(SEND_MAIL_JOB, new SendMailJob(mailer));

  return registry;
}
