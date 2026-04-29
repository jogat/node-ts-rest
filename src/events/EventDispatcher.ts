import type { DomainEvent } from "@events/DomainEvent";

export type EventConstructor<TEvent extends DomainEvent = DomainEvent> = new (...args: any[]) => TEvent;
export type EventListener<TEvent extends DomainEvent = DomainEvent> = (event: TEvent) => void | Promise<void>;

export class EventDispatcher {
  private listeners = new Map<EventConstructor, EventListener[]>();

  listen<TEvent extends DomainEvent>(eventClass: EventConstructor<TEvent>, listener: EventListener<TEvent>): void {
    const listeners = this.listeners.get(eventClass) ?? [];

    listeners.push(listener as EventListener);
    this.listeners.set(eventClass, listeners);
  }

  async dispatch<TEvent extends DomainEvent>(event: TEvent): Promise<void> {
    const listeners = this.listeners.get(event.constructor as EventConstructor<TEvent>) ?? [];

    for (const listener of listeners) {
      await listener(event);
    }
  }
}
