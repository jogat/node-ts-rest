# Queues, Jobs, and Mail

The app uses BullMQ for background jobs and Nodemailer for mail delivery. Application code dispatches jobs through a small `QueueDispatcher` interface so tests can use fakes without Redis or SMTP.

## Configuration

Queue configuration is read from environment variables:

- `QUEUE_NAME`, default `default`
- `REDIS_HOST`, default `127.0.0.1`
- `REDIS_PORT`, default `6379`
- `REDIS_PASSWORD`, optional
- `REDIS_DB`, optional
- `QUEUE_ATTEMPTS`, default `3`
- `QUEUE_BACKOFF_DELAY`, default `1000`

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

## Testing

Tests use `FakeQueueDispatcher` and `FakeMailer` so unit and feature tests do not need Redis or SMTP. Future GitHub Actions coverage can keep those fast tests as the default and add Redis-backed integration tests with a Redis service container when needed.
