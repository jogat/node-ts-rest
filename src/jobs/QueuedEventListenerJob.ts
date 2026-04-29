import type { DomainEvent } from "@events";
import type { JobHandler } from "@jobs/JobHandler";
import type { EventListenerRegistry } from "@listeners/EventListenerRegistry";

export const QUEUED_EVENT_LISTENER_JOB = "event.listener";

export type QueuedEventListenerJobPayload<TEvent extends DomainEvent = DomainEvent> = {
  eventName: string;
  listenerName: string;
  event: TEvent;
};

export class QueuedEventListenerJob implements JobHandler<QueuedEventListenerJobPayload> {
  constructor(private readonly listeners: EventListenerRegistry) {}

  async handle(payload: QueuedEventListenerJobPayload): Promise<void> {
    await this.listeners.handle(payload.listenerName, payload.event);
  }
}
