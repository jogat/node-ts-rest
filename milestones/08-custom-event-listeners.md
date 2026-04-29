# Custom Event Listeners

## Goal

Add application events and custom listeners for framework and domain reactions.

## Why This Matters

Listeners let the application react to changes without hard-coding side effects into controllers or services.

## Scope

- Add event classes for important application actions.
- Add listener registration and dispatch flow.
- Support both synchronous and queued listeners when needed.
- Document how to add new listeners safely.

## Done When

- Events can be emitted from services or controllers.
- Listeners can be added without changing the emitter.
- The event system is documented and predictable.
