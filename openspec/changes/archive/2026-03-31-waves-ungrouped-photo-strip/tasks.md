## 1. Reducer — add requestUngroupedPhotos

- [x] 1.1 Add `requestUngroupedPhotos({ uuid, pageNumber, batch })` function to `src/screens/Waves/reducer.js` using the `feedForUngrouped` GraphQL query, returning `{ photos, batch, noMoreData }`

## 2. WavePhotoStrip component

- [x] 2.1 Create `src/components/WavePhotoStrip/index.js` — horizontal FlatList of square CachedImage thumbnails (80x80), accepts `initialPhotos`, `fetchFn(pageNumber, batch)`, and `theme`
- [x] 2.2 Add pagination state (`pageNumber`, `batch`, `noMoreData`, `loading`) — call `fetchFn` on `onEndReached`, append results, show `ActivityIndicator` as `ListFooterComponent` while loading
- [x] 2.3 Handle empty state — show FontAwesome5 `water` placeholder icon when no photos and no `fetchFn`

## 3. UngroupedPhotosCard component

- [x] 3.1 Create `src/components/UngroupedPhotosCard/index.js` — card with accent background (`MAIN_COLOR` at 10% opacity), dashed border, title "Ungrouped Photos (N)", and a `WavePhotoStrip` using `requestUngroupedPhotos` as `fetchFn`
- [x] 3.2 Add "Auto Group Into Waves" button that calls `emitAutoGroup(ungroupedCount)`, with subtitle "You can fine-tune waves later"
- [x] 3.3 Fetch page 0 of ungrouped photos on mount to populate the strip

## 4. Refactor WaveCard to use WavePhotoStrip

- [x] 4.1 Replace the static 4-photo collage in `src/components/WaveCard/index.js` with `WavePhotoStrip`, passing `wave.photos` as `initialPhotos` and a curried `fetchWavePhotos(waveUuid)` as `fetchFn`
- [x] 4.2 Add `fetchWavePhotos` import from WaveDetail reducer (already exports it)

## 5. Wire UngroupedPhotosCard into WavesHub

- [x] 5.1 In `src/screens/WavesHub/index.js`, import `UngroupedPhotosCard` and render it as `ListHeaderComponent` on the FlatList when `ungroupedCount > 0`
- [x] 5.2 Pass `ungroupedCount`, `uuid`, and `theme` to `UngroupedPhotosCard`

## 6. Verification

- [x] 6.1 Verify no import errors or rendering issues across modified files
