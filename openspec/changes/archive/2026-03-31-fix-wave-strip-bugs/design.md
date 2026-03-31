## Context

WavePhotoStrip is a shared horizontal FlatList component used in WaveCard and UngroupedPhotosCard. It receives `initialPhotos` (from `listWaves`) and a `fetchFn` for pagination. The component creates its own `batch` UUID, but never uses it for page 0 — `initialPhotos` were fetched under a different batch by `listWaves`. When `onEndReached` fires and the component requests page 1 with its own batch, the server has no page-0 context for that batch, causing unpredictable results or premature `noMoreData`.

Photos in the strip currently render as plain `CachedImage` with no touch handlers. Users expect long-press on a photo to open the wave context menu, consistent with the info bar behavior.

## Goals / Non-Goals

**Goals:**
- Fix pagination by fetching page 0 through `fetchFn` with the component's batch, then appending results (deduplicating against `initialPhotos`)
- Add per-thumbnail long-press support via a callback prop

**Non-Goals:**
- Adding photo-level QuickActionsModal (that requires full photo objects from `listWaves`; wave-level context menu is sufficient)
- Changing UngroupedPhotosCard behavior (it already fetches page 0 on mount with its own batch)

## Decisions

### D1: Start `pageNumber` at -1, first `handleLoadMore` fetches page 0

**Choice**: Initialize `pageNumber` to `-1`. When `handleLoadMore` fires, it computes `nextPage = -1 + 1 = 0`, fetches page 0 with the component's batch UUID, and deduplicates results against existing photos by `id`.

**Why not fetch page 0 on mount?** That would always fire a network request even if `initialPhotos` already cover the full content. Starting at `-1` defers the fetch until the user actually scrolls — lazy pagination. For waves with few photos where `initialPhotos` is all there is, `onEndReached` may fire immediately and the page-0 fetch will return `noMoreData: true`, which is correct.

**Alternatives considered:**
- Remove pagination from WaveCard entirely — rejected because the ungrouped card also uses WavePhotoStrip with pagination and both should share the same logic.
- Fetch page 0 on mount via `useEffect` — rejected because it doubles network traffic for all wave cards on initial render.

### D2: Deduplicate by photo ID using a Set

**Choice**: After fetching page 0 (or any page), collect existing photo IDs into a `Set`, filter out duplicates from the fetched batch, then append only new photos.

**Why**: `initialPhotos` (from `listWaves`) may overlap with page 0 of `feedForWave` since they cover the same first N photos. A Set-based dedup is O(n) and straightforward.

### D3: `onPhotoLongPress` callback prop on WavePhotoStrip

**Choice**: Add optional `onPhotoLongPress` prop. Wrap each thumbnail `CachedImage` in a `Pressable`. On long press, call `onPhotoLongPress(item)` where `item` is the photo object. WaveCard passes `() => onLongPress(wave)` — the same wave-level context menu action.

**Why not photo-level preview?** The `listWaves` query only returns `{ id, thumbUrl }` — not enough for `QuickActionsModal`. Expanding the query is a backend change outside scope. The wave context menu is the right action here.

## Risks / Trade-offs

- **Page 0 fetch after initial render may briefly show a loading spinner** → Acceptable; the spinner is at the end of the strip and won't shift existing thumbnails.
- **Dedup relies on photo IDs being consistent between `listWaves` and `feedForWave`** → Both queries return the same `id` field from the same database, so this is safe.
