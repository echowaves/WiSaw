## Context

The Waves screen header shows an ungrouped-photos count badge on the auto-group button. The badge is fetched via `getUngroupedPhotosCount` and refreshed on two triggers:

1. `useFocusEffect` on the `app/(drawer)/waves/index.tsx` route.
2. `subscribeToAutoGroupDone` event from `src/events/autoGroupBus.js`.

When a wave is deleted, its photos become ungrouped. Currently neither WavesHub nor WaveDetail emit `autoGroupDone` after deletion, so the badge stays stale until the next focus change.

## Goals / Non-Goals

**Goals:**
- Badge updates immediately after a wave is deleted from either WavesHub or WaveDetail.

**Non-Goals:**
- Creating a new event type (e.g., `waveDeleted`). The existing `autoGroupDone` event already triggers the exact refresh we need.
- Changing the badge component itself or `fetchUngroupedCount` logic.

## Decisions

**Reuse `emitAutoGroupDone` rather than a new event.**
The `autoGroupDone` event was designed to signal "the pool of ungrouped photos may have changed." Wave deletion fits that semantic because it returns photos to the ungrouped pool. Adding a dedicated `waveDeleted` event would require a new subscriber in `waves/index.tsx` that does the same thing `subscribeToAutoGroupDone` already does.

**Emit in both WavesHub and WaveDetail.**
WavesHub stays on screen after deletion, so no focus event fires — the emit is the only way to refresh. WaveDetail calls `router.back()`, which triggers a focus event, but emitting before `router.back()` guarantees the refresh is already queued and avoids a race condition.

## Risks / Trade-offs

- [Semantic overload of `autoGroupDone`] → Acceptable because the event's purpose is "ungrouped count may have changed," and deletion is a valid trigger. A comment at the call site clarifies intent.
