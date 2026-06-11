# Fix Photo Card Refresh on Comment - Design

## Context

The current code flow has three bugs preventing the expanded photo card from showing updated bookmark state after a comment is added:

1. **`submitComment()` fires `watchPhoto()` without `await`** — The backend auto-bookmarks the photo when a comment is created. The frontend calls `watchPhoto()` to sync this state, but does so asynchronously without waiting. The subsequent `emitPhotoRefresh` fires before the bookmark mutation completes, so `getPhotoDetails` returns stale values.

2. **`getPhotoDetails` returns `watchersCount` but it's overwritten** — The `useEffect` in `Photo/index.js` fetches photo details including `watchersCount` from the backend, then immediately overwrites it with `photo.watchersCount` (the original object from the feed list). This means the refresh always shows the old count.

3. **Modal input flow emits no refresh** — `app/modal-input.tsx` calls `submitComment()` then `router.back()` without emitting `emitPhotoRefresh`. The expanded card never knows to re-fetch.

The existing `handleFlipWatch` hook already demonstrates the correct pattern: await the mutation, re-fetch `getPhotoDetails`, spread the result into `photoDetails` state, then emit refresh.

## Goals / Non-Goals

**Goals:**
- Expanded photo card shows correct `isPhotoWatched` (bookmark state) after comment submission
- Modal input flow refreshes the expanded card before navigating back
- `watchPhoto` completes before refetch triggers
- No stale data overwrite on refresh

**Non-Goals:**
- Thumbnail card (feed list) refresh — out of scope for this change
- Optimistic updates — not needed; the fix ensures the actual data is correct
- Backend schema changes — `watchersCount` is not available in `PhotoDetails` GraphQL type

**Known Limitation:**
The `watchersCount` field is not returned by the `getPhotoDetails` GraphQL query. It only exists on the `Photo` type (for list feeds), not on `PhotoDetails`. Bookmark count display will remain at the last known value from the original photo object. To display accurate bookmark count after comment submission, the backend must add `watchersCount` to the `PhotoDetails` type.

## Decisions

### 1. Await `watchPhoto` in `submitComment`
**Why:** The bookmark must be persisted before we refetch. The backend processes `createComment` and `watchPhoto` sequentially, so the refetch needs to happen after both complete.

**Alternative considered:** Remove `watchPhoto` entirely and rely on `getPhotoDetails` to return the correct `isPhotoWatched`. But `watchPhoto` is the mutation that triggers the backend logic — we can't skip it.

### 2. Remove `watchersCount` override in Photo load handler
**Why:** The GraphQL query `getPhotoDetails` does not return `watchersCount` (it's not in the `PhotoDetails` backend type). Removing the override prevents the code from trying to use a field that doesn't exist.

**Known Limitation:** `watchersCount` is not available in the `PhotoDetails` GraphQL type. Only `isPhotoWatched` is returned, which is sufficient to update the bookmark button state (filled/empty icon). Bookmark count display will remain at the last known value from the original photo object.

**Alternative considered:** Add `watchersCount` to the `getPhotoDetails` query. This was tested and failed with GraphQL error `Field 'watchersCount' in type 'PhotoDetails' is undefined`, confirming the backend doesn't support this field on `PhotoDetails`.

### 3. Add refresh to modal input before `router.back()`
**Why:** The user returns to the expanded card immediately after dismissing the modal. They need to see the updated state.

**Alternative considered:** Emit refresh before `router.back()` and let the existing event bus handler re-fetch. But this adds a race condition — the component might unmount before the effect fires. Explicitly awaiting `getPhotoDetails` ensures the state is updated before navigation.

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| `router.back()` timing — modal might close before refresh completes | The await is synchronous from the user's perspective; the navigation happens after state is set. Visual difference is negligible (~100-200ms). |
| Adding `await` to `watchPhoto` could slow comment submission if the mutation is slow | `watchPhoto` is a lightweight mutation (increment counter). The network round-trip is the same as the existing `emitPhotoRefresh` refetch. Net latency change is minimal. |
| Removing the `watchersCount` override might break initial load if `getPhotoDetails` returns null | `getPhotoDetails` returns the value from the backend; it's never null for existing photos. The initial `photo.watchersCount` was only needed as a fallback when the query didn't return it — but it does now. |

## Open Questions

None — the fix is straightforward, and `handleFlipWatch` provides a proven reference implementation.
