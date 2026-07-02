# Fix Waves Search Stale Closure

## Problem

The `handleRefresh` callback in WavesHub captures `debouncedSearch` from its closure scope but `debouncedSearch` is **not in the `useCallback` dependency array**. This means `handleRefresh` always reads the initial empty string value, even after the user types a search query.

```
┌──────────────────────────────────────────────────────────────┐
│                    Stale Closure Chain                        │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  useEffect(() => {                                            │
│    handleRefresh()          ← fires when debouncedSearch      │
│  }, [debouncedSearch])        changes ✓                       │
│                                                               │
│    ↓ calls                                                    │
│                                                               │
│  const handleRefresh = useCallback(async () => {              │
│    ...                                                       │
│    await loadWaves(0, newBatch, true, debouncedSearch)       │
│                                    ↑ STALE: always ''        │
│  }, [loadWaves])              ← debouncedSearch not in deps!  │
│                                                               │
│    ↓ passes                                                   │
│                                                               │
│  const loadWaves = useCallback(async (...) => {              │
│    await reducer.listWaves({ ..., searchTerm })               │
│  }, [uuid])                                                   │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

**Result**: User types in search → useEffect fires → handleRefresh runs → `debouncedSearch` is `''` → backend receives empty search → no actual search happens. The search input appears to do nothing.

## Solution

Add `debouncedSearch` to `handleRefresh`'s `useCallback` dependency array so the closure is updated whenever the debounced search value changes.

## Impact

- **Files changed**: `src/screens/WavesHub/index.js` (add `debouncedSearch` to `handleRefresh` deps)
- **No backend changes required**
