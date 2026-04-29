import type { DomainEvent } from "@events/DomainEvent";

export interface Listener<TEvent extends DomainEvent> {
  handle(event: TEvent): void | Promise<void>;
}
