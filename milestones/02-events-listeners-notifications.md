# Events, Listeners, and Notifications

## Goal

Introduce an event-driven layer for internal domain changes and user-facing notifications.

## Why This Matters

Laravel apps often keep controllers thin by moving follow-up work into events and listeners. This makes side effects easier to isolate and later expand into mail, queue, or audit flows.

## Scope

- Create an `src/events/` area. Done.
- Create an `src/listeners/` area. Done.
- Add event dispatch helpers. Done.
- Add listener registration and execution. Done.
- Add a notification abstraction for user-facing messages. Done.
- Add a first local notification channel. Done with `InMemoryNotificationChannel`.

## Good First Use Cases

- user registered
- user logged in
- post created
- post updated
- password changed. Pending until a password change workflow exists.

## Current Implementation

- `EventDispatcher` registers listeners by event class and executes them synchronously in registration order.
- `AuthService` emits `UserRegistered` and `UserLoggedIn`.
- `PostService` emits `PostCreated` and `PostUpdated`.
- `registerEventListeners` wires the first notification listeners.
- `Notifier` sends notification objects through configured channels.
- `InMemoryNotificationChannel` provides the first concrete delivery path without adding persistence.

## Pending Work

- Add a database-backed notifications table for durable user notification storage.
- Add notification read/unread state and user-facing API endpoints.
- Add queued listeners, retries, and failure handling.
- Add mail or external delivery channels.
- Add events for password changes once that workflow exists.

## Done When

- Domain changes can emit events without coupling controllers to side effects.
- Listeners can run synchronously first and later move to queued execution.
- Notifications can be delivered through at least one channel.
- The event contract is documented and easy to extend.
