## Why

Several screens show an empty state when no photos are found, but these screens use a plain `ScrollView` with no `RefreshControl`, leaving users with no way to refresh. On the global photos screen, the action button is misleadingly labeled "Take a Photo" but actually calls `reload()`. This erodes trust and leaves users stuck with no path to retry.

## What Changes

- Add `RefreshControl` to all empty-state `ScrollView` wrappers (PhotosList, BookmarksList)
- Fix the "Take a Photo" button label on the global photos empty state to accurately reflect that it refreshes the feed (rename to "Refresh" with a secondary button to open the camera)
- Add a pull-to-refresh affordance and a "Refresh" action button to the FriendDetail empty state
- Normalize the pattern: all empty states that can recover via reload must support both pull-to-refresh and an explicit button

## Capabilities

### New Capabilities

- `empty-state-refresh`: Consistent refresh behavior on all empty-state screens — pull-to-refresh gesture supported, action button accurately labeled, `refreshing` state shown during reload

### Modified Capabilities

- `photo-feed`: Empty state for global photos gets pull-to-refresh and corrected action label
- `friend-photo-feed`: Empty state for friend detail screen gets pull-to-refresh and a refresh action
- `bookmarks`: (via BookmarksList) offline empty state already has "Try Again" but the non-offline empty state on BookmarksList has no refresh path

## Impact

- `src/screens/PhotosList/components/PhotosListEmptyState.js` — add `RefreshControl`, fix label, add secondary camera CTA
- `src/screens/FriendDetail/index.js` — add refresh capability to empty state branch
- `src/screens/BookmarksList/index.js` — verify empty state has pull-to-refresh parity
- No API changes, no new dependencies, no breaking changes
