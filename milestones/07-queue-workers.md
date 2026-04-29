# Queue Workers

## Goal

Add a dedicated worker entrypoint for background job execution.

## Why This Matters

Queues should not depend on HTTP requests or ad hoc scripts. A worker makes job processing explicit and production-friendly.

## Scope

- Add a worker process that consumes queued jobs.
- Define a queue adapter strategy that fits the current stack.
- Support local development execution and production deployment.
- Document retry and failure behavior.

## Done When

- Jobs can be processed by a long-running worker.
- The worker can be started and stopped with normal process management.
- Queue behavior is documented for future background tasks.
