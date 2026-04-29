import type { DomainEvent } from "@events/DomainEvent";
import { QUEUED_EVENT_LISTENER_JOB } from "@jobs/QueuedEventListenerJob";
import type { JobDispatchOptions, QueueDispatcher } from "@queue";

export type EventConstructor<TEvent extends DomainEvent = DomainEvent> = new (...args: any[]) => TEvent;
export type EventListener<TEvent extends DomainEvent = DomainEvent> = (event: TEvent) => void | Promise<void>;

type RegisteredListener<TEvent extends DomainEvent = DomainEvent> =
  | {
      mode: "sync";
      listener: EventListener<TEvent>;
    }
  | {
      mode: "queued";
      listenerName: string;
      options?: JobDispatchOptions;
    };

export class EventDispatcher {
  private listeners = new Map<EventConstructor, RegisteredListener[]>();

  constructor(private readonly queue?: QueueDispatcher) {}

  listen<TEvent extends DomainEvent>(eventClass: EventConstructor<TEvent>, listener: EventListener<TEvent>): void {
    const listeners = this.listeners.get(eventClass) ?? [];

    listeners.push({
      mode: "sync",
      listener: listener as EventListener,
    });
    this.listeners.set(eventClass, listeners);
  }

  listenQueued<TEvent extends DomainEvent>(
    eventClass: EventConstructor<TEvent>,
    listenerName: string,
    options?: JobDispatchOptions
  ): void {
    const listeners = this.listeners.get(eventClass) ?? [];

    listeners.push({
      mode: "queued",
      listenerName,
      options,
    });
    this.listeners.set(eventClass, listeners);
  }

  async dispatch<TEvent extends DomainEvent>(event: TEvent): Promise<void> {
    const listeners = this.listeners.get(event.constructor as EventConstructor<TEvent>) ?? [];

    for (const registration of listeners) {
      if (registration.mode === "queued") {
        if (!this.queue) {
          throw new Error(`Cannot queue listener "${registration.listenerName}" without a queue dispatcher.`);
        }

        await this.queue.dispatch(
          QUEUED_EVENT_LISTENER_JOB,
          {
            eventName: event.name,
            listenerName: registration.listenerName,
            event,
          },
          registration.options
        );
        continue;
      }

      await registration.listener(event);
    }
  }
}
