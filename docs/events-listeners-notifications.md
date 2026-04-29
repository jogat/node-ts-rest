# Events, Listeners, and Notifications

The app has a lightweight synchronous event layer for domain side effects. Services emit events after successful workflows, listeners react to those events, and notifications are delivered through configured channels.

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

Listeners live in `src/listeners/` and implement a `handle(event)` method. They are registered in `registerEventListeners`.

```ts
dispatcher.listen(UserRegistered, (event) => listener.handle(event));
```

The dispatcher runs listeners in registration order and awaits each listener before moving to the next one. There is no queue or retry layer yet.

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

This milestone does not add a notifications table, notification read/unread state, retry handling, queued listeners, email delivery, or user-facing notification endpoints. Those belong in future persistence-backed and queue-backed milestones.
