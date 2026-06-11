## Why

When a user adds a comment to a photo, the backend automatically bookmarks the photo for the commenter. The expanded card fails to reflect this — the bookmark count (`watchersCount`) stays stale, and when commenting via the modal input (`app/modal-input.tsx`), the card doesn't refresh at all. This is because `watchersCount` from the GraphQL query is overwritten by a stale value from the original photo object, and the modal flow never emits a refresh event.

## What Changes

- **Fix watchersCount overwrite**: Stop overwriting `watchersCount` with `photo.watchersCount` in the Photo component's load handler, allowing the value from `getPhotoDetails` to stand.
- **Await watchPhoto in submitComment**: Add `await` to the `watchPhoto()` call inside `submitComment` so the backend bookmark completes before the refetch fires.
- **Add refresh to modal input flow**: After `submitComment` in `app/modal-input.tsx`, call `emitPhotoRefresh` and await `getPhotoDetails` before `router.back()`, so the expanded card shows updated state when the user returns.

## Capabilities

### New Capabilities
(None — this is a bug fix, not a new capability.)

### Modified Capabilities
- `comments`: The comment posting flow (modal input) now includes a refresh step after submission. The existing spec already requires `emitPhotoRefresh` but the modal implementation was missing it.
- `photo-refresh-sync`: The expanded card's refresh logic will now correctly reflect `watchersCount` changes from the backend query, not just comment list changes.

## Impact

- **`src/components/Photo/reducer.js`**: Add `await` to `watchPhoto()` call in `submitComment`
- **`src/components/Photo/index.js`**: Remove `watchersCount: photo.watchersCount` override in the `useEffect` load handler
- **`app/modal-input.tsx`**: Add `emitPhotoRefresh` + `getPhotoDetails` call after `submitComment`, before `router.back()`
- **No API changes** — `getPhotoDetails` already returns `watchersCount`; we just stop discarding it
