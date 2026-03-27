## Context

The app uses a Drawer navigator that keeps visited screens mounted. When a user deletes a photo in WaveDetail (via the expanded Photo view or QuickActionsModal), the deletion only affects the current screen's local state through `PhotosListContext.removePhoto`. The PhotosList screen's state is not updated, so the deleted photo remains visible there until the next server fetch.

This is the same class of cross-screen state synchronization problem solved for uploads with `uploadBus`. The codebase already has 5 Set-based event buses in `src/events/` (`autoGroupBus`, `waveAddBus`, `photoSearchBus`, `friendAddBus`, `uploadBus`).

Deletion flows through `usePhotoActions.handleDelete`, which calls the `deletePhoto` GraphQL mutation and then invokes an `onDeleted(photoId)` callback. Both entry points (expanded Photo component and QuickActionsModal) use this same hook, so a single emit point covers all deletion paths.

## Goals / Non-Goals

**Goals:**
- Deleted photos are removed from all mounted screens immediately, not just the screen where deletion occurred
- Follow the established event bus pattern for consistency
- Single emit point that covers all deletion entry paths

**Non-Goals:**
- Changing the deletion mutation or server-side behavior
- Adding optimistic deletion (delete from UI before server confirms) — current confirm-then-remove flow is preserved
- Refactoring `PhotosListContext` or the `onDeleted` callback chain — these remain for immediate local response

## Decisions

### 1. Dedicated `photoDeletionBus` vs extending `uploadBus`
**Choice:** Dedicated bus in `src/events/photoDeletionBus.js`
**Rationale:** Each bus in the codebase is single-purpose (uploads, wave adds, friend adds, etc.). A combined bus would conflate unrelated events and complicate listener signatures. The dedicated bus keeps the pattern consistent.
**Alternatives considered:** Extending uploadBus with event types — rejected for coupling unrelated concerns.

### 2. Emit from `usePhotoActions.handleDelete` vs from each screen
**Choice:** Emit from `usePhotoActions.handleDelete` after successful `deletePhoto` mutation
**Rationale:** This is the single choke point for all deletion paths. Emitting here means any future deletion entry point (e.g., a new UI surface) automatically gets cross-screen sync. Emitting from each screen would require remembering to add the emit in every new consumer.
**Alternatives considered:** Emit from Photo component's `onDeleted` callback — rejected because it's per-screen, not centralized.

### 3. Keep existing `onDeleted` callback alongside bus emission
**Choice:** Keep both — `onDeleted` for immediate local UI update, bus for cross-screen propagation
**Rationale:** The `onDeleted` callback handles local concerns (closing the expanded photo, updating the immediate list). The bus handles cross-screen concerns. Removing `onDeleted` would require refactoring PhotosListContext and Photo component internals, which is out of scope.

### 4. Event payload: `photoId` only
**Choice:** Emit `{ photoId }` — the minimal data needed to identify what to remove
**Rationale:** Unlike upload events that carry the full photo object (needed to prepend to lists), deletion only needs the ID to filter. Keeping the payload minimal avoids unnecessary data coupling.

## Risks / Trade-offs

- **[Duplicate removal calls]** The screen where deletion occurred will get both the `onDeleted` callback AND the bus event, causing `removePhoto` to be called twice for the same `photoId`. → Mitigation: `removePhoto` filters by ID, so removing an already-absent photo is a no-op (`.filter(p => p.id !== photoId)` on a list that doesn't contain it simply returns the same list).
- **[Listener leak]** If a screen unmounts without cleaning up its subscription, the listener remains in the Set. → Mitigation: Standard `useEffect` cleanup pattern with the unsubscribe function returned by `subscribe`, same as `uploadBus` subscriptions.
