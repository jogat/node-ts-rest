# Custom Event Listeners

## Goal

Add application events and custom listeners for framework and domain reactions.

## Why This Matters

Listeners let the application react to changes without hard-coding side effects into controllers or services.

## Scope

- [x] Add event classes for important application actions.
- [x] Add listener registration and dispatch flow.
- [x] Support both synchronous and queued listeners when needed.
- [x] Document how to add new listeners safely.

## Done When

- [x] Events can be emitted from services or controllers.
- [x] Listeners can be added without changing the emitter.
- [x] The event system is documented and predictable.

## Implementation

- Kept the local class-based dispatcher after checking current TypeScript-friendly event packages. Generic packages such as `eventemitter2`, `eventemitter3`, and `mitt` are solid, but they do not replace the app-specific need for domain event classes and queued listener dispatch through the existing queue layer.
- Added synchronous listener registration through `dispatcher.listen(EventClass, listener)`.
- Added queued listener registration through `dispatcher.listenQueued(EventClass, listenerName, options)`.
- Added the generic `event.listener` job for queued listener execution.
- Added an `EventListenerRegistry` so worker processes can resolve named queued listeners.
- Wired the HTTP event dispatcher to the existing queue dispatcher so queued listeners can be enqueued from application workflows.
- Documented safe event and listener patterns in `docs/events-listeners-notifications.md`.

## Pending Future Work

- Add concrete queued listener registrations once a side effect needs to move fully out of the request path.
- Add event payload serializers/hydrators for events that should rehydrate model instances or convert date strings back into `Date` objects.
- Add listener discovery or a centralized manifest to reduce manual registration as the listener count grows.
- Add listener priorities if ordering needs become more expressive than registration order.
- Add wildcard or pattern listeners only if a real cross-cutting use case appears.
- Add event fakes/assertions for tests, similar to Laravel's event testing helpers.
- Add structured listener logging with duration, mode, event name, listener name, and errors.
- Add dead-letter inspection and replay commands for failed queued listener jobs.
