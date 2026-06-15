# Change: Coalesce Waves Screen Refresh Events

## Problem

The Waves screen freezes during multi-batch photo uploads because `handleRefresh()` is called
dozens of times in rapid succession by three event sources:
- `useFocusEffect` (on screen focus)
- `subscribeToAutoGroupDone` (after auto-group)
- `subscribeToUploadComplete` (after each photo upload)

The current guard (`refreshRunningRef`) prevents concurrent calls but **drops events** — if 10
uploads fire in 200ms, only 1 refresh executes and 9 are silently dropped. This means the UI
doesn't reflect the latest state until much later.

Additionally, `debouncedSearch` is a dependency of `handleRefresh`, so **every keystroke** creates
a new `handleRefresh` function, invalidating all three event subscriptions and causing them to
re-subscribe on every keystroke.

## Goals

1. Eliminate dropped refresh events during rapid upload bursts
2. Stabilize `handleRefresh` function identity so event subscriptions don't re-fire on every keystroke
3. Ensure UI always reflects the latest state after upload batches

## Non-Goals

- Fix GraphQL query performance (separate concern)
- Fix auto-group timing (separate concern)
- Change the event bus architecture (out of scope)
