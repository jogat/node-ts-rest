# Events, Listeners, Notifications, and Queued Listeners

The app has a lightweight event layer for domain side effects. Services emit events after successful workflows, listeners react to those events, and notifications are delivered through configured channels.

The project keeps its local class-based dispatcher instead of using a generic event emitter package. Packages such as `eventemitter2`, `eventemitter3`, and `mitt` are reliable and TypeScript-friendly, but the app needs domain event classes plus optional queue integration through the existing BullMQ job layer.

## Events

Events live in `src/events/` and implement `DomainEvent`.

```ts
export class UserRegistered implements DomainEvent {
  readonly name = "user.registered";
  readonly occurredAt = new Date();

  constructor(readonly user: UserRow) {}
}
```

Current domain events:

- `UserRegistered`
- `UserLoggedIn`
- `PostCreated`
- `PostUpdated`

Emit events from services after the state change succeeds:

```ts
await this.events.dispatch(new PostCreated(post, user));
```

## Listeners

Listeners live in `src/listeners/` and implement a `handle(event)` method. Synchronous listeners are registered in `registerEventListeners`.

```ts
dispatcher.listen(UserRegistered, (event) => listener.handle(event));
```

The dispatcher runs listeners in registration order and awaits each listener before moving to the next one. A thrown error stops later listeners and rejects the dispatch call.

## Queued Listeners

Use queued listeners when the side effect can happen after the request finishes or should use queue retries.

Queued listener registration happens in two places:

1. The event dispatcher registers the event-to-listener mapping.
2. The worker registers the named listener implementation.

HTTP-side dispatch registration:

```ts
dispatcher.listenQueued(UserRegistered, "users.send-welcome-notification", {
  attempts: 3,
});
```

Worker-side listener registration:

```ts
import { EventListenerRegistry } from "@listeners";
import { SendUserRegisteredNotification } from "@listeners/SendUserRegisteredNotification";

const registry = new EventListenerRegistry();
const listener = new SendUserRegisteredNotification(notifier);

registry.register("users.send-welcome-notification", (event) => listener.handle(event));
```

Queued listeners are dispatched as the `event.listener` job. The payload includes:

- `eventName`
- `listenerName`
- `event`

The event payload is serialized through the queue. Keep queued events plain-data friendly: rows, IDs, strings, numbers, booleans, arrays, and plain objects are safe. Do not put methods, open connections, request objects, streams, or other process-local objects on events that may be queued.

If a queued listener name is not registered in the worker, the `event.listener` job fails and uses the queue retry/failure behavior documented in `docs/queues-jobs-mail.md`.

## Adding New Events Safely

Add a new event class under `src/events/`:

```ts
export class ExampleCreated implements DomainEvent {
  readonly name = "example.created";
  readonly occurredAt = new Date();

  constructor(readonly exampleId: number) {}
}
```

Export it from `src/events/index.ts`, emit it after the state change succeeds, then register listeners without changing the emitter.

For synchronous work:

```ts
dispatcher.listen(ExampleCreated, (event) => listener.handle(event));
```

For queued work:

```ts
dispatcher.listenQueued(ExampleCreated, "examples.handle-created");
```

Register queued listener implementations in `registerQueuedEventListeners` so worker processes can resolve the listener name.

## Notifications

Notifications live in `src/notifications/` and implement `Notification`.

```ts
export class UserRegisteredNotification implements Notification<UserRow> {
  readonly type = "user.registered";

  toMessage(user: UserRow) {
    return {
      subject: "Welcome to Portfolio2025",
      body: `Welcome, ${user.name}. Your account is ready.`,
    };
  }
}
```

`Notifier` sends notifications through configured channels. The first channel is `InMemoryNotificationChannel`, which records deliveries in process memory. This is useful for local delivery and tests, but it is not durable and should not be treated as a user notification inbox.

## Current Boundary

This milestone does not add a notifications table, notification read/unread state, event discovery, wildcard listeners, listener priorities, or user-facing notification endpoints. Those belong in future persistence-backed and framework-polish milestones.
