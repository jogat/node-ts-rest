import type { DomainEvent } from "@events";
import type { EventListener } from "@events/EventDispatcher";

export class EventListenerRegistry {
  private listeners = new Map<string, EventListener>();

  register<TEvent extends DomainEvent>(listenerName: string, listener: EventListener<TEvent>): void {
    this.listeners.set(listenerName, listener as EventListener);
  }

  async handle<TEvent extends DomainEvent>(listenerName: string, event: TEvent): Promise<void> {
    const listener = this.listeners.get(listenerName);

    if (!listener) {
      throw new Error(`Queued event listener "${listenerName}" is not registered.`);
    }

    await listener(event);
  }

  names(): string[] {
    return [...this.listeners.keys()];
  }
}
