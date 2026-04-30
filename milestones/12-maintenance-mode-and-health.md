# Maintenance Mode and Health

## Goal

Add deployment controls for maintenance mode and a clear health signal for hosts and process managers.

## Why This Matters

Laravel exposes a simple way to take an application down during deploys. This server should have an equivalent operational story so maintenance is explicit instead of improvised.

## Scope

- Add a maintenance flag that the HTTP layer can respect.
- Add console commands for entering and leaving maintenance mode.
- Add a health endpoint suitable for load balancers and smoke checks.
- Add readiness and liveness semantics only if the deployment platform needs both.

## Done When

- The server can be placed into maintenance mode and recovered cleanly.
- Hosts can verify the app is up with a predictable health response.
- Maintenance state is documented and tested.
- Normal development flow stays unchanged when maintenance mode is not active.

## Pending Future Work

- Add a custom maintenance page if the app ever serves browser traffic.
- Add deploy hooks that automatically toggle maintenance mode around releases.
- Add distributed maintenance coordination only if multiple hosts need shared state.
- Add richer startup diagnostics if health checks need more detail.
