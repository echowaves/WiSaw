# Design: Fix Wave List Sorting

## Background

### Backend `listWaves` Resolver

The backend (echowaves/WiSaw.cdk) `listWaves` resolver supports:

```
Filter:  ILIKE on 'name' AND 'description' columns (when searchTerm provided)
Sort:    updatedAt, name, photosCount (each ASC or DESC)
Default: updatedAt DESC
```

### Current Client Pattern

Three components call `listWaves`:

```
┌──────────────────────────────────────────────────────────────────┐
│                       listWaves GraphQL Query                    │
│        (shared reducer, accepts optional searchTerm param)       │
├───────────────────┬──────────────────┬────────────────────────────┤
│   WavesHub        │ WaveSelectorModal│   MergeWaveModal           │
│   (screens/       │ (components/     │   (components/             │
│    WavesHub)      │    WaveSelector) │    MergeWaveModal)         │
├───────────────────┼──────────────────┼────────────────────────────┤
│ waves (state)     │ waves (state)    │ waves (state)              │
│   ↓               │   ↓              │   ↓                        │
│ filteredWaves     │ filteredWaves    │ filteredWaves              │
│ = sort(waves,     │ = waves          │ = waves.filter(waveUuid    │
│   createdAt DESC) │                  │   !== sourceWave)          │
│   ⚠️ WRONG FIELD   │   ✅ correct     │   ✅ correct (UI only)      │
└───────────────────┴──────────────────┴────────────────────────────┘
```

### The Bug

WavesHub's `filteredWaves` memo sorts by `createdAt`, but the backend sorts by `updatedAt`:

```js
// src/screens/WavesHub/index.js — current (BUGGY)
const filteredWaves = useMemo(() => {
    return [...waves].sort((a, b) => {
      const dateA = a?.createdAt ? new Date(a.createdAt).getTime() : 0
      const dateB = b?.createdAt ? new Date(b.createdAt).getTime() : 0
      return dateB - dateA
    })
}, [waves])
```

This overrides the backend's sort in two scenarios:

| Scenario | Backend Returns | Client Shows | Mismatch? |
|----------|----------------|--------------|-----------|
| No search | `updatedAt` DESC | `createdAt` DESC | ✅ YES — different field |
| Search active | relevance order | `createdAt` DESC | ✅ YES — relevance destroyed |

### Fix

Remove the `filteredWaves` useMemo and use `waves` directly in the FlatList:

```js
// Before:
<FlatList data={filteredWaves} ... />

// After:
<FlatList data={waves} ... />
```

This matches the pattern already used by `WaveSelectorModal`:

```js
// src/components/WaveSelectorModal/index.js — already correct
const filteredWaves = waves  // no filtering, no sorting
...
<FlatList data={filteredWaves} ... />  // uses filteredWaves which is just waves
```

### MergeWaveModal Exception

The source-wave exclusion filter is a legitimate UI concern and should stay:

```js
// src/components/MergeWaveModal/index.js — keep this
const filteredWaves = waves.filter(w => w.waveUuid !== sourceWave?.waveUuid)
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Fixed Architecture                            │
├─────────────────────────────────────────────────────────────────┤
│  User types → debouncedSearch                                   │
│       ↓                                                         │
│  listWaves(uuid, searchTerm) ← single query, backend handles    │
│       ↓                                                         │
│  setWaves(data.waves) ← use directly, no client sort/filter     │
│       ↓                                                         │
│  <FlatList data={waves} />                                      │
└─────────────────────────────────────────────────────────────────┘
```

## Files Changed

- `src/screens/WavesHub/index.js` — Remove `filteredWaves` useMemo, use `waves` directly
