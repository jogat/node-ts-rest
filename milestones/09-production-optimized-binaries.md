# Production-Optimized Binaries

## Goal

Package the server and console entrypoints in a production-friendly form.

## Why This Matters

A Laravel-like project eventually benefits from a stable deployment artifact that reduces startup overhead and keeps runtime behavior predictable.

## Scope

- Evaluate binary or bundle output for the server and console entrypoints.
- Keep source maps and debugging support available where practical.
- Document the build and deploy workflow for production hosts.

## Done When

- The application can be shipped in a production-optimized runtime form.
- Deployment steps are documented.
- The chosen binary strategy does not break local development.
