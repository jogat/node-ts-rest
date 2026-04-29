# Scheduled Commands

## Goal

Add a scheduler for recurring framework and application tasks.

## Why This Matters

Laravel-style applications usually need cron-backed automation for maintenance, reminders, cleanup, and sync tasks.

## Scope

- Add a schedule definition layer.
- Support recurring command registration.
- Provide a single scheduler entrypoint for cron or systemd timers.
- Document how to run scheduled tasks in development and production.

## Done When

- Console commands can be scheduled without manual scripting.
- The scheduler can be invoked from a single runtime entrypoint.
- Documentation covers the production execution model.
