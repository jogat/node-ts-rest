# Queues, Jobs, Mail, and Workers

The app uses BullMQ for Redis-backed background jobs and Nodemailer for mail delivery. Application code dispatches jobs through a small `QueueDispatcher` interface so tests can use fakes without Redis or SMTP.

BullMQ remains the queue worker package for this codebase. It is TypeScript-friendly, already installed, and supports the worker behavior this app needs: async processors, concurrency, retries, failure events, and graceful shutdown.

## Configuration

Queue configuration is read from environment variables:

- `QUEUE_NAME`, default `default`
- `REDIS_HOST`, default `127.0.0.1`
- `REDIS_PORT`, default `6379`
- `REDIS_PASSWORD`, optional
- `REDIS_DB`, optional
- `QUEUE_ATTEMPTS`, default `3`
- `QUEUE_BACKOFF_DELAY`, default `1000`
- `QUEUE_REMOVE_ON_COMPLETE`, default `100`
- `QUEUE_REMOVE_ON_FAIL`, default `1000`
- `QUEUE_WORKER_CONCURRENCY`, default `1`

Mail configuration is also environment-driven:

- `MAIL_FROM`, default `Portfolio2025 <no-reply@example.com>`
- `MAIL_HOST`, optional
- `MAIL_PORT`, default `587`
- `MAIL_SECURE`, set to `true` for TLS-on-connect
- `MAIL_USERNAME`, optional
- `MAIL_PASSWORD`, optional

When `MAIL_HOST` is missing, Nodemailer uses JSON transport. That keeps local development simple and avoids accidental real email delivery.

## Dispatching Jobs

Use the queue abstraction instead of importing BullMQ directly:

```ts
await queue.dispatch("mail.send", {
  to: "user@example.com",
  subject: "Welcome",
  text: "Thanks for signing up.",
});
```

The current concrete job is `mail.send`, handled by `SendMailJob`.

## Writing Jobs

Job handlers implement `JobHandler<TPayload>` and are registered in the job registry:

```ts
registry.register("example.job", new ExampleJob());
```

Workers resolve handlers by the BullMQ job name. Unknown job names fail fast with an explicit error.

## Running Workers

Start a local TypeScript worker:

```bash
npm run queue:work
```

Run the compiled worker after `npm run build`:

```bash
npm run queue:work:dist
```

The worker listens on the configured queue, logs completed and failed jobs, and closes cleanly on `SIGINT` or `SIGTERM`.

Internally, `src/worker.ts` calls `createQueueWorker()`, which creates a BullMQ `Worker` for the configured queue. Each BullMQ job is resolved by name through `JobRegistry`, so every process that can execute jobs must register the same handlers as the dispatcher expects.

## Retry and Failure Behavior

Dispatch defaults are configured in `src/config/queue.ts`:

- Jobs attempt up to `QUEUE_ATTEMPTS` times.
- Retries use exponential backoff starting at `QUEUE_BACKOFF_DELAY`.
- Completed and failed jobs are retained according to `QUEUE_REMOVE_ON_COMPLETE` and `QUEUE_REMOVE_ON_FAIL`.

Unknown job names fail fast because `JobRegistry` throws when no handler is registered. BullMQ then records the job as failed and applies the configured retry behavior.

## Production Workers

Run workers as separate long-lived processes from the HTTP server and scheduler:

```bash
npm run queue:work:dist
```

Use a process manager, systemd unit, or container supervisor to keep workers alive. Scale worker count horizontally only when the job handlers are safe to run concurrently. Increase `QUEUE_WORKER_CONCURRENCY` when a single worker process can safely process more than one job at a time.

Redis is required outside tests. The worker uses the same `REDIS_*` settings as the dispatcher.

## Testing

Tests use `FakeQueueDispatcher` and `FakeMailer` so unit and feature tests do not need Redis or SMTP. Future GitHub Actions coverage can keep those fast tests as the default and add Redis-backed integration tests with a Redis service container when needed.
