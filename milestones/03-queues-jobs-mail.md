# Queues, Jobs, and Mail Delivery

## Goal

Add background execution for slow work and a mail delivery path for user communication.

## Why This Matters

Once the API grows, not every side effect should happen during the HTTP request. Queues keep the request path fast and make email and other delayed actions easier to manage.

## Scope

- Create a `src/jobs/` area for queued work units.
- Add a queue adapter or execution mode.
- Add a worker process for running queued jobs.
- Create a `src/mail/` area or equivalent mail abstraction.
- Support one or more mail templates for application emails.

## Good First Use Cases

- send verification email
- send password reset email
- log audit events
- send post-creation notifications

## Done When

- Jobs can be dispatched from application code.
- Background work can be processed outside the HTTP request cycle.
- Mail can be triggered from a job or listener.
- The default local development path remains simple to run.

