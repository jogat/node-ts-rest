# Queues, Jobs, and Mail Delivery

## Goal

Add background execution for slow work and a mail delivery path for user communication.

## Why This Matters

Once the API grows, not every side effect should happen during the HTTP request. Queues keep the request path fast and make email and other delayed actions easier to manage.

## Scope

- Create a `src/jobs/` area for queued work units. Done.
- Add a queue adapter or execution mode. Done with BullMQ for runtime and fake adapters for tests.
- Add a worker process for running queued jobs. Done with a basic BullMQ worker entrypoint.
- Create a `src/mail/` area or equivalent mail abstraction. Done with Nodemailer and fake mailers.
- Support one or more mail templates for application emails. Pending; current mail messages are plain typed payloads.

## Good First Use Cases

- send verification email
- send password reset email
- log audit events
- send post-creation notifications

## Current Implementation

- BullMQ is the runtime queue adapter and Redis is the required runtime queue backend.
- `QueueDispatcher` is the application-facing dispatch contract.
- `FakeQueueDispatcher` keeps unit and feature tests independent of Redis.
- Jobs are registered in a `JobRegistry` and handled by name.
- `mail.send` is the first concrete job.
- Nodemailer is the runtime mail transport.
- `FakeMailer` keeps mail tests independent of SMTP.
- Notification listeners can queue mail through `QueuedMailNotificationChannel` when the notifiable has an email address.

## Pending Work

- Add first-class email template rendering for verification, password reset, and post notification emails.
- Add product flows for verification and password reset before sending those emails.
- Add queue dashboards, metrics, and operational monitoring.
- Add production worker deployment guidance and scaling recommendations.
- Add dead-letter handling or richer failed-job inspection.
- Add Redis-backed GitHub Actions integration tests once CI service containers are configured.
- Add scheduled and repeatable jobs in the scheduled-commands milestone.
- Keep advanced worker behavior in the queue-workers milestone.

## Done When

- Jobs can be dispatched from application code.
- Background work can be processed outside the HTTP request cycle.
- Mail can be triggered from a job or listener.
- The default local development path remains simple to run.
