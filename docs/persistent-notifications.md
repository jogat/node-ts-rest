# Persistent Notifications

Persistent notifications are the next step after the current event/listener and outbound notification setup.

## Intended Shape

The planned notification layer will add:

- a database-backed notifications table
- read and unread state
- per-user notification listing endpoints
- explicit mark-read and clear actions
- optional channel-specific fan-out from events or services

## Why It Matters

The current notification flow is useful for side effects, but Laravel-style applications usually keep an inbox for later review. A persistent store makes notifications durable across requests, worker restarts, and client reconnects.

## Current Boundary

Right now, notifications are delivered through listeners and channels. The persistent inbox does not exist yet. That work is tracked in milestone 10.
