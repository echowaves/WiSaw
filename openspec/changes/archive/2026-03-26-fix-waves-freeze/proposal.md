## Why

Navigating to the Waves list screen sometimes causes the app to freeze, requiring a restart. The freeze is caused by a double-fire of the data-fetching logic on first mount: both `useEffect([debouncedSearch])` and `useFocusEffect` trigger `loadWaves` simultaneously. The `if (loading) return` guard fails because `loading` is a stale closure value (not in `useCallback` dependencies), so both calls proceed. Each call fetches the waves list and then fires 50+ parallel `feedForWave` thumbnail queries via `fetchWaveThumbnails`, resulting in 100+ concurrent GraphQL requests that saturate the JS thread.

Critically, the entire `fetchWaveThumbnails` N+1 loop is unnecessary — the `listWaves` GraphQL query's `Wave` type already has a `photos: [String]` field containing thumbnail URLs, but the query simply doesn't request it.

## What Changes

- Add `photos` field to the `listWaves` GraphQL query so thumbnail URLs are returned inline with each wave
- Remove `fetchWaveThumbnails` entirely — no more N+1 `feedForWave` queries
- Update `WaveCard` to use `wave.photos` (array of URL strings) instead of `wave.thumbnails` (array of objects with `.thumbUrl`)
- Eliminate the double-fire by skipping the `debouncedSearch` effect on initial mount (use a ref to detect first render)
- Replace the `loading` state guard with a `useRef` flag so concurrent calls are reliably prevented regardless of closure staleness

## Capabilities

### New Capabilities

_None_

### Modified Capabilities

- `wave-hub`: Fix the "Waves List Focus Refresh" requirement to prevent concurrent duplicate fetches, and eliminate N+1 thumbnail fetching by using the `photos` field from `listWaves`

## Impact

- `src/screens/Waves/reducer.js` — add `photos` field to `listWaves` GraphQL query
- `src/screens/WavesHub/reducer.js` — remove `fetchWaveThumbnails` function
- `src/screens/WavesHub/index.js` — remove thumbnail fetch loop from `loadWaves`, add mount-skip ref for debounce effect, replace `loading` state guard with ref
- `src/components/WaveCard/index.js` — use `wave.photos` (URL strings) instead of `wave.thumbnails` (objects with `.thumbUrl`)
