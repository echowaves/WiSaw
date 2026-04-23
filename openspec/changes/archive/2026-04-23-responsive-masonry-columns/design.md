## Context

`PhotosListMasonry` is the shared masonry grid component used by all photo list screens. It wraps `ExpoMasonryLayout` from the local `expo-masonry-layout` library. Currently it hardcodes `columns={2}`, which renders 2 columns regardless of screen width.

The library already supports responsive column configs via the `ColumnsConfig` type: `number | { default: number, [breakpoint: number]: number }`. The `resolveColumnCount()` utility iterates breakpoints ascending and returns the first match where `screenWidth <= breakpoint`, falling back to `default`.

Backend thumbnails are generated at 300px height (proportional width). Local thumbnails use the same 300px height resize. Optimal display size is ~100-130px width to stay within native resolution and avoid blur.

Each parent screen defines a `segmentConfig` with `maxItemsPerRow` and `getResponsiveColumns()` — but this code is dead in column layout mode (only applies to unused row mode).

## Goals / Non-Goals

**Goals:**
- Keep thumbnails crisp across all device sizes by adapting column count to screen width
- Target ~110px column width on the feed screen for dense, sharp thumbnails
- Target ~140-190px column width on comment screens for readable comment text below thumbs
- Clean up dead responsive column code that only applied to row layout mode

**Non-Goals:**
- Changing thumbnail resolution on the backend
- Modifying the expo-masonry-layout library (it already supports this)
- Adding user-configurable column counts or grid density settings
- Changing spacing values between screens

## Decisions

**Decision 1: Pass columns config as a prop to PhotosListMasonry**

The `columns` prop replaces the hardcoded `columns={2}`. Each parent screen passes its own breakpoint config. Default value in PhotosListMasonry is the feed config so existing callers work without changes.

*Alternative considered*: Deriving columns from `segmentConfig.maxItemsPerRow` — rejected because `maxItemsPerRow` is row-mode-only and semantically different from column count.

**Decision 2: Two distinct column profiles**

Feed profile (`PhotosList`): `{ 402: 3, 440: 4, 834: 7, 1024: 9, default: 12 }` — targeting ~110px thumbs, dense grid, no comments visible.

Comment profile (`BookmarksList`, `WaveDetail`, `FriendDetail`): `{ 402: 2, 440: 3, 834: 5, 1024: 7, default: 9 }` — wider columns (~140-190px) to accommodate the 44px comment section below each thumbnail.

*Alternative considered*: Single profile for all screens — rejected because comment sections need wider columns to remain readable.

**Decision 3: Breakpoint values based on real device widths**

- 402px: iPhone 16 Pro (402pt logical width)
- 440px: iPhone 16 Pro Max (440pt logical width) — largest current phone
- 834px: iPad Pro 11" (834pt)
- 1024px: iPad Pro 13" portrait (1024pt)
- default: iPad Pro 13" landscape (1366pt) and larger

*Alternative considered*: Using fewer breakpoints (e.g., just phone/tablet/desktop) — rejected because the Pro Max at 440px needs a distinct column count from smaller phones and tablets.

**Decision 4: Remove dead `getResponsiveColumns`/`maxItemsPerRow` code**

All four screens have `getResponsiveColumns()` functions that compute `maxItemsPerRow` in `segmentConfig`. This code only affects row layout mode which is no longer used. Removing it reduces confusion and dead code.

## Risks / Trade-offs

- [Very small thumbs on phones] At 3 columns on smaller phones (~122px), thumbs are noticeably smaller than the current 2-column layout (~190px). Users may find tap targets smaller. → Mitigation: 122px is still well above the minimum comfortable tap target (44pt). The masonry spacing (5px) provides adequate separation.

- [Column count jumps at breakpoints] When rotating an iPad or resizing, column count changes abruptly (e.g., 7→12 on iPad Pro landscape). → Mitigation: The masonry library handles relayout automatically. The `key={segment-${activeSegment}}` already forces remount on segment changes, and orientation changes trigger a natural re-render via `useWindowDimensions`.

- [Comment readability at 3 columns on Pro Max] At ~141px width, the 44px comment section has limited space for text. → Mitigation: Comments are already `numberOfLines={1}` with ellipsis truncation, and the icon stats (comment count, watcher count) are compact.
