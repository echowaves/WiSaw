## Context

The `listWaves` GraphQL query returns paginated results (20 per page). WavesHub has infinite scroll and client-side search filtering. MergeWaveModal and WaveSelectorModal fetch only page 0 with client-side filtering. The backend now supports a `searchTerm` parameter on `listWaves` for server-side `ILIKE` matching on wave names.

Current data flow:
```
Component → listWaves({ pageNumber, batch, uuid, sortBy, sortDirection })
                                                    ↑ no searchTerm
```

Target data flow:
```
Component → listWaves({ pageNumber, batch, uuid, sortBy, sortDirection, searchTerm })
                                                                          ↑ NEW
```

## Goals / Non-Goals

**Goals:**
- All waves reachable in every wave picker (not capped at 20)
- Server-side search so users can find waves by name regardless of page position
- Debounced search (300ms) for responsive UX without excessive API calls
- Empty search returns all waves (paginated)

**Non-Goals:**
- Full-text search on wave descriptions (just name matching, as backend implements)
- Offline search / caching strategy
- Changes to the backend API (already deployed)
- Adding search to other screens beyond the three identified

## Decisions

### 1. Single shared `listWaves` function with optional `searchTerm`

Add `searchTerm` as an optional parameter to the existing `listWaves` in `src/screens/Waves/reducer.js`. All three consumers call the same function — one change propagates everywhere.

**Alternative**: Separate `searchWaves` function. Rejected — unnecessary duplication since the backend uses the same query.

### 2. Debounce at 300ms in consumers, not in the reducer

Each component manages its own debounce timer (via `setTimeout`/`clearTimeout` in a `useEffect`). The reducer stays a plain async function. This keeps the API layer stateless and lets each consumer control timing.

**Alternative**: Debounce in the reducer using a shared utility. Rejected — reducer should be a thin data layer; UI timing belongs in components.

### 3. Reset pagination on search term change

When `searchTerm` changes (after debounce), reset `pageNumber` to 0 and generate a new `batch` UUID. This ensures clean paginated results for the new search scope.

### 4. Add `onEndReached` pagination to both modals

Both MergeWaveModal and WaveSelectorModal already use `FlatList`. Add `onEndReached` + `onEndReachedThreshold={0.5}` and pagination state (`pageNumber`, `batch`, `noMoreData`) mirroring WavesHub's existing pattern.

**Alternative**: Load all waves in modals (large page size). Rejected — doesn't scale and is inconsistent with the rest of the app.

### 5. Remove client-side filter, rely on server

Once server-side search is wired up, the local `.filter()` calls become redundant. Remove them to avoid confusing behavior where client filter and server results could conflict.

**Alternative**: Keep client filter as instant preview while debounce settles. This adds complexity for marginal benefit — 300ms is fast enough. Rejected for simplicity.

## Risks / Trade-offs

- **[Network latency]** → Server search adds round-trip vs instant client filter. Mitigated by 300ms debounce (batches keystrokes) and showing a loading indicator during fetch.
- **[Empty flash]** → Resetting wave list on each search could flash empty. Mitigated by keeping previous results visible until new results arrive (replace on success, not on request start).
- **[Backend search quality]** → `ILIKE` matching is basic (no fuzzy/typo tolerance). Acceptable for wave names which are short user-created strings.
