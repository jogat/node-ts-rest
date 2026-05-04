# Laravel-Inspired Pipelines

## Goal

Add a local TypeScript pipeline abstraction inspired by Laravel's `Illuminate\Pipeline\Pipeline` for large workflows that pass a mutable payload through ordered stages.

## Why This Matters

Some application processes are too large to keep inside one service method or controller action. A pipeline gives those processes a clear execution shape: each stage receives the current payload, changes or replaces it, and passes it to the next stage.

This should use the app's existing console, service, queue, and job conventions instead of adding a generic package. Packages such as `sweet-pipeline` and `@fieldguide/pipeline` cover part of the pattern, but they do not integrate with this repo's `QueueDispatcher`, `JobRegistry`, `JobHandler`, and Artisan-style commands.

## Package Research Decision

The first version should be implemented locally instead of adding a pipeline dependency.

Packages reviewed in May 2026:

- [`@supercharge/pipeline`](https://npm.io/package/%40supercharge/pipeline) is the closest Laravel-style API match and includes `send`, `through`, `via`, `then`, and `thenReturn`, but it is a small wrapper last published years ago and still does not provide this repo's named registry, payload helper, queue dispatcher, or job registry integration.
- [`sweet-pipeline`](https://www.npmjs.com/package/sweet-pipeline) is TypeScript-friendly and Laravel-inspired, but it is very small, lightly used, and would still require local wrappers for payload options, nested pipelines, jobs, and commands.
- [`@fieldguide/pipeline`](https://www.npmjs.com/package/%40fieldguide/pipeline) is current and type-safe, but its args/context/results builder model is different from the mutable Laravel-style payload contract planned here.
- [`trough`](https://www.npmjs.com/package/trough) is mature middleware plumbing, but it is not Laravel-shaped and would add callback/ESM integration concerns for little benefit in this CommonJS app.

The repo should keep a first-party `Pipeline`, `PipelinePayload`, `PipelineRegistry`, and `PipelineRunner` so the public API matches the app conventions and can integrate directly with `QueueDispatcher`, `JobRegistry`, and Artisan-style commands. External package adoption can be revisited only if a package becomes a clear fit for these integration points.

## Scope

- Add a `Pipeline<TPayload>` API with Laravel-like methods:
  - `send(payload)`
  - `through(stages)`
  - `pipe(stages)`
  - `via(method)`
  - `then(callback)`
  - `thenReturn()`
- Add a `PipelineStage<TPayload>` contract with a default `handle(payload, next)` method.
- Add a `PipelineRegistry` for named pipeline definitions that can be executed from commands, services, or jobs.
- Add a `PipelineRunner` service with:
  - `runSync(name, payload)` for immediate execution
  - `dispatch(name, payload, options?)` for queued execution
- Add a `PipelinePayload<TInput, TOutput>` helper object that travels through every stage with:
  - `input`, for the original or working input object
  - `output`, for the current output value, including rich in-process values such as a Post instance
  - `meta`, as a string-keyed value collection with `getMetaValue(key)` and `setMetaValue(key, value)` helpers
  - mutable options seeded from command or runner options, with `getOption(key)` and `setOption(key, value)` helpers
  - `shouldHalt` and `shouldSkipPipeline` flags for stopping work or skipping a nested pipeline
- Add a `pipeline.run` job that resolves a named pipeline and runs the whole pipeline inside one queued job.
- Allow nested pipelines by letting a stage call `PipelineRunner.runSync(...)` for a child pipeline.
- Add a demo console command:
  - `npm run artisan -- pipeline demo`
  - `npm run artisan -- pipeline demo --queued`

## Payload and Options Contract

Stages should receive the same mutable `PipelinePayload` instance unless a stage explicitly replaces it. The payload is the shared place for input, output, metadata, and options that need to travel across the pipeline.

The intended TypeScript shape is:

```ts
type PipelineMeta = Record<string, unknown>;
type PipelineOptions = Record<string, unknown>;

class PipelinePayload<TInput = unknown, TOutput = unknown> {
  getInput(): TInput | undefined;
  setInput(input: TInput): this;
  getOutput(): TOutput | undefined;
  setOutput(output: TOutput): this;
  getMeta(): PipelineMeta;
  getMetaValue<TValue = unknown>(key: string): TValue | undefined;
  setMetaValue(key: string, value: unknown): this;
  getOptions(): PipelineOptions;
  getOption<TValue = unknown>(key: string): TValue | undefined;
  setOption(key: string, value: unknown): this;
  getShouldHalt(): boolean;
  setShouldHalt(shouldHalt: boolean): this;
  getShouldSkipPipeline(): boolean;
  setShouldSkipPipeline(shouldSkipPipeline: boolean): this;
  clear(): this;
}
```

Command options should be passed into the runner and merged into the payload options before the first stage runs. Stages may read or mutate those options, and later stages or nested synchronous pipelines must see the updated values.

Queued execution should serialize the pipeline name, payload data, and options:

```ts
{
  pipeline: "posts.import",
  payload: {
    input: { title: "Hello World" },
    output: null,
    meta: { source: "console" },
    options: { dryRun: true }
  }
}
```

Sync mode may hold rich values in `output`, such as a Post instance. Queued mode should keep payload input, meta, and options JSON-compatible because BullMQ serializes job data.

## Done When

- A command can run a named demo pipeline synchronously and print the final payload.
- The same command can dispatch the named demo pipeline through the queue.
- Pipeline stages run in order and can transform the payload.
- A stage can call another pipeline synchronously through the runner.
- Command options can travel through the pipeline, be read or mutated by stages, and be visible to later stages.
- Payload helpers expose input, output, meta values, options, halt state, and nested-pipeline skip state.
- The worker can execute the `pipeline.run` job through the existing job registry.
- Unknown pipeline names fail with an explicit error.
- Tests cover sync execution, queued dispatch, nested pipelines, alternate stage methods, error handling, and console registration.

## Implementation Notes

- Keep the first implementation local to the repo and avoid adding a pipeline dependency.
- Use one queued job for the whole pipeline. Per-stage queueing needs persisted progress and should be a future milestone item.
- Keep queued pipeline payloads JSON-compatible because BullMQ must serialize job data.
- Register the `pipeline.run` job in the same `registerJobs` path used by existing jobs.
- Keep the pipeline registry explicit. Package-style discovery can wait for the application bootstrapping milestone.
- Document the usage contract in `docs/pipelines.md` alongside small cross-references from console, services, and queue docs.

## Test Plan

- Add unit tests for ordered stage execution, payload transformation, `thenReturn()`, `via("work")`, nested pipeline execution, and stage failure behavior.
- Add payload tests for input/output setters, meta helpers, option helper mutation across stages, `shouldHalt`, and `shouldSkipPipeline`.
- Add registry and job tests for named pipeline lookup, `pipeline.run`, and unknown pipeline names.
- Add console tests for `pipeline demo`, `pipeline demo --queued`, and command registration.
- Run the focused pipeline, jobs, and console tests before the full suite:

```bash
npm test -- tests/unit/pipeline.test.ts tests/unit/jobs.test.ts tests/unit/console.test.ts
npm test
```

## Pending Future Work

- Per-stage queueing with persisted progress.
- Pipeline run history and inspection commands.
- Resume or retry from a failed stage.
- Cancellation support for long-running workflows.
- Pipeline metrics, duration logging, and stage-level tracing.
- Discovery or provider-based registration after application bootstrapping exists.
- Stage middleware hooks for logging, timing, authorization gates, or diagnostics around every stage.
- Built-in JSON-compatibility validation before dispatching queued pipeline payloads.
- A richer queued-payload serialization policy for dates, model identifiers, or other values that cannot cross BullMQ as live objects.
- A dedicated pipeline inspection command for registered pipeline names, stage lists, and configured stage methods.
- Adapter research if a TypeScript pipeline package later becomes mature enough to cover the local integration contract.
