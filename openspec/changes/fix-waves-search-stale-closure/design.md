# Design: Fix Waves Search Stale Closure

## Root Cause Analysis

### The Closure Chain

```
useEffect  ──────▶  handleRefresh  ──────▶  loadWaves
   ↓                    ↓                      ↓
[debouncedSearch]    [loadWaves]             [uuid]
                     reads: debouncedSearch  reads: searchTerm param
                     (NOT in deps!)
```

The `useEffect` correctly triggers on `debouncedSearch` change and calls `handleRefresh()`. But `handleRefresh` is wrapped in `useCallback` with only `[loadWaves]` as dependencies — it never gets recreated when `debouncedSearch` changes.

When `handleRefresh` was first created (initial render, `debouncedSearch = ''`), it captured `''` in its closure. All subsequent calls — even though the effect fires — use that stale `''` value.

### Current Code (Buggy)

```js
// src/screens/WavesHub/index.js — line ~264

const handleRefresh = useCallback(async () => {
    // ...
    await loadWaves(0, newBatch, true, debouncedSearch || undefined)
                        // ^^^^^^^^^^^^^^ STALE: always ''
}, [loadWaves])  // ← debouncedSearch NOT here
```

### Fixed Code

```js
const handleRefresh = useCallback(async () => {
    // ...
    await loadWaves(0, newBatch, true, debouncedSearch || undefined)
}, [loadWaves, debouncedSearch])  // ← added debouncedSearch
```

### Why This Works

1. User types → `searchText` updates → `useDebouncedSearch` debounces → `debouncedSearch` changes
2. `useEffect(() => handleRefresh(), [debouncedSearch])` fires
3. `handleRefresh` has `debouncedSearch` in its deps, so React recreates it with the **current** `debouncedSearch` value
4. `loadWaves` is called with the correct search term

### Dependency Chain Visualization

```
Before fix:
  debouncedSearch ──▶ useEffect (recreates on change)
                      └── calls handleRefresh ──┐
                                                ├── reads stale debouncedSearch ('')
                                                └── handleRefresh NOT recreated (missing from deps)

After fix:
  debouncedSearch ──▶ useEffect (recreates on change)
                      └── calls handleRefresh ──┐
                                                  ├── reads current debouncedSearch ✅
                                                  └── handleRefresh RECREATED on change ✅
```

### No Side Effects

Adding `debouncedSearch` to `handleRefresh`'s deps does not create a cycle because:
- `handleRefresh` does NOT change `debouncedSearch` (it's derived from `searchText` via hook)
- `loadWaves` does not depend on `debouncedSearch` (it receives it as a parameter)
- The `useEffect` already depends on `debouncedSearch` — no new coupling introduced

### Files Changed

- `src/screens/WavesHub/index.js` — Add `debouncedSearch` to `handleRefresh` dependency array
