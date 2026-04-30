# Persistent Notifications and User Inbox

## Goal

Add a database-backed notification system with per-user read state and an API surface for reading and managing notifications.

## Why This Matters

Laravel applications commonly persist notifications so users can revisit important events later. That fits this API better than keeping notifications only in memory or only in outbound channels.

## Scope

- Add a `notifications` table and model-like access helpers.
- Store notifications for users after events or domain workflows complete.
- Add read and unread state.
- Add API endpoints for listing, marking read, and clearing notifications.
- Keep broadcast or real-time delivery out of scope until a concrete client need exists.

## Done When

- Notifications persist across requests and process restarts.
- Users can list and manage their own notifications through the API.
- Read state is explicit and testable.
- Notification delivery continues to work alongside existing mail and event listeners.

## Pending Future Work

- Add per-notification type grouping or filtering.
- Add notification retention and pruning policy.
- Add broadcast delivery if a front-end client needs live updates.
- Add user-level notification preferences.
- Add an inbox count endpoint or summary if the UI needs it.
