## Why

The Friends and Waves drawer icons now use `MAIN_COLOR` when the feature has activity, matching their header icon counterparts. The Bookmarks drawer icon still uses the default drawer tint, even when the user has bookmarked photos. A new backend query `getWatchedCount(uuid): Int!` is now available. Adding the same conditional coloring to the Bookmarks drawer icon completes the pattern across all activity-bearing drawer items.

## What Changes

- Add a `bookmarksCount` Jotai atom to global state (init: `null`).
- Add a `getBookmarksCount` reducer function calling the `getWatchedCount` GraphQL query.
- Fetch `bookmarksCount` alongside `wavesCount` and `ungroupedPhotosCount` in `WaveHeaderIcon`'s `Promise.all`.
- Create a `BookmarksDrawerIcon` inline component with `MAIN_COLOR` when `bookmarksCount > 0 && !focused`.
- Wire the Bookmarks `Drawer.Screen` to use `BookmarksDrawerIcon`.

## Capabilities

### New Capabilities

- `drawer-bookmarks-icon`: Bookmarks drawer icon with conditional color — `MAIN_COLOR` when user has bookmarks, default color otherwise.

### Modified Capabilities

- `wave-header-icon`: Add `bookmarksCount` fetch to the existing `Promise.all` in `WaveHeaderIcon`.

## Impact

- `src/state.js` — new `bookmarksCount` atom
- `src/screens/Waves/reducer.js` — new `getBookmarksCount` function
- `src/components/WaveHeaderIcon/index.js` — add `bookmarksCount` to fetch and atom write
- `app/(drawer)/_layout.tsx` — new `BookmarksDrawerIcon` component, update Bookmarks `Drawer.Screen`
