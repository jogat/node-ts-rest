# Production-Optimized Binaries

## Goal

Package the server and console entrypoints in a production-friendly form.

## Why This Matters

A Laravel-like project eventually benefits from a stable deployment artifact that reduces startup overhead and keeps runtime behavior predictable.

## Scope

- [x] Evaluate binary or bundle output for the server and console entrypoints.
- [x] Keep source maps and debugging support available where practical.
- [x] Document the build and deploy workflow for production hosts.

## Done When

- [x] The application can be shipped in a production-optimized runtime form.
- [x] Deployment steps are documented.
- [x] The chosen binary strategy does not break local development.

## Implementation

- Added esbuild as the production bundle tool after checking current TypeScript-friendly packaging options.
- Chose bundled JavaScript over a single native executable because the app uses native/runtime-sensitive dependencies such as `bcrypt`, database drivers, Redis/BullMQ, Knex, and file-system based runtime configuration.
- Added `scripts/build-production-bundles.js`.
- Added `npm run build:bundle` and `npm run build:prod`.
- Added bundled runtime scripts:
  - `npm run start:bundle`
  - `npm run artisan:bundle -- <command>`
  - `npm run queue:work:bundle`
  - `npm run schedule:work:bundle`
- Bundled app source and path aliases into `dist-bundle/` while keeping npm packages external.
- Emitted source maps and `dist-bundle/meta.json` for debugging and artifact inspection.
- Documented the strategy in `docs/production-binaries.md`.

## Pending Future Work

- Add CI artifact packaging that uploads `dist-bundle/` with lockfile metadata.
- Add a smoke test that starts `dist-bundle/app.js` and checks a health endpoint once a health route exists.
- Add Docker or process-manager examples for running the bundled server, worker, and scheduler together.
- Add production source map retention policy and error-reporting integration.
- Evaluate Node single executable applications again once the feature is stable enough for this app's runtime needs.
- Revisit standalone executable packaging only if deployment targets require running without Node.js installed.
- Add bundle size budgets or warnings if output grows unexpectedly.
