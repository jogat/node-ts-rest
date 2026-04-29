# Scheduled Commands

The scheduler uses `node-cron` internally and exposes a Laravel-like schedule builder for application code. Prefer readable frequency helpers for normal schedules, and keep raw cron strings for uncommon cases.

## Defining Schedules

Schedules live in `src/schedule/defineSchedule.ts`:

```ts
import type { Schedule } from "@schedule";

export function defineSchedule(schedule: Schedule): void {
  schedule.command("db status").dailyAt("03:00");
}
```

The default schedule registers a safe database status command at 03:00.

## Frequency Helpers

Use helper methods instead of raw cron strings when possible:

```ts
schedule.command("db status").daily();
schedule.command("db status").dailyAt("03:00");
schedule.command("db status").hourly();
schedule.command("db status").hourlyAt(15);
schedule.command("db status").everyFiveMinutes();
schedule.command("db status").weeklyOn(1, "04:00");
schedule.command("db status").monthlyOn(1, "02:30");
schedule.command("db status").weekdays();
schedule.command("db status").weekends();
schedule.command("db status").dailyAt("03:00").timezone("America/Chicago");
```

Available helpers:

- `everyMinute`
- `everyTwoMinutes`
- `everyFiveMinutes`
- `everyTenMinutes`
- `everyFifteenMinutes`
- `everyThirtyMinutes`
- `hourly`
- `hourlyAt`
- `daily`
- `dailyAt`
- `weekly`
- `weeklyOn`
- `monthly`
- `monthlyOn`
- `weekdays`
- `weekends`
- `timezone`

## Command Scheduling

Command schedules run through the same Artisan entrypoint as local console commands:

```ts
schedule.command("db status").dailyAt("03:00");
```

Command strings are split into Artisan argv values, so `db status` runs as `artisan db status`.

## Queued Job Scheduling

Scheduled jobs enqueue work through the existing queue dispatcher. They do not execute job handlers inline:

```ts
schedule.job("mail.send", {
  to: "user@example.com",
  subject: "Welcome",
  text: "Thanks for signing up.",
}).everyFiveMinutes();
```

Run a queue worker separately with `npm run queue:work` or `npm run queue:work:dist` so queued jobs can be processed.

## Callback Scheduling

Callbacks are useful for local framework tasks that do not need a queue job:

```ts
schedule.call("cleanup-temp-files", async () => {
  // cleanup work
}).dailyAt("02:00");
```

## Running Locally

Start the TypeScript scheduler:

```bash
npm run schedule:work
```

Run the compiled scheduler after `npm run build`:

```bash
npm run schedule:work:dist
```

The scheduler stops registered cron tasks and closes the queue dispatcher on `SIGINT` or `SIGTERM`.

## Production Guidance

Run one long-lived scheduler process per environment. Until distributed locks and `onOneServer` support exist, running multiple scheduler processes can enqueue or execute the same task multiple times.

Use your process manager or container platform to keep the scheduler alive, separate from web and queue worker processes.

## Raw Cron Escape Hatch

Use `.cron(...)` only for advanced schedules that are not covered by helpers:

```ts
schedule.command("db status").cron("5 3 * * 1,3");
```

## Future Work

Pending scheduler enhancements include one-shot `schedule:run`, distributed locks, overlap prevention, persisted run history, metrics and alerting, and richer hooks such as `before`, `after`, and failure callbacks.
