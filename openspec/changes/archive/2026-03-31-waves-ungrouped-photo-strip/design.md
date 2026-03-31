## Context

The Waves list (`WavesHub`) displays waves in a FlatList with `WaveCard` items. Each card shows a static 4-photo collage from `listWaves` inline `photos` field. Ungrouped photos are only surfaced as a count (badge on WaveHeaderIcon, label in kebab menu). The backend now provides `feedForUngrouped(uuid, pageNumber, batch, searchTerm)` returning `PhotoFeed` and `feedForWave(waveUuid, pageNumber, batch, searchTerm)` also returning `PhotoFeed`, both paginated at 100 items per page.

## Goals / Non-Goals

**Goals:**
- Show ungrouped photos as a visually distinct card at the top of Waves list with horizontal scrolling and pagination
- Replace static 4-photo collage in WaveCard with a horizontal scrollable strip that lazy-loads more photos
- Create a shared `WavePhotoStrip` component reusable across ungrouped card and wave cards
- Provide clear CTA for auto-grouping directly on the ungrouped card

**Non-Goals:**
- Manual photo-to-wave assignment from the ungrouped card (future work)
- Full-screen ungrouped photos view/screen
- Modifying the WaveDetail screen
- Search within the ungrouped card strip

## Decisions

**Shared WavePhotoStrip over separate implementations:**
Both the ungrouped card and wave cards need the same horizontal scroll + pagination behavior. A shared component accepts a `fetchFn(pageNumber, batch)` and renders thumbnails in a horizontal FlatList. This avoids duplicating pagination logic. The ungrouped card passes `requestUngroupedPhotos`, wave cards pass a curried `fetchWavePhotos(waveUuid)`.

**ListHeaderComponent for ungrouped card over prepending to data array:**
Using `ListHeaderComponent` on the FlatList avoids interfering with `numColumns` grid layout and keeps the ungrouped card full-width regardless of column count. It also simplifies conditional rendering (just omit the header when count is 0).

**Lazy-load wave card photos over expanding listWaves response:**
Wave cards use the 4 inline photos from `listWaves` as initial data. `feedForWave` is called only when the user scrolls the strip horizontally, keeping the initial list load fast.

**CachedImage thumbnails at fixed square size:**
Each thumbnail in the strip uses `CachedImage` (already used in WaveCard collage) at a fixed square size (e.g., 80x80) for consistent layout. The strip height is fixed, making the card height predictable.

**Ungrouped card hides reactively via Jotai state:**
`STATE.ungroupedPhotosCount` already exists and updates after auto-group. The card simply checks `ungroupedPhotosCount > 0` to decide visibility. After `emitAutoGroupDone`, the count updates and the card disappears.

## Risks / Trade-offs

- [Performance] Each visible WaveCard could fire a `feedForWave` request on horizontal scroll — mitigated by only fetching when `onEndReached` fires (not on mount). Initial 4 photos are free from `listWaves`.
- [Visual complexity] Horizontal scrolling inside vertical scrolling can feel awkward — mitigated by fixed-height strip with clear visual boundaries and smooth `FlatList` nesting.
