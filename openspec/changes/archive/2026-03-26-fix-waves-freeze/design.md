## Context

WavesHub loads wave data via two triggers that both fire on first mount: `useEffect([debouncedSearch])` (initial value `""`) and `useFocusEffect`. The `loadWaves` function has a `if (loading) return` guard using state, but `loading` is not in the `useCallback` dependency array, making the guard permanently stale. After fetching the waves list, `loadWaves` fires a parallel `feedForWave` query per wave to get thumbnails via `fetchWaveThumbnails` — with 50+ waves, this means 50+ concurrent GraphQL requests per invocation, doubled by the race to 100+.

Critically, this entire thumbnail-fetching N+1 loop is unnecessary. The `Wave` GraphQL type already includes a `photos: [String]` field containing thumbnail URLs, but the `listWaves` query in `Waves/reducer.js` simply doesn't request it. Adding that one field eliminates the need for `fetchWaveThumbnails` entirely.

## Goals / Non-Goals

**Goals:**
- Eliminate the N+1 thumbnail fetching by adding `photos` to the `listWaves` query
- Remove the now-unnecessary `fetchWaveThumbnails` function and its call site
- Update `WaveCard` to use the inline `photos` array instead of the separately-fetched `thumbnails`
- Prevent concurrent duplicate `loadWaves` calls on mount and focus
- Ensure the loading guard reliably prevents overlapping fetches

**Non-Goals:**
- Changing the backend schema (only the client-side query is updated)
- Adding new caching behavior
- Optimizing the `feedForWave` query itself (it's being removed from this flow)

## Decisions

### 1. Add `photos` to `listWaves` query and remove `fetchWaveThumbnails`

The `listWaves` query in `src/screens/Waves/reducer.js` currently requests `waveUuid, name, description, createdAt, updatedAt, createdBy, photosCount`. Add `photos` to the selection set. This returns an array of thumbnail URL strings per wave, eliminating the need for separate `feedForWave` calls.

Remove `fetchWaveThumbnails` from `WavesHub/reducer.js` and the `Promise.all(newWaves.map(fetchWaveThumbnails))` loop from `loadWaves` in `WavesHub/index.js`.

**Why this works**: The backend already resolves `photos` on the `Wave` type. The field was simply never requested by the client.

### 2. Update `WaveCard` to use `wave.photos` directly

`WaveCard` currently renders a 4-photo collage using `wave.thumbnails` — an array of `{id, thumbUrl}` objects populated by `fetchWaveThumbnails`. After the change, it should use `wave.photos` — an array of URL strings returned directly from `listWaves`. The `CachedImage` source changes from `thumb.thumbUrl` to the URL string itself.

### 3. Skip `debouncedSearch` effect on initial mount

Add a `hasMountedRef = useRef(false)` that starts `false`. The `useEffect([debouncedSearch])` checks this ref: on first render it sets it to `true` and returns without calling `loadWaves`. This lets `useFocusEffect` be the sole mount trigger.

**Why not remove the `debouncedSearch` effect entirely?**: It's still needed for subsequent search interactions — when the user types, the debounce timer fires and needs to reset pagination + fetch. Only the initial mount invocation is redundant.

### 4. Use `useRef` for the loading guard

Replace `if (loading) return` with a `loadingRef = useRef(false)` check. Refs are mutable and not affected by closure staleness — `loadingRef.current` always reflects the latest value regardless of when the callback was created.

Keep the `loading` state for UI purposes (showing the progress bar), but use the ref as the concurrency guard.

## Risks / Trade-offs

- [Risk] `hasMountedRef` pattern is fragile if effects are reordered → Mitigated by the `loadingRef` guard as a second layer — even if both fire, only one proceeds.
- [Trade-off] Keeping both `loading` state and `loadingRef` ref → Slightly more state, but cleanly separates UI concern (progress bar) from concurrency concern (guard).
- [Trade-off] `photos` array may contain more than 4 URLs → `WaveCard` already slices to 4 for the collage, so extra URLs are harmless.
