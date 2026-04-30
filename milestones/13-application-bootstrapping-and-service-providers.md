# Application Bootstrapping and Service Providers

## Goal

Add a Laravel-like bootstrapping layer for application service registration, startup hooks, and package-style extension points.

## Why This Matters

The codebase already has a service container, but Laravel goes further with providers and a clearer boot lifecycle. That becomes useful once more modules need consistent startup wiring.

## Scope

- Add a provider registration pattern for application modules.
- Add a boot phase separate from service construction.
- Move startup wiring out of route files where it becomes too broad.
- Add application-level extension points for listeners, commands, caches, and other module registration.

## Done When

- Services and modules can register themselves through a consistent bootstrap path.
- Startup wiring is easier to reason about than ad hoc imports.
- The app remains explicit and testable during boot.
- Existing route and console setup still work without brittle side effects.

## Pending Future Work

- Add package-style discovery only if the application grows beyond a single repo.
- Add deferred providers only if startup cost becomes measurable.
- Add environment-specific provider sets only if deployment needs them.
- Add boot-time diagnostics if module registration becomes hard to debug.
