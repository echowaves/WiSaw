## Why

When a user adds a comment to a photo, the backend automatically bookmarks the photo for the commenter. The expanded card fails to reflect this — the bookmark button state (`isPhotoWatched`) doesn't update, and when commenting via the modal input (`app/modal-input.tsx`), the card doesn't refresh at all. This is because the `watchPhoto()` mutation was not awaited, the `emitPhotoRefresh` was called with the wrong argument shape (string instead of `{ photoId }` object), and the modal flow never emitted a refresh event.

## What Changes

- **Await watchPhoto in submitComment**: Add `await` to the `watchPhoto()` call inside `submitComment` so the backend bookmark completes before the refetch fires.
- **Remove stale watchersCount override**: Remove `watchersCount: photo.watchersCount` override in the Photo component's load handler. The `watchersCount` field is not returned by `getPhotoDetails` (not in the `PhotoDetails` backend type), so this override was unnecessary.
- **Add refresh to modal input flow**: After `submitComment` in `app/modal-input.tsx`, call `getPhotoDetails` and await it before `router.back()`, so the expanded card shows updated state when the user returns.
- **Fix emitPhotoRefresh argument**: Ensure `emitPhotoRefresh({ photoId })` is called with the correct object shape instead of `emitPhotoRefresh(photo?.id)` with a raw string.

## Capabilities

### New Capabilities
(None — this is a bug fix, not a new capability.)

### Modified Capabilities
- `comments`: The comment posting flow (modal input) now includes a refresh step after submission. The existing spec already requires `emitPhotoRefresh` but the modal implementation was missing it.
- `photo-refresh-sync`: The expanded card's refresh logic will now correctly reflect `isPhotoWatched` (bookmark state) changes from the backend query. Note: `watchersCount` is not available in the `PhotoDetails` GraphQL type, so bookmark count display will not update without backend schema changes.

## Impact

- **`src/components/Photo/reducer.js`**: Add `await` to `watchPhoto()` call in `submitComment`
- **`src/components/Photo/index.js`**: Remove `watchersCount: photo.watchersCount` override in the `useEffect` load handler, and update inline comment submission handlers to await `getPhotoDetails`
- **`app/modal-input.tsx`**: Add `getPhotoDetails` call after `submitComment`, await it, then `router.back()`
- **No API changes** — the fix works with existing GraphQL schema; no backend changes needed

## Known Limitation

The `watchersCount` field is not available in the `PhotoDetails` GraphQL type. It only exists on the `Photo` type (for list feeds). Bookmark count display will remain at the last known value from the original photo object. To display accurate bookmark count after comment submission, the backend must add `watchersCount` to the `PhotoDetails` type.
