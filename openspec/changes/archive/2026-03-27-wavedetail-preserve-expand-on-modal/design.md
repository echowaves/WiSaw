## Context

WaveDetail's `useFocusEffect` runs on every focus return, performing a full reset: clearing `expandedPhotoIds`, resetting pagination (`pageNumber`, `stopLoading`, `noMoreData`), generating a new batch ID, and reloading all photos from page 0. This was originally necessary because WaveDetail had no other mechanism to detect changes. Now, several event buses handle real-time updates:
- `uploadBus` — notifies when a photo is uploaded to this wave
- `photoDeletionBus` — notifies when a photo is deleted from another screen
- `photoRefreshBus` — notifies when photo details change (comments add/delete)

PhotosList uses a `useEffect` for initial load and does NOT reset expansion state on focus. WaveDetail should follow the same pattern.

## Goals / Non-Goals

**Goals:**
- Expanded photos stay expanded when returning from a modal overlay
- WaveDetail performs a full reset only when `waveUuid` changes (navigating to a different wave)
- Pull-to-refresh remains the manual reload path

**Non-Goals:**
- Changing the pull-to-refresh behavior
- Modifying event bus subscriptions (those already work correctly)
- Adding soft-refresh on focus (event buses cover real-time updates)

## Decisions

### 1. Replace useFocusEffect with useEffect keyed on waveUuid

**Choice**: Convert the `useFocusEffect(useCallback(..., [waveUuid]))` to a `useEffect(() => { ... }, [waveUuid])`.

**Rationale**: The `useFocusEffect` callback dependency is `[waveUuid]`, meaning its body doesn't change across focus cycles for the same wave — yet it runs on every focus. A `useEffect` on `[waveUuid]` runs once on mount and again only when `waveUuid` changes, which is exactly the desired behavior.

**Alternatives considered**:
- **Track modal state to skip reset**: Fragile — would need to detect whether focus loss was from a modal vs. real navigation. Navigation state detection is unreliable across Expo Router stacks.
- **Keep useFocusEffect but skip expandedPhotoIds reset**: Partial fix — photos would stay expanded but the list would still reload from scratch on modal return, causing a flash.

### 2. Remove useFocusEffect import if no longer used

**Choice**: Clean up the `useFocusEffect` import from `expo-router` if no other usage remains in WaveDetail.

**Rationale**: Dead imports trigger lint warnings and add confusion.

## Risks / Trade-offs

- **[Stale data if user navigates away and back]** → Mitigated by existing event bus subscriptions (`uploadBus`, `photoDeletionBus`, `photoRefreshBus`) which handle real-time updates while the screen is mounted. Pull-to-refresh covers manual reload. Since the Drawer keeps WaveDetail mounted, the screen stays subscribed to all buses even when out of focus.
- **[No rollback needed]** → Pure client-side change, single file affected. Revert is a code revert.
