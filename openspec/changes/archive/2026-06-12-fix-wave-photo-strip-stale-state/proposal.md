## Why

When `handleRefresh()` in WavesHub is called (e.g., after auto-grouping or upload completion), it triggers `loadWaves()` which fetches fresh data from the server and updates the `waves` Jotai state. The `WaveCard` components re-render with new `wave.photos` arrays.

However, `WavePhotoStrip` ignores the new `initialPhotos` prop because it initializes its internal state with `useState(initialPhotos)` — which only uses the value on first mount. On subsequent prop updates, the internal `photos` state becomes stale and never reflects the fresh data.

Timeline example:
1. Initial load: Wave A has photos [p1, p2, p3] → WavePhotoStrip photos state = [p1, p2, p3]
2. User uploads pNew to Wave A → handleRefresh() → listWaves returns Wave A with [p1, p2, p3, pNew]
3. WaveCard re-renders with wave.photos = [p1, p2, p3, pNew]
4. WavePhotoStrip receives initialPhotos = [p1, p2, p3, pNew] but useState ignores it
5. UI still shows only [p1, p2, p3] — pNew never appears until user navigates away and back

This is a stale state bug that causes the photo strip to never reflect server data after the initial render, even though the parent component has received fresh data.

## What Changes

- Add a `useEffect` in `WavePhotoStrip` to sync the internal `photos` state when `initialPhotos` prop changes
- Add a "Non-Stale Photos" requirement to the wave-hub spec

## Impact

- **Files modified**:
  - `src/components/WavePhotoStrip/index.js` — add 3 lines (useEffect to sync initialPhotos)
- **Files to update**:
  - `openspec/specs/wave-hub/spec.md` — add Non-Stale Photos requirement
- **No other components affected** — this is a focused fix
