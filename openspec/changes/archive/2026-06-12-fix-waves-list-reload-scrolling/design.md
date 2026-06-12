## Context

The `WavePhotoStrip` component renders a horizontal scrollable list of photo thumbnails within wave cards on the waves list screen. It uses a `FlatList` with pagination support via `onEndReached` to load additional photos as the user scrolls.

The component currently has an auto-scroll feature that scrolls to the end after successfully fetching and appending new photos during pagination. This is controlled by:
- `userHasScrolled` ref: Tracks whether the user has physically scrolled (to avoid auto-scroll on initial mount from empty state)
- `autoScrollTrigger` state: When set, triggers `scrollToEnd()` in a `useEffect`

**Current Bug**: When the parent waves list screen reloads (after upload, auto-group, or manual refresh), all wave cards receive new `initialPhotos` data. The `WavePhotoStrip` component's `useEffect` that syncs `initialPhotos` resets internal state but **does not reset** the `userHasScrolled` ref or `autoScrollTrigger` state. This causes:
1. `userHasScrolled.current` remains `true` from previous mount/scroll
2. On reload, when `onEndReached` fires (even on empty or new data), the condition `if (userHasScrolled.current)` is true
3. `autoScrollTrigger` is set, causing `scrollToEnd()` to execute
4. Photos appear scrolled to the right instead of starting at position 0

## Goals / Non-Goals

**Goals:**
- Fix the reload scrolling bug by resetting scroll state when `initialPhotos` changes
- Preserve the existing auto-scroll behavior for genuine pagination scenarios
- Maintain backward compatibility with existing wave card behavior

**Non-Goals:**
- Changing the auto-scroll logic for legitimate pagination use cases
- Modifying the FlatList key or forcing full unmount/remount of components
- Altering the horizontal scroll direction or thumbnail layout

## Decisions

**Decision 1: Reset ref and state in the `initialPhotos` useEffect**

*Approach*: Modify the existing `useEffect` that syncs `initialPhotos` to also reset `userHasScrolled.current` and `setAutoScrollTrigger(false)`.

*Rationale*: This is the minimal, focused fix. The `useEffect` already resets other state (`photos`, `pageNumber`, `noMoreData`, `stopLoading`), so adding ref/state reset is consistent with the existing pattern. It directly addresses the root cause: stale state persisting across prop updates.

*Alternatives considered*:
- Adding a `key` prop to `WavePhotoStrip` to force remount: More invasive, affects component hierarchy, could cause performance issues with frequent reloads
- Using `FlatList`'s `initialNumToRender` or `initialScrollIndex`: Doesn't address the ref persistence issue
- Checking if `photos.length === 0` before auto-scroll: Would disable auto-scroll on first page load even when there are photos

**Decision 2: Reset `autoScrollTrigger` alongside `userHasScrolled`**

*Rationale*: The `autoScrollTrigger` state machine depends on `userHasScrolled`. If we only reset `userHasScrolled` but not `autoScrollTrigger`, a stale trigger could still fire. Both must be reset together to ensure a clean initial state.

**Decision 3: Use `setAutoScrollTrigger(false)` instead of `useState` initialization**

*Rationale*: The `autoScrollTrigger` state is already managed via `useState`. Calling the setter in the `useEffect` is consistent with React patterns and ensures the effect has access to the setter function.

## Risks / Trade-offs

[Risk] **Auto-scroll behavior might change for edge cases**  
*Mitigation*: The reset only occurs when `initialPhotos` changes. Normal pagination (user scrolls to end, loads next page) will still trigger `userHasScrolled.current = true` via `onMomentumScrollEnd`, preserving the existing auto-scroll behavior for pagination.

[Risk] **Race condition with FlatList scroll position**  
*Mitigation*: The FlatList re-renders with the same `data={photos}` array reference (after deduplication in `handleLoadMore`), so React Native's FlatList should handle the update efficiently. Resetting scroll state immediately when photos change ensures the FlatList starts from a known position.

[Risk] **Performance impact of additional state updates**  
*Mitigation*: `setAutoScrollTrigger(false)` is a no-op when already `false`. The `useEffect` runs only when `initialPhotos` changes, which happens on reload (infrequent compared to scroll events).

## Migration Plan

No migration needed. This is a bug fix within a single component. The change is backward compatible and only affects the reload scenario that was previously buggy.

## Open Questions

None. The fix is well-defined and focused on a specific bug.
