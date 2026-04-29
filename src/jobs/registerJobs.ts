import { JobRegistry } from "@jobs/JobRegistry";
import { QUEUED_EVENT_LISTENER_JOB, QueuedEventListenerJob } from "@jobs/QueuedEventListenerJob";
import { SEND_MAIL_JOB, SendMailJob } from "@jobs/SendMailJob";
import type { EventListenerRegistry } from "@listeners/EventListenerRegistry";
import type { Mailer } from "@mail";

export function registerJobs(mailer: Mailer, eventListeners?: EventListenerRegistry): JobRegistry {
  const registry = new JobRegistry();

  registry.register(SEND_MAIL_JOB, new SendMailJob(mailer));
  if (eventListeners) {
    registry.register(QUEUED_EVENT_LISTENER_JOB, new QueuedEventListenerJob(eventListeners));
  }

  return registry;
}
