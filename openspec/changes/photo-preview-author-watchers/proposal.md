# Photo Preview Author + Watchers Count

## Why

The long-press photo preview (`QuickActionsModal`) shows only the image and action buttons — the user cannot tell who took the photo (me, a friend by name, or anonymous) without expanding it. The watchers (bookmark) count is also absent from the preview and from the expanded photo details, even though the app already renders a `watchersCount` stat that is permanently 0 because the backend `PhotoDetails` GraphQL type does not return the field (the list-feed `Photo` type does).

## What Changes

- `QuickActionsModal` gains a compact info row below the preview image showing the photo author's identity, resolved with the existing `friendsHelper.getLocalContactName` semantics: `me` (own photo), the friend's contact name (friend's photo), or `anonym` (unknown/anonymous).
- `QuickActionsModal` gains a watchers count display (gold bookmark icon + number) that shows the live `photoDetails.watchersCount` once loaded and updates immediately when the user toggles the bookmark in the modal, falling back to the feed-snapshot `photo.watchersCount` before details load.
- The expanded photo card's stats row switches from the always-0 `photoDetails.watchersCount` to a fallback chain: `photoDetails.watchersCount` when present (live, post-backend), else the feed snapshot `photo.watchersCount`.
- **Gated on backend**: `watchersCount` is added to the client `getPhotoDetails` GraphQL selection ONLY after the backend ships the field on `PhotoDetails` (requesting it earlier would make the server reject the entire details query, breaking action buttons and comments). A copy-paste backend prompt for `Wisaw.cdk` is captured in `design.md`.
- `photo-refresh-sync` spec note about `watchersCount` being unavailable is corrected to reflect the fallback behavior and the post-backend live value.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `quick-actions-modal`: new requirements — author identity row in the preview, watchers count display in the preview.
- `expanded-photo-card`: new requirement — stats row displays the watchers (bookmark) count, live from details when the backend returns it, otherwise from the feed snapshot.
- `photo-refresh-sync`: note correction — bookmark count display reflects `getPhotoDetails.watchersCount` once the backend returns it, falling back to the feed snapshot until then.

## Impact

- `src/components/QuickActionsModal/index.js` — author row + watchers count rendering.
- `src/components/Photo/index.js` — `renderCommentsStats` watchers fallback.
- `src/components/Photo/reducer.js` — `watchersCount` added to the `getPhotoDetails` selection (gated task, backend-dependent).
- Backend (out of this repo): `PhotoDetails.watchersCount: Int!` in `Wisaw.cdk` — see prompt in `design.md`.
- No new dependencies. No breaking changes.
