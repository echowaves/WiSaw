## 1. Add `photos` Field to `listWaves` Query

- [x] 1.1 In `src/screens/Waves/reducer.js`, add `photos` to the `listWaves` GraphQL query selection set (alongside `waveUuid`, `name`, `photosCount`, etc.). This returns thumbnail URLs inline with each wave.

## 2. Remove `fetchWaveThumbnails` and N+1 Loop

- [x] 2.1 In `src/screens/WavesHub/reducer.js`, remove the `fetchWaveThumbnails` function and its `feedForWave` import/query.
- [x] 2.2 In `src/screens/WavesHub/index.js`, remove the `fetchWaveThumbnails` import and the `Promise.all(newWaves.map(fetchWaveThumbnails))` loop from `loadWaves`. Use the waves from the `listWaves` response directly (they now include `photos`).

## 3. Update `WaveCard` to Use `wave.photos`

- [x] 3.1 In `src/components/WaveCard/index.js`, update the collage rendering to use `wave.photos` (array of URL strings) instead of `wave.thumbnails` (array of `{id, thumbUrl}` objects). The `CachedImage` source should use the URL string directly.

## 4. Add Ref-Based Loading Guard

- [x] 4.1 Add `const loadingRef = useRef(false)` in WavesHub. In `loadWaves`, replace `if (loading) return` with `if (loadingRef.current) return`, set `loadingRef.current = true` at the start and `loadingRef.current = false` in the `finally` block. Keep `setLoading(true)` / `setLoading(false)` for UI updates.

## 5. Skip Debounced Search Effect on Mount

- [x] 5.1 Add `const hasMountedRef = useRef(false)` in WavesHub. In the `useEffect([debouncedSearch])` body, check `if (!hasMountedRef.current) { hasMountedRef.current = true; return; }` before calling `loadWaves`. This lets `useFocusEffect` be the sole mount trigger.
