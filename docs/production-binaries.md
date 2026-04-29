# Production Bundles

The production artifact strategy is an esbuild bundle for application code, not a single native executable.

The bundle keeps npm packages external. This is intentional because the app uses packages with runtime behavior and native bindings, including database drivers, `bcrypt`, Redis/BullMQ, Knex, and file-system based configuration. The production host still installs production dependencies, while app source files and path aliases are bundled into a smaller set of Node-ready entrypoints.

## Why esbuild

The evaluated options were:

- `esbuild`: TypeScript-friendly, fast, supports Node platform bundling, source maps, minification, and external packages.
- `tsup`: TypeScript-friendly wrapper around esbuild, useful for libraries, but not needed for this app's direct build script.
- `pkg`: creates standalone executables, but native modules and dynamic runtime files make it a poor default fit here.
- Node single executable applications: promising, but still an active-development feature and better suited for a later dedicated artifact milestone.

## Build

Run the normal compiler and production bundle:

```bash
npm run build:prod
```

This runs:

```bash
npm run build
npm run build:bundle
```

Bundled entrypoints are written to `dist-bundle/`:

- `dist-bundle/app.js`
- `dist-bundle/artisan.js`
- `dist-bundle/worker.js`
- `dist-bundle/scheduler.js`

Source maps and `dist-bundle/meta.json` are emitted for debugging and artifact inspection.

## Running Bundles

Run the bundled HTTP server:

```bash
NODE_ENV=production npm run start:bundle
```

Run bundled Artisan commands:

```bash
npm run artisan:bundle -- db status
```

Run bundled queue and scheduler processes:

```bash
npm run queue:work:bundle
npm run schedule:work:bundle
```

The bundle scripts use `node --enable-source-maps` so stack traces can resolve through emitted source maps when they are present.

## Deploying

A production host should receive:

- `dist-bundle/`
- `package.json`
- `package-lock.json`
- production `node_modules` from `npm ci --omit=dev`
- runtime files that are intentionally not bundled, such as environment configuration, storage directories, migrations if the host runs Knex CLI commands, and any process manager files.

Typical production install:

```bash
npm ci --omit=dev
NODE_ENV=production node --enable-source-maps dist-bundle/app.js
```

Build on the same OS and architecture as the deployment target when native dependencies are involved.

## Current Limits

The current bundle is optimized JavaScript, not a self-contained binary. It still requires Node.js and production dependencies on the target host.

Do not remove the regular `npm run build` path. It remains the conservative compiled output for environments where bundling introduces a runtime compatibility issue.
