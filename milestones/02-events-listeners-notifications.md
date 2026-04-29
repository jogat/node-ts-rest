# Events, Listeners, and Notifications

## Goal

Introduce an event-driven layer for internal domain changes and user-facing notifications.

## Why This Matters

Laravel apps often keep controllers thin by moving follow-up work into events and listeners. This makes side effects easier to isolate and later expand into mail, queue, or audit flows.

## Scope

- Create an `src/events/` area.
- Create an `src/listeners/` area.
- Add event dispatch helpers.
- Add listener registration and execution.
- Add a notification abstraction for user-facing messages.

## Good First Use Cases

- user registered
- user logged in
- post created
- post updated
- password changed

## Done When

- Domain changes can emit events without coupling controllers to side effects.
- Listeners can run synchronously first and later move to queued execution.
- Notifications can be delivered through at least one channel.
- The event contract is documented and easy to extend.

