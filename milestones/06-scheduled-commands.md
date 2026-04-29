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

- [x] Console commands can be scheduled without manual scripting.
- [x] The scheduler can be invoked from a single runtime entrypoint.
- [x] Documentation covers the production execution model.

## Completed

- Added a `Schedule` builder with Laravel-like frequency helpers.
- Added command, callback, and queued job task types.
- Added a `node-cron` runtime adapter behind `NodeCronScheduler`.
- Added `src/scheduler.ts` plus `npm run schedule:work` and `npm run schedule:work:dist`.
- Registered a safe default example: `schedule.command("db status").dailyAt("03:00")`.
- Documented local and production scheduler usage in `docs/scheduled-commands.md`.

## Pending Future Work

- One-shot `schedule:run`.
- Distributed locks and `onOneServer`.
- Overlap prevention.
- Persisted run history.
- Scheduler metrics and alerting.
- Richer Laravel-style hooks such as `before`, `after`, and failure callbacks.
