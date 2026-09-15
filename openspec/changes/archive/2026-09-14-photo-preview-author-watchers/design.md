# Design: Photo Preview Author + Watchers Count

## Context

- `QuickActionsModal` (long-press / ⋮ pill preview) currently renders only the progressive image preview and action buttons. No author, no watchers count.
- The expanded photo card (`src/components/Photo/index.js`, `renderCommentsStats`) already renders an author row (`friendsHelper.getLocalContactName`) and a watchers stat reading `photoDetails?.watchersCount` — which is always 0 because the backend `PhotoDetails` GraphQL type does not return the field.
- Feed items (`Photo` GraphQL type) already carry `watchersCount: Int!` and the owner's `uuid`, and all feed queries select both. `QuickActionsModal` already receives the full `photo` object and already reads `STATE.uuid`; `STATE.friendsList` is a Jotai atom available app-wide.

## Decisions

### D1: Reuse `friendsHelper.getLocalContactName` for the modal author

The modal resolves the author exactly like the expanded card: `getLocalContactName({ uuid, friendUuid: photo.uuid, friendsList })` → `me` | friend contact name | `anonym`. `friendsList` comes from the `STATE.friendsList` atom (no new prop threading). This keeps the label semantics identical in both surfaces by construction.

Alternative considered: add `authorName` to the backend `PhotoDetails` type. Rejected — it duplicates client-side friend-name resolution, adds a backend dependency to a purely client-side concern, and the friends list is already local state.

### D2: Modal watchers count is live-first: `photoDetails?.watchersCount ?? photo?.watchersCount ?? 0`

The modal's info row reads the same fallback chain the expanded card uses (D3): the live details value first, the feed snapshot as the pre-load fallback. This is what makes the count update when the user toggles the bookmark in the modal — `handleFlipWatch` (shared with the expanded card via `usePhotoActions`) optimistically writes the mutation-returned count into the modal's local `photoDetails` state, and the row re-renders from it. Before the backend shipped `PhotoDetails.watchersCount` (see D4), the chain fell through to the snapshot and the modal's toggle-update was impossible without a backend change; post-backend it is free, since the modal already fetches details for the action buttons.

### D3: Expanded card stats use a fallback chain, never a regression

`renderCommentsStats` changes from `photoDetails?.watchersCount || 0` to:
`const watchersCount = photoDetails?.watchersCount ?? photo?.watchersCount ?? 0`.

- Before backend ships: `photoDetails.watchersCount` is undefined → falls back to the feed snapshot (fixes the always-0 display with zero backend dependency).
- After backend ships: live details value wins.
- The `??` chain (not `||`) keeps a legitimate `0` from details from falling through to a stale non-zero snapshot — though in practice a 0 count hides the stat anyway per the existing `(commentsCount > 0 || watchersCount > 0)` guard.

**Implementation correction (found while applying):** the reducer's `getPhotoDetails` normalized the field to `watchersCount: watchersCount ?? 0`, which turns "field absent" (pre-backend) into a literal `0`. A `0` is not nullish, so the `??` fallback above would never trigger and the stat would stay hidden. The reducer therefore returns the raw `watchersCount` (preserving `undefined` when the backend omits the field) so the component can distinguish "no data yet → use feed snapshot" from "backend says 0 → genuinely zero". This is a required part of group 3, not group 4.

Related: `useFeedLoader.js`'s refresh handler set `watchersCount: updated.watchersCount || 0` on the feed item, which clobbered the feed snapshot to `0` after every comment refresh (the details response has no `watchersCount` pre-backend). Since the modal reads `photo.watchersCount` from this same feed item, that would have hidden the modal's watchers count after a comment. Fixed to `updated.watchersCount ?? p.watchersCount ?? 0` (keep the existing snapshot value when the details response omits the field).

### D4: Backend `PhotoDetails.watchersCount` (GATE LIFTED 2026-09-14)

The backend change lives in `Wisaw.cdk` and is outside this workspace. The original hard client rule — **do NOT add `watchersCount` to the `getPhotoDetails` GraphQL selection until the backend ships the field** — held because AppSync rejects a query for a field the schema lacks, which would make the entire details query fail — breaking the action buttons, comments, and bookmark state for every expanded photo. The gate is now lifted: backend commit `061cccc` (on `origin/main`) adds `watchersCount: Int!` to `PhotoDetails`, computed by a read-only `_getWatchersCount(photoId)` helper that excludes the photo owner (`"Watchers"."uuid" != "Photos"."uuid"`), mirroring `_updateWatchers` semantics. The client selection now includes the field; the reducer returns it as-is (it is `Int!`, always a number).

### D5: Modal layout

A single compact row below the preview image (and above the action buttons): author label (left, ellipsized, secondary text color) and the gold bookmark icon + count (right). The row renders as soon as the modal is visible — it depends only on `photo` and the friends atom, not on the details fetch, so it appears in the same frame as the modal. Zero/absent count hides the right-hand indicator; the row still shows the author.

## Backend Prompt (copy-paste for the Wisaw.cdk workspace)

```
/opsx:propose photo-details-watchers-count

Add a per-photo watcher (bookmark) count to the `PhotoDetails` GraphQL type.

Background: the list-feed `Photo` type already has `watchersCount: Int!`
(maintained by `_updateWatchers` on every watch/unwatch, counting Watchers
rows EXCLUDING the photo owner). The details query does not expose it, so the
WiSaw client app cannot show a live "how many times this photo was bookmarked"
figure on the expanded photo card. The client already requests and renders
`photoDetails.watchersCount` — it just always resolves to 0 because the field
does not exist.

Scope:
1. graphql/schema.graphql
   - Add `watchersCount: Int!` to `type PhotoDetails` (alongside comments,
     recognitions, isPhotoWatched, waveName, waveUuid).

2. lambda-fns/controllers/photos/
   - Add a READ-ONLY helper (e.g. `_getWatchersCount(photoId)`) returning the
     watcher count for a photo, EXCLUDING the owner, to match `_updateWatchers`
     semantics (`"Watchers"."uuid" != "Photos"."uuid"`):
       SELECT COUNT(w.id)::int
       FROM "Watchers" w
       JOIN "Photos" p ON p.id = w."photoId"
       WHERE w."photoId" = $1
         AND w."uuid" != p."uuid"
   - Do NOT reuse `getWatchedCount` (that counts a user's bookmarked photos for
     the badge) and do NOT reuse `_updateWatchers` (it is a write).
   - In `getPhotoDetails.ts`, add the count to the existing `Promise.all` and
     return `watchersCount` in the result object (0 when no rows).
   - `getPhotoDetails` must remain read-only (no Watchers mutation).

Acceptance:
- `getPhotoDetails` returns `watchersCount: Int!` equal to the number of
  watchers minus the owner.
- After each `watch`/`unwatch`, the next `getPhotoDetails.watchersCount`
  matches the `Photos.watchersCount` column served by feed queries (±1).
- No behavior change to isPhotoWatched, waveName, waveUuid, comments, or
  recognitions.
```

## Risks

- **Feed snapshot staleness in the modal** (D2): before the details fetch completes, the modal shows the feed-snapshot count, which can lag real time. Acceptable: the snapshot is only visible for the brief load window, after which the row is live and updates on bookmark toggle.
- **Friends list not yet loaded** when the modal first opens: author falls back to `anonym` until `friendsList` populates; the modal re-renders on atom change, so the name appears when the list loads. Same behavior as the expanded card today.
