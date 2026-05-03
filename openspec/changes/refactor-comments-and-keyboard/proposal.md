## Why

The inline comment input on the expanded masonry card has two persistent bugs:

1. **Keyboard hides the input.** The scroll-into-view logic uses a hardcoded 300ms timeout and `measureInWindow` on the masonry container, which returns the full layout height — not the visible area above the keyboard. The input lands behind the keyboard.
2. **Newly added comment renders incorrectly.** An optimistic comment object is injected client-side but lacks `hiddenButtons`, has a fake ID, and doesn't match the shape from `getPhotoDetails`. This causes visual glitches (meta row appears with wrong data, opacity styling, etc.) followed by a 1.5-second flash where the entire `photoDetails` is nulled and refetched.

Both issues degrade the comment-adding experience on the feed.

## What Changes

- **Remove optimistic comment UI entirely.** Stop injecting a fake comment object. Instead, have `submitComment` return the real backend response and append it directly to local state.
- **Fix the mutation selection set.** Request `updatedAt` and `uuid` (in addition to `id`, `comment`, `active`) so the returned object matches the `getPhotoDetails` comment shape. Attach `hiddenButtons: true` client-side.
- **Remove the 1500ms refetch delay and `setPhotoDetails(null)` flash.** The mutation has already succeeded when we get the response — no need to wait for eventual consistency.
- **Replace the 300ms `setTimeout` scroll logic with `Keyboard.addListener('keyboardDidShow')`.** Use the event's `endCoordinates.screenY` as the true viewport bottom boundary and pass it through `onRequestEnsureVisible` so the masonry scroll math is accurate.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `inline-comment-input`: Comment submission waits for the backend round-trip instead of using optimistic UI. Keyboard scroll uses native keyboard events instead of a fixed timeout.

## Impact

- `src/components/Photo/index.js` — Remove optimistic comment state, update submit handlers, replace setTimeout with Keyboard listener.
- `src/components/Photo/reducer.js` — Update `submitComment` to return the real comment with correct shape.
- `src/screens/PhotosList/components/PhotosListMasonry.js` — Update `onRequestEnsureVisible` callback to accept and use `keyboardTop` for accurate scroll math.
