import { EventListenerRegistry } from "@listeners/EventListenerRegistry";

export function registerQueuedEventListeners(): EventListenerRegistry {
  return new EventListenerRegistry();
}
