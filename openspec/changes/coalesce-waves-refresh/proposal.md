# Change: Simplify Waves Screen Refresh Events

## Problem

The Waves screen freezes during multi-batch photo uploads because `handleRefresh()` is called
dozens of times in rapid succession by multiple event sources:
- `useFocusEffect` (on screen focus)
- `subscribeToAutoGroupDone` (after auto-group)
- `subscribeToUploadComplete` (after each photo upload)

The event-driven approach with timers and scheduled refreshes caused race conditions where
the screen would freeze during navigation after multiple uploads completed.

## Goals

1. Simplify refresh logic to only explicit user actions
2. Remove scheduled refreshes and event listeners that cause race conditions
3. Ensure screen only refreshes when user explicitly navigates or pulls to refresh

## Approach

Remove all event-based refresh triggers from WavesHub:
- Remove `subscribeToAutoGroupDone` listener
- Remove scheduled refresh timers
- Remove `debouncedSearch` dependency from `handleRefresh` (using ref instead)

Refresh now only happens on:
- Screen focus (`useFocusEffect`)
- Pull to refresh (`onRefresh={handleRefresh}`)
- Search change (direct `handleRefresh()` call, no debounce timer)

This eliminates the freeze because there are no overlapping refresh operations.

## Non-Goals

- Fix GraphQL query performance (separate concern)
- Fix auto-group timing (separate concern)
- Change the event bus architecture (out of scope)
