## Context

Photo instances in the app are rendered inside multiple navigators (PhotosList under `(tabs)`, WaveDetail under `waves`). Because the Drawer keeps visited screens mounted, the same photo can be displayed simultaneously across screens. Currently, comment changes (addition or deletion) only update the local Photo instance that initiated the action. Other mounted instances of the same photo remain stale until their next full data fetch.

Three mechanisms exist today:
1. `global.photoRefreshCallbacks` — a `Map<photoId, callback>` storing one callback per photo. Last-registered Photo wins; other instances are never notified.
2. `global.lastCommentSubmission` — a timestamp checked by a 1-second polling interval in every mounted Photo instance — wasteful and up to 1s delay.
3. `refreshKey` prop — parent-driven, only used by shared photo screen.

The codebase already has six Set-based event buses in `src/events/` (autoGroupBus, waveAddBus, photoSearchBus, friendAddBus, uploadBus, photoDeletionBus). This design follows the identical pattern.

## Goals / Non-Goals

**Goals:**
- All mounted Photo instances showing the same photo refresh immediately when a comment is added or deleted
- Eliminate the polling interval and global callback Map
- Follow the established event bus pattern for consistency

**Non-Goals:**
- Changing `global.photoOptimisticCallbacks` (instant text preview before server confirms) — separate concern, works fine
- Modifying WebSocket subscription behavior for real-time comments from other users
- Adding cross-screen sync for actions other than comment add/delete (e.g., photo likes)

## Decisions

### 1. Set-based event bus (same as photoDeletionBus)

**Choice**: Create `src/events/photoRefreshBus.js` with `subscribeToPhotoRefresh(listener)` / `emitPhotoRefresh({ photoId })`.

**Rationale**: Six buses already use this exact pattern. It supports multiple subscribers per event, cleanup via returned unsubscribe function, and requires zero new dependencies. Alternatives considered:
- **Jotai atom**: Would require a shared atom per photoId or a Map atom — adds complexity for a simple pub/sub need.
- **Global event emitter (EventEmitter)**: Adds a dependency; the Set-based pattern is simpler and already proven.

### 2. Photo component subscribes in existing useEffect, filters by photoId

**Choice**: Subscribe in the main data-loading `useEffect` (which already depends on `photo?.id`). On receiving an event, increment `internalRefreshKey` to trigger re-fetch only if `event.photoId === photo?.id`.

**Rationale**: `internalRefreshKey` already triggers the data-loading effect — reusing it avoids adding new state. Filtering by photoId ensures only relevant instances re-fetch.

### 3. Emit after comment delete (Photo) and after comment add (ModalInputText)

**Choice**:
- Comment deletion: emit `emitPhotoRefresh({ photoId })` at the end of the existing delete handler, after the local re-fetch completes.
- Comment addition: emit `emitPhotoRefresh({ photoId })` in ModalInputText after `router.back()`, replacing the `global.photoRefreshCallbacks.get(photoId)()` call.

**Rationale**: Emitting after local operations complete ensures the emitting instance has already updated, and other instances react to the same event. The 300ms delay before emit in ModalInputText is kept to allow the modal dismiss animation to complete.

### 4. Remove polling interval and global.photoRefreshCallbacks

**Choice**: Remove the `setInterval(checkForRefresh, 1000)` block and `global.photoRefreshCallbacks` registration from Photo. Remove `global.lastCommentSubmission` usage from ModalInputText.

**Rationale**: The bus replaces both mechanisms. The polling is expensive (runs in every mounted Photo every second) and the callback Map only supports one subscriber per photoId.

## Risks / Trade-offs

- **[Double re-fetch on emitting instance]** → The Photo that deletes a comment already re-fetches locally, then receives its own bus event. Mitigation: Filter — skip bus-triggered refresh if `event.photoId === photo?.id` and the component just performed the action itself. Alternatively, accept the minor extra fetch since it's a rare user action and the UX is correct.
- **[Optimistic comment display timing]** → `global.photoOptimisticCallbacks` is kept as-is. The bus-triggered re-fetch on other screens won't show the optimistic comment first — it will show the server-confirmed state. This is acceptable since optimistic display is a same-screen UX enhancement.
- **[No rollback needed]** → Pure client-side change, no data migration. Reverting is a code revert.
