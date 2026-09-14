# Tasks: Photo Preview Author + Watchers Count

## 1. QuickActionsModal — author identity row

- [x] 1.1 In `src/components/QuickActionsModal/index.js`, read `friendsList` from the `STATE.friendsList` Jotai atom and import `friendsHelper` from `src/screens/FriendsList/friends_helper`
- [x] 1.2 Compute `authorName` via `friendsHelper.getLocalContactName({ uuid, friendUuid: photo.uuid, friendsList })` (same call the expanded card uses in `Photo/index.js` `renderCommentsStats`)
- [x] 1.3 Render a compact info row below the preview image container and above `PhotoActionButtons`: author label on the left (secondary text color, single line, tail ellipsis), right-aligned gold bookmark indicator when `photo.watchersCount > 0`
- [x] 1.4 Verify the row renders while details are still loading (it must not be gated on `photoDetails` / `loading`)

## 2. QuickActionsModal — watchers count

- [x] 2.1 In the same info row, show `Ionicons name='bookmark'` (gold `#FFD700`, matching the feed thumb and expanded-card stats) + the resolved watchers count when the value is greater than zero
- [x] 2.2 Ensure the indicator is hidden when `watchersCount` is zero, absent, or non-numeric
- [x] 2.3 Confirm the modal layout does not reflow the action buttons when the row appears (row is rendered in the same frame the modal opens — no animation between states)
- [x] 2.4 Row reads `photoDetails?.watchersCount ?? photo?.watchersCount ?? 0` (live-first, matching the expanded card) so that toggling the bookmark in the modal updates the displayed count immediately — `handleFlipWatch` writes the mutation-returned count into the modal's `photoDetails` state (fix for reported miss: count was stale because the row originally read only the `photo` prop)

## 3. Expanded photo card — watchers fallback

- [x] 3.1 In `src/components/Photo/index.js` `renderCommentsStats`, change `const watchersCount = photoDetails?.watchersCount || 0` to `const watchersCount = photoDetails?.watchersCount ?? photo?.watchersCount ?? 0`
- [x] 3.2 Verify pre-backend behavior: details fetch returns no `watchersCount` → stat shows the feed-snapshot count (previously always 0)
- [x] 3.3 Verify the existing `(commentsCount > 0 || watchersCount > 0)` guard still hides the stats row when both are zero

## 4. Backend `Wisaw.cdk` shipping `PhotoDetails.watchersCount` (GATE LIFTED 2026-09-14, backend commit `061cccc` on `origin/main`)

- [x] 4.1 Add `watchersCount` to the `getPhotoDetails` GraphQL selection in `src/components/Photo/reducer.js`. Verified the backend resolver returns `watchersCount: Int!` from a read-only `_getWatchersCount` helper that excludes the photo owner (mirrors `_updateWatchers` semantics)
- [x] 4.2 Verify post-backend behavior: expanded card shows the live details count; after toggling the bookmark, the count updates on the next details refetch — confirmed `handleFlipWatch` optimistically sets `photoDetails.watchersCount` from the `watchPhoto`/`unwatchPhoto` mutation return (backend returns the updated owner-excluded count), and comment-submit refetches keep it current

## 5. Verification

- [ ] 5.1 Long-press a own photo → modal shows `me`; a friend's photo → friend's contact name; an unknown user's photo → `anonym`
- [ ] 5.2 ⋮ pill tap shows the identical author row (same `onLongPress` path)
- [ ] 5.3 Modal and expanded card show the same watchers count for the same photo at the same moment (both use the live-first `photoDetails?.watchersCount ?? photo?.watchersCount` chain); also verify: toggling the bookmark inside the modal updates the modal's count without closing it
- [ ] 5.4 Zero-bookmark photo: no gold bookmark indicator in the modal row and no stats row in the expanded card
- [x] 5.5 `openspec validate photo-preview-author-watchers` passes

## 6. Backend handoff (out of this repo)

- [x] 6.1 Hand the backend prompt in `design.md` ("Backend Prompt" section) to the `Wisaw.cdk` workspace to add `PhotoDetails.watchersCount` — done, backend commit `061cccc`
- [ ] 6.2 Update `photo-refresh-sync` spec notes via archive (group 4 already complete; the delta's MODIFIED requirements sync the corrected notes at archive time)
