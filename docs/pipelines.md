# Pipelines Guide

Pipelines are planned in `milestones/14-laravel-inspired-pipelines.md` as the preferred shape for large workflows that pass one mutable payload through ordered stages.

Use a pipeline when a workflow is too large for one service method but still needs one clear execution path. Keep small business operations in services, one-off background work in jobs, and event reactions in listeners.

## Package Decision

The pipeline layer should be implemented locally for this app. Existing TypeScript packages cover pieces of the pattern, but none fit the full app contract:

- `@supercharge/pipeline` is closest to Laravel's method names, but it does not provide this repo's named registry, payload helper, queue dispatch, or job registry integration.
- `sweet-pipeline` is Laravel-inspired and typed, but it is very small and would still need local wrappers for this app's command and queue conventions.
- `@fieldguide/pipeline` is type-safe and current, but it uses an args/context/results builder model instead of a shared mutable Laravel-style payload.
- `trough` is mature middleware plumbing, but it is not Laravel-shaped and is not enough to justify adapting this CommonJS app around it.

The first implementation should add first-party pipeline primitives instead of a new runtime dependency.

## Core API

The planned low-level API mirrors Laravel's pipeline shape:

```ts
await new Pipeline<PipelinePayload>()
  .send(payload)
  .through([new NormalizeInput(), new CreatePost(), new AttachMetadata()])
  .thenReturn();
```

Stages should implement a default `handle(payload, next)` method. Function stages may be supported when they follow the same payload and next callback contract.

```ts
class NormalizeInput {
  async handle(payload: PipelinePayload<{ title: string }>, next: PipelineNext): Promise<PipelinePayload> {
    payload.setInput({
      ...payload.getInput(),
      title: payload.getInput()?.title.trim() ?? "",
    });

    return next(payload);
  }
}
```

Use `via("work")` when a stage should call a method other than `handle`.

```ts
await new Pipeline<PipelinePayload>()
  .send(payload)
  .through([new NormalizeInput()])
  .via("work")
  .thenReturn();
```

## Payload Contract

Stages receive the same mutable `PipelinePayload` instance unless a stage explicitly replaces it. The payload carries:

- `input`: original or working input
- `output`: current result, including rich in-process values during sync execution
- `meta`: string-keyed metadata shared across stages
- `options`: mutable options seeded by the command or runner
- `shouldHalt`: stop remaining stages when set
- `shouldSkipPipeline`: allow a parent stage to skip a nested pipeline

Use helper methods instead of reaching into internals:

```ts
payload
  .setMetaValue("source", "console")
  .setOption("dryRun", true)
  .setOutput(post);

const dryRun = payload.getOption<boolean>("dryRun") ?? false;
```

Queued payloads must stay JSON-compatible because BullMQ serializes job data. Sync pipelines may keep rich objects in `output`, but queued pipelines should pass model IDs, plain objects, arrays, strings, numbers, booleans, or null.

## Running Pipelines

Named pipelines should be registered explicitly with `PipelineRegistry` and executed through `PipelineRunner`.

```ts
const finalPayload = await pipelineRunner.runSync("posts.import", payload);
```

Queued execution should dispatch one job for the whole pipeline:

```ts
await pipelineRunner.dispatch("posts.import", payload, {
  attempts: 3,
});
```

The queued job name should be `pipeline.run`. Workers should resolve that job through the same `JobRegistry` path as existing jobs.

## Nested Pipelines

A stage may call another named pipeline synchronously through `PipelineRunner.runSync(...)`. Options mutated by earlier stages should remain visible to later stages and nested synchronous pipelines.

```ts
class RunChildPipeline {
  constructor(private readonly pipelineRunner: PipelineRunner) {}

  async handle(payload: PipelinePayload, next: PipelineNext): Promise<PipelinePayload> {
    if (!payload.getShouldSkipPipeline()) {
      await this.pipelineRunner.runSync("posts.prepare", payload);
    }

    return next(payload);
  }
}
```

## Console Usage

The demo command planned for the first implementation should support sync and queued execution:

```bash
npm run artisan -- pipeline demo
npm run artisan -- pipeline demo --queued
```

The sync command should print the final payload. The queued command should dispatch `pipeline.run` and print enough information to confirm the dispatch.

## Testing

Pipeline coverage should include:

- ordered stage execution
- payload transformation and helper methods
- `thenReturn()`
- alternate stage methods through `via("work")`
- nested sync pipeline execution
- option mutation across stages
- unknown pipeline names
- `pipeline.run` job handling
- console command registration and sync/queued demo behavior
