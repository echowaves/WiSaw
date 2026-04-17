## Context

Empty states in WiSaw are rendered when a list screen loads with zero results. Currently, `PhotosListEmptyState` wraps its content in a plain `ScrollView` with no `RefreshControl` — meaning the pull-to-refresh gesture that users naturally expect on a list screen does not work. The action button on the global photos empty state is labeled "Take a Photo" but calls `reload()`, not the camera. `FriendDetail` renders a completely static empty state card with no refresh path at all.

`WavesHub` already handles this correctly: its empty state lives inside a `FlatList` with `onRefresh` / `refreshing` props, so pull-to-refresh works even when empty. The Photos screens diverged from this pattern when `PhotosListEmptyState` was extracted as a separate component.

## Goals / Non-Goals

**Goals:**
- Pull-to-refresh gesture works on every empty state that supports reload
- Action button labels accurately describe what they do
- Global photos empty state exposes the camera as a distinct secondary action
- FriendDetail empty state has a refresh button and pull-to-refresh
- BookmarksList empty state (non-offline path, if any) has parity

**Non-Goals:**
- Changing the visual design of `EmptyStateCard`
- Adding new empty states for screens that don't have them
- Refactoring WavesHub (already correct)
- Adding offline detection to FriendDetail (separate concern)

## Decisions

### D1: Add `RefreshControl` to `ScrollView` in `PhotosListEmptyState`

`PhotosListEmptyState` uses a `ScrollView`. We add a `RefreshControl` prop accepting `refreshing` (bool) and `onRefresh` (function) passed in from the parent. The parent (`PhotosList/index.js`) already has `reload` and a `loading` state — we thread these through.

**Alternative considered**: Replace `ScrollView` with a single-item `FlatList` (like WavesHub). Rejected — `ScrollView` is fine here, `RefreshControl` is simpler and doesn't require the data model change.

### D2: Fix the "Take a Photo" label — rename to "Refresh" with a secondary camera CTA

The action button becomes "Refresh" (calls `reload()`). A secondary button "Take a Photo" is added using `EmptyStateCard`'s already-present `secondaryActionText` / `onSecondaryActionPress` props — it calls a passed-in `onCameraPress` handler. No new component changes needed; `EmptyStateCard` already supports two buttons.

### D3: `FriendDetail` — add `RefreshControl` around its empty state `ScrollView`

`FriendDetail` renders `EmptyStateCard` directly in a `View` when `photos.length === 0 && !loading`. We wrap this in a `ScrollView` with `RefreshControl` and add an `actionText="Refresh"` prop to the card.

### D4: `BookmarksList` — verify non-offline empty state path

`BookmarksList` reaches its empty state only after content has loaded with zero results. It currently falls through to... nothing — no explicit `length === 0` empty state exists outside the offline branch. We add one consistent with the pattern.

## Risks / Trade-offs

- [Label change on "Take a Photo"] Users who learned to tap this button to open camera will find it changed. Mitigation: secondary button is visually present and labeled, intent is preserved.
- [ScrollView wrapping FriendDetail empty state] Minor layout change — the empty state card becomes scrollable. Visual appearance is unchanged since `EmptyStateCard` is centered via `flex: 1 + justifyContent: center`.
- [refreshing state in PhotosListEmptyState] Parent must pass `refreshing` bool to avoid the spinner appearing indefinitely. The existing `loading` state is the right source.
