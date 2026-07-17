# Design: Consolidate Bookmarks into Landing Screen

## Context

Currently the app has two separate screens for viewing photo feeds:
- **PhotosList** (home/landing) — geo-filtered feed, compact tiles, no comments, 12 max columns
- **BookmarksList** (drawer nav) — watched photos, larger tiles, comments shown, 9 max columns

Both screens are ~90% identical in structure: same hooks (`useFeedLoader`, `useFeedSearch`, `usePhotoExpansion`), same components (`PhotosListMasonry`, `SearchFab`, `PhotosListFooter`, `AppHeader`), same patterns. The only differences are the data source (`requestGeoPhotos` vs `requestWatchedPhotos`), the layout config, and the column count.

The `activeSegment` prop on `PhotosListMasonry` already encodes this distinction:
- `0` = geo feed → no comments on thumbs
- `1` = watched feed → comments on thumbs

The `getPhotos()` multiplexer in `src/screens/PhotosList/reducer.js` already routes by `activeSegment` to the correct query.

## Goals / Non-Goals

**Goals:**
- Single landing screen with a toggle FAB to switch between geo feed and bookmarks feed
- Unified layout (bookmark style) for both modes — same columns, same comments, same tile size
- Remove BookmarksList screen and drawer item entirely
- Minimal code duplication — leverage existing `activeSegment` pattern
- No backend changes required

**Non-Goals:**
- Changing WaveDetail, FriendDetail, or other screens that use `BOOKMARK_LAYOUT_CONFIG`
- Changing the quick-actions modal or bookmark toggle on individual photos
- Removing the `bookmarksCount` atom (still used for header indicator)
- Merging layout configs (WaveDetail/FriendDetail keep their own configs)

## Decisions

### 1. State: `isBookmarksMode` Jotai atom

A new boolean atom in `src/state.js` defaults to `false` (geo feed). When toggled, the PhotosList screen reloads with the opposite `activeSegment`. This is simpler than a local state because the toggle FAB lives in a separate component.

### 2. Toggle FAB as standalone component

New `FeedModeToggleFAB` component in `src/components/FeedModeToggleFAB/`:
- Same FAB size (56x56) as `SearchFab`
- Positioned on the right side, above the Search FAB (12px gap)
- Icon swap: `ion globe-outline` (geo, default) ↔ `ion bookmark-outline` (bookmarks)
- On press: toggles `isBookmarksMode`, triggers `reload()`
- No expansion behavior (unlike Search FAB — it's a pure toggle)

### 3. Search FAB position change

`SearchFab` moves from bottom-left to bottom-right. The component itself is generic (positioning is controlled by parent via CSS or props). Two approaches considered:

| Approach | Pros | Cons |
|----------|------|------|
| A: Add `position` prop to SearchFab | Backward compat, explicit | More props |
| B: Change default positioning in SearchFab | Simple, one screen uses it | Breaking if other screens used it |

**Decision: B** — SearchFab is only used by PhotosList and BookmarksList (which is being deleted). No backward compat concern. Change the positioning directly in the component from left-aligned to right-aligned.

### 4. Two FABs stacked on the right

```
┌─────────────────────────────────────┐
│                                     │
│             ┌──────┐                │
│             │ 🌍   │  FeedModeToggle│
│             └──────┘                │
│             │   12px   │             │
│             ┌──────┐   │             │
│             │ 🔍   │   │ SearchFab   │
│             └──────┘   │             │
│                         │             │
│  ────────────────────────────────   │
│  [Footer]                      │
└─────────────────────────────────────┘
```

Both FABs use `position: absolute` with `right: 16`. The Search FAB bottom = `FOOTER_HEIGHT + 16`. The Toggle FAB bottom = `FOOTER_HEIGHT + 16 + FAB_SIZE + 12` = `FOOTER_HEIGHT + 84`.

### 5. Layout unification — always `BOOKMARK_LAYOUT_CONFIG`

PhotosList adopts `BOOKMARK_LAYOUT_CONFIG` and the comment-screen column profile. This means:
- Spacing: 5 → 8
- Base height: 100 → 200
- Aspect ratios: varied → square only (1.0)
- Columns: `{ 402:3, 440:4, 834:7, 1024:9, default:12 }` → `{ 402:2, 440:3, 834:5, 1024:7, default:9 }`
- Comments: segment-dependent → always shown

### 6. `activeSegment` always driven by `isBookmarksMode`

Instead of the segment being a local concept, it becomes:
```js
const activeSegment = isBookmarksMode ? 1 : 0
```

The `getPhotos()` multiplexer already handles both segments. The `useFeedLoader` hook already accepts a `fetchFn` — we switch the fetch function based on mode.

### 7. BookmarksList deletion

Safe to delete because:
- No deep links point to `/bookmarks` (no evidence in codebase)
- No other components import it
- The drawer screen is the only consumer

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| Geo feed with square tiles looks wrong for landscape photos | `aspectRatioFallbacks: [1.0]` is already proven on bookmarks. If it looks bad for geo photos, we can add more ratios back. |
| Location-dependent states (pending, denied) vs bookmarks mode | If user toggles to bookmarks mode while location is pending, bookmarks don't need location — just show the feed. If toggling back to geo, show location state. |
| FAB stack with expanding search FAB | When Search FAB expands, it grows leftward. The toggle FAB above should remain unaffected. The expand animation is horizontal only. |
| Users accustomed to bookmarks as a separate screen | One-tap toggle is faster than drawer navigation. The transition is cleaner. |
| `GEO_FEED_LAYOUT_CONFIG` becomes unused | Remove from `src/consts.js` after migration. |

## Migration Plan

1. Add `isBookmarksMode` atom to `src/state.js`
2. Create `FeedModeToggleFAB` component
3. Update `SearchFab` to right-align
4. Update `PhotosList` to use `BOOKMARK_LAYOUT_CONFIG`, new columns, always-show-comments
5. Wire `activeSegment` to `isBookmarksMode` in PhotosList
6. Render both FABs in PhotosList
7. Remove `BookmarksList` screen and drawer item
8. Remove `BookmarksDrawerIcon` from drawer layout
9. Delete `src/screens/BookmarksList/`
10. Delete `GEO_FEED_LAYOUT_CONFIG` from `src/consts.js`
11. Update `responsive-columns` default in `PhotosListMasonry`

## Open Questions

- Should the toggle FAB show a count badge when in bookmarks mode (like the drawer icon did)? Probably not — the FAB is always visible, the icon swap is the signal.
