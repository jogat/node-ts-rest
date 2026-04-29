# Queue Workers

## Goal

Add a dedicated worker entrypoint for background job execution.

## Why This Matters

Queues should not depend on HTTP requests or ad hoc scripts. A worker makes job processing explicit and production-friendly.

## Scope

- [x] Add a worker process that consumes queued jobs.
- [x] Define a queue adapter strategy that fits the current stack.
- [x] Support local development execution and production deployment.
- [x] Document retry and failure behavior.

## Done When

- [x] Jobs can be processed by a long-running worker.
- [x] The worker can be started and stopped with normal process management.
- [x] Queue behavior is documented for future background tasks.

## Implementation

- Kept BullMQ as the queue worker runtime after checking current TypeScript-friendly Node queue options. BullMQ already fits the stack, ships TypeScript types, supports Redis-backed workers, concurrency, retries, and graceful shutdown.
- Added a testable worker factory around BullMQ `Worker`.
- Kept `src/worker.ts` as the long-running process entrypoint.
- The worker resolves job names through `JobRegistry` and executes registered handlers.
- The worker logs completed and failed jobs, and closes cleanly on `SIGINT` or `SIGTERM`.
- Local scripts:
  - `npm run queue:work`
  - `npm run queue:work:dist`

## Pending Future Work

- Add a Redis-backed integration test that dispatches a real BullMQ job and verifies worker processing.
- Add worker health probes or heartbeat reporting for production process monitors.
- Add structured logging with job duration, attempts, queue name, and error metadata.
- Add dead-letter or failed-job inspection commands.
- Add queue pause/resume and drain commands.
- Add graceful shutdown timeout handling for jobs that do not finish promptly.
- Add per-job concurrency or named worker pools if job types start needing different resource profiles.
- Add operational metrics for queue depth, processing latency, failures, retries, and worker count.
