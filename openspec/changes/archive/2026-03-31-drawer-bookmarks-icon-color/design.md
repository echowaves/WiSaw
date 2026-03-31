## Context

The drawer layout has three activity-bearing items (Identity, Friends, Waves) that now use `MAIN_COLOR` when the feature has activity. Bookmarks is the remaining item that lacks this treatment. The backend recently added `getWatchedCount(uuid: String!): Int!` which returns the count of active watched photos for a user. The `WaveHeaderIcon` already fetches `wavesCount` and `ungroupedPhotosCount` in a `Promise.all` on mount — this is the natural place to add the bookmarks count fetch.

## Goals / Non-Goals

**Goals:**
- Add `bookmarksCount` global atom and reducer function following the `wavesCount` pattern.
- Fetch bookmarks count eagerly in `WaveHeaderIcon`'s `Promise.all` so the value is ready before the drawer opens.
- Create `BookmarksDrawerIcon` with `MAIN_COLOR` when bookmarks exist and item is not focused.

**Non-Goals:**
- Adding a badge/dot to the bookmarks icon (no unread concept for bookmarks).
- Changing the bookmarks screen behavior.
- Real-time bookmark count updates (count refreshes on next app load, same as waves).

## Decisions

**Fetch in WaveHeaderIcon's Promise.all**
Adding `getBookmarksCount` to the existing `Promise.all([getWavesCount, getUngroupedPhotosCount])` keeps a single fetch point and ensures the value is available before the drawer is ever opened. The guard `if (wavesCount !== null || !uuid) return` already prevents re-fetching — `bookmarksCount` will ride the same lifecycle.

**Alternative considered**: Fetching in the drawer icon itself. Rejected because all other counts are fetched eagerly in the header icon, and fetching lazily would mean the icon stays grey until the drawer is opened.

**Place reducer function in Waves/reducer.js**
The `getWavesCount` and `getUngroupedPhotosCount` functions already live there. Adding `getBookmarksCount` keeps count-related queries co-located and avoids a new file.

**Follow IdentityDrawerIcon/FriendsDrawerIcon pattern for the drawer icon**
Use `focused` prop to avoid MAIN_COLOR clashing with the active tint (white on coral). Consistent with all other drawer icons.

## Risks / Trade-offs

- [Extra API call on mount] → One additional lightweight count query added to the existing `Promise.all`. Negligible latency impact since all three run in parallel.
- [Stale count] → Same as waves: count is fetched once and cached in the atom until `null`-reset triggers refetch. Acceptable for a visual indicator.
