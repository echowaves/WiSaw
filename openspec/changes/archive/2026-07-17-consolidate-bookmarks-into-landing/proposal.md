## Why

Bookmarks lives as a separate drawer screen with its own layout, navigation, and header — duplicating the PhotosList screen structure while sharing the same underlying components. This creates a fragmented UX: users navigate away from the feed to see bookmarks, then navigate back. Consolidating bookmarks as a toggle on the landing screen unifies the experience, eliminates screen duplication, and makes bookmarked content one tap away without leaving the feed.

## What Changes

- **Add feed mode toggle FAB** — New floating action button (stacked above Search FAB on the right) that toggles between geo feed and bookmarks feed. Icon swaps: `🌍 globe-outline` (geo feed, default) ↔ `🔖 bookmark-outline` (bookmarks). Same layout, different data source.
- **Unify layout to bookmark style** — The landing screen adopts `BOOKMARK_LAYOUT_CONFIG` (spacing: 8, square tiles, fewer columns, comments on thumbs) regardless of mode. The geo feed gets the same visual treatment as bookmarks currently has.
- **Remove Bookmarks screen and drawer item** — Delete `app/(drawer)/bookmarks.tsx`, remove the Bookmarks `<Drawer.Screen>` from the drawer layout, and remove `BookmarksDrawerIcon`. The standalone `BookmarksList` component is deleted.
- **Add `isBookmarksMode` atom** — New Jotai atom to track the toggle state. When `true`, the feed calls `requestWatchedPhotos` (segment 1); when `false`, it calls `requestGeoPhotos` (segment 0).
- **Stack two FABs on the right side** — Search FAB moves from bottom-left to bottom-right. Bookmarks toggle FAB sits above it (12px gap). Camera button stays in the footer unchanged.
- **Always show comments on thumbs** — Remove the segment-based `shouldShowComments` logic; comments always render when available (behavior previously exclusive to segment 1).

## Capabilities

### New Capabilities
- `feed-mode-toggle`: FAB toggle component that switches between geo feed and bookmarks modes. Icon swap, state management, reload trigger, and FAB positioning.

### Modified Capabilities
- `search-fab`: Position changes from bottom-left to bottom-right, stacked below the bookmarks FAB.
- `photo-feed`: Layout config changes from `GEO_FEED_LAYOUT_CONFIG` to `BOOKMARK_LAYOUT_CONFIG`. Always shows comments on thumbs. Accepts bookmarks mode toggle.
- `responsive-columns`: Column count for the main feed changes from `{ 402:3, 440:4, 834:7, 1024:9, default:12 }` to `{ 402:2, 440:3, 834:5, 1024:7, default:9 }`.
- `starred-screen`: **BREAKING** — The BookmarksList screen is removed entirely. Navigation to `/(drawer)/bookmarks` no longer exists.
- `drawer-bookmarks-icon`: **BREAKING** — The Bookmarks drawer item is removed. The `BookmarksDrawerIcon` component is deleted.

## Impact

- **Navigation**: Remove `/bookmarks` route from drawer. Any deep links or navigations to bookmarks need to redirect to home with `isBookmarksMode = true`.
- **Components**: `src/screens/BookmarksList/index.js` deleted. `SearchFab` position changes. New `FeedModeToggle` FAB component.
- **State**: New `isBookmarksMode` Jotai atom. Existing `bookmarksCount` atom still used for header indicator.
- **Layout**: Visible change to geo feed — larger tiles, fewer columns, square aspect ratio, comments shown. This is the biggest UX impact.
- **Drawer**: One fewer screen. `BookmarksDrawerIcon` and drawer `<Drawer.Screen>` removal in `_layout.tsx`.
